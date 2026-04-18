import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, Search, SortDesc } from "lucide-react";
import { fetchRepos } from "@/lib/github-api";
import type { GitHubRepo } from "@/lib/github-api";

type SortKey = "updated" | "stars" | "name" | "language";

const langColors: Record<string, string> = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
  HTML: "#e34c26", CSS: "#563d7c", Dart: "#00B4AB", Kotlin: "#A97BFF",
  Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8",
  PowerShell: "#012456", Shell: "#89e050", Lua: "#000080", PHP: "#4F5D95",
};

export function RepositoriesPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("updated");

  useEffect(() => {
    fetchRepos()
      .then((r) => setRepos(r))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = repos
    .filter((r) => {
      const q = search.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.language || "").toLowerCase().includes(q) ||
        r.topics.some((t) => t.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "stars": return b.stargazers_count - a.stargazers_count;
        case "name": return a.name.localeCompare(b.name);
        case "language": return (a.language || "").localeCompare(b.language || "");
        default: return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort();

  if (loading) {
    return <div style={{ padding: "64px 32px", textAlign: "center", color: "#57606a" }}>Loading repositories...</div>;
  }

  return (
    <>
      <section style={{ padding: "64px 32px 48px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 300, color: "#57606a", lineHeight: 1.3, marginBottom: 8 }}>
          All Repositories
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "#2d333b", marginBottom: 24 }}>
          {repos.length} public repositories from <a href={`https://github.com/ChidcGithub`} target="_blank" rel="noopener noreferrer">GitHub</a>.
        </p>

        {/* Search + Sort */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2 px-3" style={{
            height: 36, borderRadius: 6, border: "1px solid #d0d7de", backgroundColor: "#fff", minWidth: 240,
          }}>
            <Search size={14} color="#57606a" />
            <input
              type="text"
              placeholder="Search repos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 14, color: "#2d333b", width: "100%", background: "transparent" }}
            />
          </div>

          <div className="flex items-center gap-2">
            <SortDesc size={14} color="#57606a" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              style={{
                border: "1px solid #d0d7de", borderRadius: 6, padding: "6px 12px",
                fontSize: 13, color: "#2d333b", backgroundColor: "#fff", cursor: "pointer",
              }}
            >
              <option value="updated">Recently Updated</option>
              <option value="stars">Most Stars</option>
              <option value="name">Name A-Z</option>
              <option value="language">Language</option>
            </select>
          </div>
        </div>

        {/* Language filter */}
        {languages.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <span style={{ fontSize: 12, color: "#57606a", lineHeight: "24px" }}>Languages:</span>
            {languages.map((lang) => (
              <span
                key={lang}
                className="flex items-center gap-1"
                style={{
                  fontSize: 12, color: "#57606a", padding: "3px 10px",
                  backgroundColor: "#f5f6f8", border: "1px solid #d0d7de",
                  borderRadius: 12,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: langColors[lang || ""] || "#888", display: "inline-block" }} />
                {lang} ({repos.filter((r) => r.language === lang).length})
              </span>
            ))}
          </div>
        )}

        {/* Repo list */}
        <div className="flex flex-col gap-0">
          {filtered.map((repo) => (
            <Link
              key={repo.name}
              to={`/p/${repo.name}`}
              className="flex items-center justify-between no-underline hover:no-underline"
              style={{ padding: "14px 0", borderBottom: "1px solid #e5e7eb" }}
            >
              <div className="min-w-0 flex-1 mr-4">
                <span className="font-medium" style={{ fontSize: 15, color: "#0969da" }}>
                  {repo.name}
                </span>
                {repo.description && (
                  <div style={{ fontSize: 13, color: "#57606a", marginTop: 3 }}>
                    {repo.description}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3 flex-shrink-0" style={{ fontSize: 12, color: "#57606a" }}>
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: langColors[repo.language] || "#888", display: "inline-block" }} />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star size={11} /> {repo.stargazers_count}
                </span>
                {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" && (
                  <span>{repo.license.spdx_id}</span>
                )}
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "32px 0", textAlign: "center", color: "#57606a", fontSize: 14 }}>
              No repositories found.
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px", borderTop: "1px solid #d0d7de", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, color: "#57606a" }}>
        <span>&copy; 2025 Chidc</span>
        <span style={{ color: "#d0d7de" }}>|</span>
        <a href="https://github.com/ChidcGithub" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span style={{ color: "#d0d7de" }}>|</span>
        <a href="mailto:chidcout@outlook.com">Contact</a>
      </footer>
    </>
  );
}
