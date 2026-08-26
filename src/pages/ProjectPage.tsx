import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  FileQuestion,
  RefreshCw,
  Scale,
  Star,
} from "lucide-react";
import { fetchRepos, fetchReadme, languageColor, clearCacheKey } from "@/lib/github-api";
import type { GitHubRepo } from "@/lib/github-api";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export function ProjectPage() {
  const { name } = useParams<{ name: string }>();
  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [readmeLoading, setReadmeLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadProject = useCallback(
    async (force = false) => {
      if (!name) return;

      setLoading(true);
      try {
        const repos = await fetchRepos(force);
        const found = repos.find((r) => r.name === name);
        if (found) {
          setRepo(found);
          setReadmeLoading(true);
          try {
            const md = await fetchReadme("ChidcGithub", name, force, found.default_branch);
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
    },
    [name]
  );

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
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-on-surface-variant" role="status">
        <span className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden />
        <span className="text-sm font-medium tracking-wide">Loading project…</span>
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="py-32 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">Repository not found</h2>
        <p className="mt-2 text-sm text-on-surface-variant">It may have been renamed, archived or deleted.</p>
        <Link to="/repos" className="m3-btn m3-btn-tonal mt-6 no-underline">
          <ArrowLeft size={16} />
          Back to repositories
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* ----------------------------- Header ------------------------------ */}
      <section className="pt-10 sm:pt-14">
        <Link
          to="/repos"
          className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-4 py-2 text-[13px] font-medium text-on-surface-variant no-underline transition-colors duration-200 hover:bg-secondary-container hover:text-on-secondary-container"
        >
          <ArrowLeft size={15} />
          All repositories
        </Link>

        <div className="mt-5 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
          <h1 className="min-w-0 break-words text-[clamp(28px,5vw,42px)] font-extrabold leading-[1.08] tracking-tight text-on-surface">
            {repo.name}
          </h1>
          <div className="flex shrink-0 items-center gap-2 pt-1.5">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing || readmeLoading}
              aria-label="Refresh data"
              title="Refresh data"
              className="m3-icon-btn disabled:cursor-wait disabled:opacity-60"
            >
              <RefreshCw size={17} className={refreshing || readmeLoading ? "animate-spin" : ""} />
            </button>
            <a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label="View on GitHub" title="View on GitHub" className="m3-fab no-underline">
              <ExternalLink size={20} />
            </a>
          </div>
        </div>

        {repo.description && (
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-on-surface-variant">{repo.description}</p>
        )}

        {/* Meta chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {repo.language && (
            <span className="m3-chip-static">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
              {repo.language}
            </span>
          )}
          <span className="m3-chip-static">
            <Star size={13} />
            {repo.stargazers_count} stars
          </span>
          {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" && (
            <span className="m3-chip-static">
              <Scale size={13} />
              {repo.license.spdx_id}
            </span>
          )}
          <span className="m3-chip-static">
            <Clock size={13} />
            Updated {formatDate(repo.updated_at)}
          </span>
        </div>

        {/* Topics */}
        {repo.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {repo.topics.map((topic) => (
              <span key={topic} className="inline-flex h-8 select-none items-center rounded-full bg-primary-container px-4 text-[13px] font-medium text-on-primary-container">
                {topic}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ---------------------------- README ------------------------------- */}
      <section className="mt-10">
        {readmeLoading ? (
          <div className="flex items-center justify-center gap-4 rounded-[32px] bg-surface-low py-24 text-on-surface-variant" role="status">
            <span className="size-9 animate-spin rounded-full border-[3px] border-primary border-t-transparent" aria-hidden />
            <span className="text-sm font-medium">Loading README…</span>
          </div>
        ) : readme ? (
          <div className="rounded-[32px] bg-surface-low p-6 sm:p-10">
            <MarkdownRenderer markdown={readme} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 rounded-[32px] bg-surface-low px-8 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface-high text-on-surface-variant">
              <FileQuestion size={24} />
            </span>
            <div className="text-sm font-medium text-on-surface-variant">No README available for this repository.</div>
          </div>
        )}
      </section>
    </div>
  );
}
