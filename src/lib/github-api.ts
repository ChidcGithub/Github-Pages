const GITHUB_USER = "ChidcGithub";
const GITHUB_API = "https://api.github.com";

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

async function githubFetch(path: string): Promise<unknown> {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) {
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/** Fetch all public repos for the user */
export async function fetchRepos(): Promise<GitHubRepo[]> {
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

  return repos;
}

/** Fetch README content for a repo (returns raw markdown string or null) */
export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    // Try to find README with any extension
    const data = await githubFetch(`/repos/${owner}/${repo}/readme`) as GitHubReadme;
    if (data.content && data.encoding === "base64") {
      // Decode base64 to string
      const binary = atob(data.content);
      // Try to decode as UTF-8
      try {
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return new TextDecoder("utf-8").decode(bytes);
      } catch {
        return binary;
      }
    }
    return null;
  } catch {
    // No README or error
    return null;
  }
}

/** Fetch a README for the default branch specifically */
export async function fetchReadmeForRepo(repo: GitHubRepo): Promise<string | null> {
  return fetchReadme(GITHUB_USER, repo.name);
}

/** Fetch user stats (contribution count, etc.) */
export async function fetchStats(): Promise<GitHubStats> {
  const repos = await fetchRepos();

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

  return {
    totalStars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
    totalRepos: repos.length,
    totalCommits,
    totalPRs: 0, // GitHub doesn't expose this easily via REST API
    totalIssues: 0,
    contributionYears: Array.from(yearsSet).sort((a, b) => b - a),
  };
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

export { GITHUB_USER, GITHUB_API };
