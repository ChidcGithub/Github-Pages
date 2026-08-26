import { getCached, setCached } from "./cache";

const GITHUB_USER = "ChidcGithub";
const GITHUB_API = "https://api.github.com";
const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;

export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  license: { spdx_id: string } | null;
  created_at: string;
  updated_at: string;
  topics: string[];
  size: number;
  default_branch: string;
}

export interface GitHubReadme {
  content: string; // base64
  encoding: string;
}

export interface GitHubStats {
  totalStars: number;
  totalRepos: number;
  totalCommits: number;
  totalPRs: number;
  totalIssues: number;
  contributionYears: number[];
}

export interface RepoLanguage {
  name: string;
  color: string;
}

// Language colors from GitHub
const languageColors: Record<string, string> = {
  Python: "#3572A5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dart: "#00B4AB",
  Kotlin: "#A97BFF",
  Rust: "#dea584",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Shell: "#89e050",
  PowerShell: "#012456",
  Lua: "#000080",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

/**
 * Mirror endpoints for the GitHub REST API.
 * All are raced in parallel; the first valid JSON response wins.
 * Only the official endpoint can carry the auth token — public CORS
 * proxies forward anonymous requests (fine for public data).
 */
interface Mirror {
  name: string;
  build: (path: string) => string;
  auth: boolean;
  /** allorigins /get wraps the payload as { contents: "<json string>" } */
  unwrap?: boolean;
}

const MIRRORS: Mirror[] = [
  { name: "official", auth: true, build: (p) => `${GITHUB_API}${p}` },
  { name: "gh-proxy", auth: false, build: (p) => `https://gh-proxy.com/${GITHUB_API}${p}` },
  { name: "cors.eu", auth: false, build: (p) => `https://cors.eu.org/${GITHUB_API}${p}` },
  { name: "allorigins", auth: false, build: (p) => `https://api.allorigins.win/raw?url=${encodeURIComponent(GITHUB_API + p)}` },
  { name: "allorigins-get", auth: false, unwrap: true, build: (p) => `https://api.allorigins.win/get?url=${encodeURIComponent(GITHUB_API + p)}` },
];

/**
 * README fast path via jsDelivr CDN — has China PoPs, usually the
 * fastest source for ProjectPage. Raced against the API mirrors above.
 */
const JSDELIVR_README_FILES = ["README.md", "Readme.md", "readme.md"];

const WINNER_KEY = "chidc-mirror";
let winnerMirror: string | null = null;

function loadWinner(): string | null {
  if (winnerMirror) return winnerMirror;
  try {
    winnerMirror = localStorage.getItem(WINNER_KEY);
  } catch {
    // storage unavailable
  }
  return winnerMirror;
}

function saveWinner(name: string): void {
  winnerMirror = name;
  try {
    localStorage.setItem(WINNER_KEY, name);
  } catch {
    // storage unavailable
  }
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJson(url: string, mirror: Mirror, timeoutMs: number): Promise<unknown> {
  const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
  if (mirror.auth && GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }
  const res = await fetchWithTimeout(url, { headers }, timeoutMs);
  // Keep the status code in the message so callers can match on 403/404 etc.
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  if (mirror.unwrap && data && typeof data === "object" && "contents" in data) {
    return JSON.parse((data as { contents: string }).contents);
  }
  return data;
}

async function githubFetch(path: string): Promise<unknown> {
  // Fast path: reuse the mirror that won previously (short timeout as health check)
  const preferredName = loadWinner();
  if (preferredName) {
    const preferred = MIRRORS.find((m) => m.name === preferredName);
    if (preferred) {
      try {
        return await fetchJson(preferred.build(path), preferred, 4000);
      } catch {
        // Preferred mirror is slow or down — fall through and race all of them
      }
    }
  }

  // Race all mirrors in parallel; first valid response wins
  try {
    return await Promise.any(
      MIRRORS.map(async (mirror) => {
        const data = await fetchJson(mirror.build(path), mirror, 8000);
        saveWinner(mirror.name);
        console.info(`[github-api] fastest mirror: ${mirror.name}`);
        return data;
      })
    );
  } catch (e) {
    if (e instanceof AggregateError) {
      // Surface the most meaningful status (e.g. 404 = no README, 403 = rate limited)
      const meaningful =
        e.errors
          .map((err) => (err instanceof Error ? err.message : ""))
          .find((msg) => /\d{3}/.test(msg)) ?? "";
      throw new Error(meaningful || "All GitHub mirrors failed");
    }
    throw e;
  }
}

/** Fetch all public repos for the user */
export async function fetchRepos(forceRefresh = false): Promise<GitHubRepo[]> {
  if (!forceRefresh) {
    const cached = getCached<GitHubRepo[]>("repos");
    if (cached) return cached;
  }

  const repos: GitHubRepo[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const data = await githubFetch(`/users/${GITHUB_USER}/repos?per_page=100&page=${page}&sort=updated&direction=desc`);
    const arr = data as GitHubRepo[];
    if (arr.length === 0) hasMore = false;
    repos.push(...arr);
    if (arr.length < 100) hasMore = false;
    page++;
  }

  setCached("repos", repos);
  return repos;
}

/**
 * Fetch README content for a repo (returns raw markdown string or null).
 * Races the GitHub API (via mirrors) against jsDelivr CDN copies for the
 * common README file names — jsDelivr usually wins from China.
 */
export async function fetchReadme(
  owner: string,
  repo: string,
  forceRefresh = false,
  branch?: string
): Promise<string | null> {
  const cacheKey = `readme-${owner}-${repo}`;
  if (!forceRefresh) {
    const cached = getCached<string>(cacheKey);
    if (cached !== null) return cached;
  }

  // Attempt 1: GitHub API readme (handles any file name / casing)
  const viaApi = async (): Promise<string> => {
    const data = (await githubFetch(`/repos/${owner}/${repo}/readme`)) as GitHubReadme;
    if (!data.content || data.encoding !== "base64") throw new Error("README has no content");
    const binary = atob(data.content);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    try {
      return new TextDecoder("utf-8").decode(bytes);
    } catch {
      return binary;
    }
  };

  // Attempt 2+: jsDelivr CDN raw copies (needs a known branch)
  const viaJsDelivr = (file: string): Promise<string> =>
    (async () => {
      const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${branch ?? "latest"}/${file}`;
      const res = await fetchWithTimeout(url, {}, 8000);
      if (!res.ok) throw new Error(`jsDelivr error: ${res.status}`);
      const text = await res.text();
      if (!text.trim()) throw new Error("jsDelivr README is empty");
      return text;
    })();

  try {
    const result: string = await Promise.any([
      viaApi(),
      ...(branch ? JSDELIVR_README_FILES.map(viaJsDelivr) : []),
    ]).catch((e) => {
      if (e instanceof AggregateError) {
        const meaningful =
          e.errors
            .map((err) => (err instanceof Error ? err.message : ""))
            .find((msg) => /\d{3}/.test(msg)) ?? "";
        throw new Error(meaningful || "All README sources failed");
      }
      throw e;
    });
    setCached(cacheKey, result);
    return result;
  } catch (e) {
    // No README found — cache the negative result like before
    const message = e instanceof Error ? e.message : "";
    if (/404/.test(message)) {
      setCached(cacheKey, null);
      return null;
    }
    throw e;
  }
}

/** Fetch a README for the default branch specifically */
export async function fetchReadmeForRepo(repo: GitHubRepo): Promise<string | null> {
  return fetchReadme(GITHUB_USER, repo.name, false, repo.default_branch);
}

/** Fetch user stats (contribution count, etc.) */
export async function fetchStats(forceRefresh = false): Promise<GitHubStats> {
  if (!forceRefresh) {
    const cached = getCached<GitHubStats>("stats");
    if (cached) return cached;
  }

  const repos = await fetchRepos(forceRefresh);

  let totalCommits = 0;
  const yearsSet = new Set<number>();

  // Get commits per repo (limited to avoid rate limits)
  for (const repo of repos.slice(0, 20)) {
    try {
      const since = `${new Date().getFullYear() - 1}-01-01T00:00:00Z`;
      const commits = await githubFetch(
        `/repos/${GITHUB_USER}/${repo.name}/commits?author=${GITHUB_USER}&per_page=100&since=${since}`
      ) as { sha: string; commit: { message: string; author: { date: string } } }[];

      totalCommits += commits.length;

      commits.forEach((c) => {
        const year = new Date(c.commit.author.date).getFullYear();
        yearsSet.add(year);
      });
    } catch {
      // Skip repos we can't access
    }
  }

  const stats = {
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalRepos: repos.length,
    totalCommits,
    totalPRs: 0, // GitHub doesn't expose this easily via REST API
    totalIssues: 0,
    contributionYears: Array.from(yearsSet).sort((a, b) => b - a),
  };

  setCached("stats", stats);
  return stats;
}

/** Get language info for a repo */
export function getLanguageInfo(repo: GitHubRepo): { languages: RepoLanguage[]; primary: string; color: string } {
  const primary = repo.language || "Unknown";
  const color = languageColors[primary] || "#888";
  return {
    languages: [{ name: primary, color }],
    primary,
    color,
  };
}

/** Get the GitHub language color for a language name */
export function languageColor(lang: string): string {
  return languageColors[lang] || "#888";
}

export { GITHUB_USER, GITHUB_API };
export { clearCacheKey, clearCache } from "./cache";
