import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import { ArrowLeft, ExternalLink, Star, Clock, RefreshCw } from "lucide-react";
import { fetchRepos, fetchReadme, clearCacheKey } from "@/lib/github-api";
import type { GitHubRepo } from "@/lib/github-api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { toast } from "sonner";

const langColors: Record<string, string> = {
  Python: "#3572A5", JavaScript: "#f1e05a", TypeScript: "#3178c6",
  HTML: "#e34c26", CSS: "#563d7c", Dart: "#00B4AB", Kotlin: "#A97BFF",
  Rust: "#dea584", Java: "#b07219", "C++": "#f34b7d", Go: "#00ADD8",
  PowerShell: "#012456", Shell: "#89e050",
};

export function ProjectPage() {
  const { name } = useParams<{ name: string }>();
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProject = useCallback(async (force = false) => {
    if (!name) return;

    setLoading(true);
    try {
      const repos = await fetchRepos(force);
      const found = repos.find((r) => r.name === name);
      if (found) {
        setRepo(found);
        setReadmeLoading(true);
        try {
          const md = await fetchReadme("ChidcGithub", name, force);
          setReadme(md);
        } catch (err: unknown) {
          setReadme(null);
          const message = err instanceof Error ? err.message : "";
          const status = message.match(/(\d{3})/)?.[1];
          if (status === "403") {
            toast.warning("Failed to load README: access denied (403)", {
              description: "This repository may be private or rate-limited.",
              duration: 5000,
            });
          } else if (status === "404") {
            // 404 means no README, not an error
          } else {
            toast.warning("Failed to load README", {
              description: message || "An unexpected error occurred.",
              duration: 5000,
            });
          }
        } finally {
          setReadmeLoading(false);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [name]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleRefresh = () => {
    if (!name) return;
    setRefreshing(true);
    clearCacheKey("repos");
    clearCacheKey(`readme-ChidcGithub-${name}`);
    loadProject(true);
  };

  if (loading) {
    return <div style={{ padding: "64px 32px", textAlign: "center", color: "#57606a" }}>Loading project...</div>;
  }

  if (!repo) {
    return (
      <div style={{ padding: "64px 32px", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, color: "#2d333b", marginBottom: 12 }}>Repository not found</h2>
        <Link to="/repos" style={{ color: "#0969da", fontSize: 14 }}>&larr; Back to repositories</Link>
      </div>
    );
  }

  // langInfo available via getLanguageInfo(repo) in render

  return (
    <>
      {/* Project header */}
      <section style={{ padding: "64px 32px 24px" }}>
        <Link to="/repos" className="inline-flex items-center gap-1 mb-4" style={{ fontSize: 13, color: "#0969da" }}>
          <ArrowLeft size={14} /> Back to repositories
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <h1 style={{ fontSize: 32, fontWeight: 300, color: "#57606a", lineHeight: 1.3, margin: 0 }}>
              {repo.name}
            </h1>
            <button
              onClick={handleRefresh}
              disabled={refreshing || readmeLoading}
              style={{
                background: "none",
                border: "1px solid #d0d7de",
                borderRadius: 6,
                padding: "4px 8px",
                cursor: refreshing || readmeLoading ? "wait" : "pointer",
                color: "#57606a",
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
                opacity: refreshing || readmeLoading ? 0.6 : 1,
              }}
              title="Refresh data"
            >
              <RefreshCw size={14} className={(refreshing || readmeLoading) ? "animate-spin" : ""} />
            </button>
          </div>
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 no-underline hover:no-underline"
            style={{ color: "#57606a", padding: "6px" }}
            title="View on GitHub"
          >
            <ExternalLink size={18} />
          </a>
        </div>
        {repo.description && (
          <p className="mt-2" style={{ fontSize: 15, color: "#57606a", lineHeight: 1.5 }}>
            {repo.description}
          </p>
        )}

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-4 mt-5" style={{ fontSize: 13, color: "#57606a" }}>
          {repo.language && (
            <span className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: langColors[repo.language] || "#888", display: "inline-block" }} />
              {repo.language}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Star size={13} /> {repo.stargazers_count} stars
          </span>
          {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" && (
            <span>{repo.license.spdx_id} License</span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={13} /> Updated {formatDate(repo.updated_at)}
          </span>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {repo.topics.map((topic) => (
              <span
                key={topic}
                style={{
                  fontSize: 12, color: "#0969da", backgroundColor: "#ddf4ff",
                  padding: "3px 10px", borderRadius: 12,
                }}
              >
                {topic}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* README content */}
      <section style={{ padding: "0 32px 48px", borderTop: "1px solid #d0d7de" }}>
        {readmeLoading ? (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#57606a" }}>Loading README...</div>
        ) : readme ? (
          <div style={{ paddingTop: 24 }}>
            <MarkdownRenderer markdown={readme} />
          </div>
        ) : (
          <div style={{ padding: "32px 0", textAlign: "center", color: "#57606a" }}>
            No README available for this repository.
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ padding: "32px", borderTop: "1px solid #d0d7de", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontSize: 12, color: "#57606a" }}>
        <span>&copy; 2026 Chidc</span>
        <span style={{ color: "#d0d7de" }}>|</span>
        <a href="https://github.com/ChidcGithub" target="_blank" rel="noopener noreferrer">GitHub</a>
        <span style={{ color: "#d0d7de" }}>|</span>
        <a href="mailto:chidcout@outlook.com">Contact</a>
      </footer>
    </>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}
