import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Star, GitCommit, ExternalLink, FolderOpen } from "lucide-react";
import { fetchRepos, fetchStats, GITHUB_USER } from "@/lib/github-api";
import type { GitHubRepo } from "@/lib/github-api";

export function HomePage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [stats, setStats] = useState<{ totalStars: number; totalRepos: number; totalCommits: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchRepos(), fetchStats()])
      .then(([r, s]) => {
        setRepos(r);
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const featured = repos.filter((r) => r.stargazers_count >= 1).slice(0, 6);
  const recent = repos.slice(0, 8);

  if (loading) {
    return (
      <div style={{ padding: "80px 32px", textAlign: "center", color: "#57606a", fontSize: 15 }}>
        Loading GitHub data...
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section style={{ padding: "64px 40px 48px" }}>
        <div style={{ maxWidth: 800 }}>
          <h1
            style={{
              fontSize: 52,
              fontWeight: 700,
              color: "#57606a",
              lineHeight: 1.3,
              marginBottom: 16,
            }}
          >
            Chidc
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: "#2d333b", maxWidth: 640, marginBottom: 24 }}>
            Hi, I&apos;m <strong>Chidc</strong> — a full-stack developer based in Changsha, China.
            Currently a high school student passionate about AI/ML, developer tooling,
            and cross-platform applications.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2" style={{ padding: "10px 18px", backgroundColor: "#f6f8fa", borderRadius: 8 }}>
              <Star size={16} color="#57606a" />
              <span style={{ fontSize: 18, fontWeight: 600, color: "#2d333b" }}>{stats?.totalStars ?? 0}</span>
              <span style={{ fontSize: 13, color: "#57606a" }}>Stars</span>
            </div>
            <div className="flex items-center gap-2" style={{ padding: "10px 18px", backgroundColor: "#f6f8fa", borderRadius: 8 }}>
              <FolderOpen size={16} color="#57606a" />
              <span style={{ fontSize: 18, fontWeight: 600, color: "#2d333b" }}>{stats?.totalRepos ?? repos.length}</span>
              <span style={{ fontSize: 13, color: "#57606a" }}>Repos</span>
            </div>
            <div className="flex items-center gap-2" style={{ padding: "10px 18px", backgroundColor: "#f6f8fa", borderRadius: 8 }}>
              <GitCommit size={16} color="#57606a" />
              <span style={{ fontSize: 18, fontWeight: 600, color: "#2d333b" }}>{stats?.totalCommits ?? 0}+</span>
              <span style={{ fontSize: 13, color: "#57606a" }}>Commits</span>
            </div>
          </div>

          <div
            style={{
              borderLeft: "3px solid #0969da",
              backgroundColor: "#f6f8fa",
              padding: "14px 18px",
              borderRadius: "0 6px 6px 0",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#2d333b",
              marginBottom: 20,
            }}
          >
            <strong>Open Source:</strong> {stats?.totalRepos ?? repos.length} public repositories with {stats?.totalStars ?? 0} total stars.
            All code is available on <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer" style={{ color: "#0969da" }}>GitHub</a>.
          </div>

          <p style={{ fontSize: 14, lineHeight: 1.6, color: "#57606a" }}>
            Contact: <a href="mailto:chidcout@outlook.com" style={{ color: "#0969da" }}>chidcout@outlook.com</a> &middot; Location: Changsha, China
          </p>
        </div>
      </section>

      {/* Featured Projects */}
      {featured.length > 0 && (
        <section style={{ padding: "40px 40px 56px", borderTop: "1px solid #d0d7de" }}>
          <div style={{ maxWidth: 800 }}>
            <div
              className="font-medium"
              style={{ fontSize: 12, color: "#57606a", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}
            >
              Featured
            </div>
            <h2 className="font-semibold" style={{ fontSize: 24, lineHeight: 1.3, color: "#2d333b", marginBottom: 24 }}>
              Top Projects
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {featured.map((repo) => (
                <Link
                  key={repo.name}
                  to={`/p/${repo.name}`}
                  className="block bg-white transition-all duration-150"
                  style={{ border: "1px solid #d0d7de", borderRadius: 8, padding: 22 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0969da";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#d0d7de";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold" style={{ fontSize: 15, color: "#0969da", lineHeight: 1.3 }}>{repo.name}</span>
                    <span className="flex items-center gap-1 flex-shrink-0" style={{ fontSize: 13, color: "#57606a" }}>
                      <Star size={13} /> {repo.stargazers_count}
                    </span>
                  </div>
                  {repo.description && (
                    <p className="mt-2" style={{ fontSize: 13.5, lineHeight: 1.55, color: "#57606a" }}>
                      {repo.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4" style={{ borderTop: "1px solid #f0f3f6" }}>
                    <div className="flex items-center gap-2">
                      {repo.language && (
                        <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: "#57606a" }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: getLanguageColor(repo.language), display: "inline-block" }} />
                          {repo.language}
                        </span>
                      )}
                      {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" && (
                        <span style={{ fontSize: 12, color: "#57606a" }}>{repo.license.spdx_id}</span>
                      )}
                    </div>
                    <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#0969da" }}>
                      View README <ExternalLink size={12} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* All Repos */}
      <section style={{ padding: "40px 40px 56px", borderTop: "1px solid #d0d7de" }}>
        <div style={{ maxWidth: 800 }}>
          <h2 className="font-semibold" style={{ fontSize: 24, lineHeight: 1.3, color: "#2d333b", marginBottom: 8 }}>
            Recent Repositories
          </h2>
          <p className="mb-5" style={{ fontSize: 14, color: "#57606a" }}>
            Most recently updated repositories. <Link to="/repos" style={{ color: "#0969da" }}>View all &rarr;</Link>
          </p>

          <div className="flex flex-col gap-0" style={{ borderTop: "1px solid #e5e7eb" }}>
            {recent.map((repo) => (
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
                    <div style={{ fontSize: 13, color: "#57606a", marginTop: 3, lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                      {repo.description}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" style={{ fontSize: 12, color: "#57606a" }}>
                  {repo.language && (
                    <span className="flex items-center gap-1.5">
                      <span
                        style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: getLanguageColor(repo.language), display: "inline-block" }}
                      />
                      {repo.language}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Star size={11} /> {repo.stargazers_count}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "28px 40px",
          borderTop: "1px solid #d0d7de",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 12,
          color: "#57606a",
        }}
      >
        <span>&copy; 2026 Chidc</span>
        <span style={{ color: "#d0d7de" }}>|</span>
        <a href={`https://github.com/${GITHUB_USER}`} target="_blank" rel="noopener noreferrer" style={{ color: "#57606a" }}>GitHub</a>
        <span style={{ color: "#d0d7de" }}>|</span>
        <a href="mailto:chidcout@outlook.com" style={{ color: "#57606a" }}>Contact</a>
      </footer>
    </>
  );
}

function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
    HTML: "#e34c26", CSS: "#563d7c", Dart: "#00B4AB", Kotlin: "#A97BFF",
    Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8",
  };
  return colors[lang] || "#888";
}
