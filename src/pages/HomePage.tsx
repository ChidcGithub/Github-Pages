import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import {
  ArrowUpRight,
  ChevronRight,
  FolderOpen,
  Github,
  GitCommitHorizontal,
  Mail,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchRepos, fetchStats, languageColor, clearCacheKey } from "@/lib/github-api";
import type { GitHubRepo } from "@/lib/github-api";

export function HomePage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [stats, setStats] = useState<{ totalStars: number; totalRepos: number; totalCommits: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (force = false) => {
    try {
      const [r, s] = await Promise.all([fetchRepos(force), fetchStats(force)]);
      setRepos(r);
      setStats(s);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    clearCacheKey("repos");
    clearCacheKey("stats");
    loadData(true);
  };

  const starred = repos.filter((r) => r.stargazers_count >= 1).slice(0, 6);
  const featured = starred.length > 0 ? starred : repos.slice(0, 4);
  const recent = repos.slice(0, 8);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-on-surface-variant" role="status">
        <span className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden />
        <span className="text-sm font-medium tracking-wide">Fetching GitHub data…</span>
      </div>
    );
  }

  return (
    <div>
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="relative pt-10 sm:pt-16">
        {/* Decorative blobs */}
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-6 size-48 rounded-full bg-primary-container opacity-50 blur-3xl sm:-right-24 sm:-top-10 sm:size-72" />
        <div aria-hidden className="pointer-events-none absolute -left-20 top-40 size-40 rounded-full bg-tertiary-container opacity-40 blur-3xl sm:-left-28 sm:size-64" />

        <div className="relative max-w-2xl">
          <div className="flex items-center gap-3">
            <span className="m3-chip-static border-transparent bg-primary-container text-on-primary-container">
              <Sparkles size={14} />
              GitHub Portfolio
            </span>
            <button type="button" onClick={handleRefresh} disabled={refreshing} aria-label="Refresh data" title="Refresh data" className="m3-icon-btn size-9 disabled:cursor-wait disabled:opacity-60">
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>

          <h1 className="mt-5 text-[clamp(44px,9vw,76px)] font-extrabold leading-[1.02] tracking-tight text-on-surface">
            Chidc<span className="text-primary">.</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-on-surface-variant">
            Full-stack developer based in Changsha, China — a high school student passionate about{" "}
            <span className="font-semibold text-on-surface">AI/ML</span>,{" "}
            <span className="font-semibold text-on-surface">developer tooling</span> and{" "}
            <span className="font-semibold text-on-surface">cross-platform apps</span>.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/repos" className="m3-btn m3-btn-filled m3-btn-lg no-underline">
              <FolderOpen size={19} />
              View repositories
            </Link>
            <a href="https://github.com/ChidcGithub" target="_blank" rel="noopener noreferrer" className="m3-btn m3-btn-outlined m3-btn-lg no-underline">
              <Github size={18} />
              GitHub profile
              <ArrowUpRight size={16} />
            </a>
          </div>

          {/* Contact line */}
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-on-surface-variant">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={15} className="text-primary" />
              Changsha, China
            </span>
            <a href="mailto:chidcout@outlook.com" className="inline-flex items-center gap-1.5 font-medium underline-offset-4 transition-colors hover:text-primary hover:underline">
              <Mail size={15} className="text-primary" />
              chidcout@outlook.com
            </a>
          </div>
        </div>
      </section>

      {/* ------------------------------ Stats ----------------------------- */}
      <section className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-[28px] bg-primary-container p-6 text-on-primary-container">
          <div className="flex flex-col gap-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/35 dark:bg-black/15">
              <Star size={20} className="fill-current" />
            </span>
            <div>
              <div className="text-[34px] font-extrabold leading-none tracking-tight tabular-nums">{stats?.totalStars ?? 0}</div>
              <div className="mt-1.5 text-[13px] font-semibold uppercase tracking-wide opacity-70">Total stars</div>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-secondary-container p-6 text-on-secondary-container">
          <div className="flex flex-col gap-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/35 dark:bg-black/15">
              <FolderOpen size={20} />
            </span>
            <div>
              <div className="text-[34px] font-extrabold leading-none tracking-tight tabular-nums">{stats?.totalRepos ?? repos.length}</div>
              <div className="mt-1.5 text-[13px] font-semibold uppercase tracking-wide opacity-70">Repositories</div>
            </div>
          </div>
        </div>
        <div className="rounded-[28px] bg-tertiary-container p-6 text-on-tertiary-container">
          <div className="flex flex-col gap-4">
            <span className="grid size-11 place-items-center rounded-2xl bg-white/35 dark:bg-black/15">
              <GitCommitHorizontal size={20} />
            </span>
            <div>
              <div className="text-[34px] font-extrabold leading-none tracking-tight tabular-nums">{stats?.totalCommits ?? 0}+</div>
              <div className="mt-1.5 text-[13px] font-semibold uppercase tracking-wide opacity-70">Commits / year</div>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------- Featured ----------------------------- */}
      {featured.length > 0 && (
        <section className="mt-16">
          <div className="m3-eyebrow">Featured</div>
          <h2 className="text-[28px] font-bold tracking-tight text-on-surface">Top projects</h2>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
            {featured.map((repo) => (
              <Link key={repo.name} to={`/p/${repo.name}`} className="group m3-card-interactive flex flex-col gap-3 p-6 no-underline">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-lg font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary">
                    {repo.name}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-[13px] font-semibold tabular-nums text-on-surface-variant">
                    <Star size={13} className="fill-current" />
                    {repo.stargazers_count}
                  </span>
                </div>

                {repo.description && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">{repo.description}</p>
                )}

                <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-on-surface-variant">
                  {repo.language && (
                    <span className="inline-flex items-center gap-1.5 font-medium">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
                      {repo.language}
                    </span>
                  )}
                  {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" && <span>{repo.license.spdx_id}</span>}
                  <span className="ml-auto inline-flex translate-x-0 items-center gap-0.5 font-semibold text-primary transition-transform duration-300 ease-spring group-hover:translate-x-1">
                    Read more
                    <ArrowUpRight size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --------------------------- Recent ------------------------------- */}
      <section className="mt-16">
        <div className="m3-eyebrow">Activity</div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-[28px] font-bold tracking-tight text-on-surface">Recent repositories</h2>
          <Link to="/repos" className="inline-flex items-center gap-1 rounded-full pb-1 text-sm font-semibold text-primary underline-offset-4 hover:underline">
            View all
            <ArrowUpRight size={15} />
          </Link>
        </div>

        <div className="mt-4 -mx-4 flex flex-col">
          {recent.map((repo) => (
            <Link
              key={repo.name}
              to={`/p/${repo.name}`}
              className="group flex items-center justify-between gap-4 rounded-3xl px-4 py-4 no-underline transition-colors duration-200 hover:bg-surface-container"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold text-on-surface transition-colors group-hover:text-primary">{repo.name}</div>
                {repo.description && (
                  <div className="mt-0.5 truncate text-[13px] text-on-surface-variant">{repo.description}</div>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-4 text-xs text-on-surface-variant">
                {repo.language && (
                  <span className="hidden items-center gap-1.5 font-medium sm:inline-flex">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
                    {repo.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Star size={12} />
                  {repo.stargazers_count}
                </span>
                <ChevronRight className="transition-transform duration-300 ease-spring group-hover:translate-x-1" size={16} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
