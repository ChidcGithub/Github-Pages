import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownAZ,
  Check,
  History,
  Languages,
  RefreshCw,
  Search,
  SearchX,
  Star,
  X,
} from "lucide-react";
import { fetchRepos, languageColor, clearCacheKey } from "@/lib/github-api";
import type { GitHubRepo } from "@/lib/github-api";
import { formatDate } from "@/lib/format";

type SortKey = "updated" | "stars" | "name" | "language";

const SORTS: { key: SortKey; label: string; icon: LucideIcon }[] = [
  { key: "updated", label: "Recently updated", icon: History },
  { key: "stars", label: "Most stars", icon: Star },
  { key: "name", label: "Name A–Z", icon: ArrowDownAZ },
  { key: "language", label: "Language", icon: Languages },
];

function FilterChip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} aria-pressed={selected} className={`m3-chip ${selected ? "m3-chip-selected" : ""}`}>
      {selected && <Check size={15} />}
      {children}
    </button>
  );
}

export function RepositoriesPage() {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("updated");
  const [lang, setLang] = useState<string | null>(null);

  const loadData = useCallback(async (force = false) => {
    try {
      const r = await fetchRepos(force);
      setRepos(r);
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
    loadData(true);
  };

  const filtered = repos
    .filter((r) => (lang ? r.language === lang : true))
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
        case "stars":
          return b.stargazers_count - a.stargazers_count;
        case "name":
          return a.name.localeCompare(b.name);
        case "language":
          return (a.language || "").localeCompare(b.language || "");
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

  const languages = [...new Set(repos.map((r) => r.language).filter(Boolean))].sort() as string[];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-on-surface-variant" role="status">
        <span className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" aria-hidden />
        <span className="text-sm font-medium tracking-wide">Loading repositories…</span>
      </div>
    );
  }

  return (
    <div>
      {/* ----------------------------- Header ----------------------------- */}
      <section className="pt-10 sm:pt-14">
        <div className="m3-eyebrow">Library</div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-[clamp(32px,6vw,44px)] font-extrabold leading-none tracking-tight text-on-surface">
            All repositories
          </h1>
          <span className="grid h-8 min-w-8 place-items-center rounded-full bg-primary-container px-2.5 text-sm font-bold tabular-nums text-on-primary-container">
            {repos.length}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh data"
            title="Refresh data"
            className="m3-icon-btn ml-auto disabled:cursor-wait disabled:opacity-60"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-on-surface-variant">
          Everything public on{" "}
          <a
            href="https://github.com/ChidcGithub"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            GitHub
          </a>
          , sorted and searchable.
        </p>
      </section>

      {/* ---------------------------- Controls ----------------------------- */}
      <section className="mt-8">
        <div className="relative m3-search max-w-xl">
          <Search size={20} className="shrink-0 text-on-surface-variant" aria-hidden />
          <input
            type="text"
            aria-label="Search repositories"
            placeholder="Search repositories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} aria-label="Clear search" className="m3-icon-btn size-8 shrink-0">
              <X size={15} />
            </button>
          )}
        </div>

        {/* Sort chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2" role="group" aria-label="Sort repositories">
          {SORTS.map(({ key, label, icon: Icon }) => (
            <FilterChip key={key} selected={sortBy === key} onClick={() => setSortBy(key)}>
              <Icon size={14} />
              {label}
            </FilterChip>
          ))}
        </div>

        {/* Language filter chips */}
        {languages.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Filter by language">
            {languages.map((language) => (
              <FilterChip key={language} selected={lang === language} onClick={() => setLang(lang === language ? null : language)}>
                <span className="size-2.5 rounded-full" style={{ backgroundColor: languageColor(language) }} />
                {language}
                <span className="tabular-nums opacity-60">{repos.filter((r) => r.language === language).length}</span>
              </FilterChip>
            ))}
          </div>
        )}

        {(lang || search) && (
          <div className="mt-5 text-[13px] font-medium text-on-surface-variant">
            {filtered.length} result{filtered.length === 1 ? "" : "s"}
            <button
              type="button"
              onClick={() => {
                setLang(null);
                setSearch("");
              }}
              className="ml-3 rounded-full px-2 py-1 font-semibold text-primary underline-offset-4 hover:underline"
            >
              Reset filters
            </button>
          </div>
        )}
      </section>

      {/* ------------------------------ Grid ------------------------------- */}
      <section className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
        {filtered.map((repo) => (
          <Link key={repo.name} to={`/p/${repo.name}`} className="group m3-card-interactive flex flex-col gap-2.5 p-5 no-underline">
            <div className="flex items-start justify-between gap-3">
              <span className="truncate text-[17px] font-bold tracking-tight text-on-surface transition-colors group-hover:text-primary">
                {repo.name}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-xs font-semibold tabular-nums text-on-surface-variant">
                <Star size={12} className="fill-current" />
                {repo.stargazers_count}
              </span>
            </div>

            {repo.description && (
              <p className="line-clamp-2 text-[13.5px] leading-relaxed text-on-surface-variant">{repo.description}</p>
            )}

            <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-on-surface-variant">
              {repo.language && (
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: languageColor(repo.language) }} />
                  {repo.language}
                </span>
              )}
              {repo.license?.spdx_id && repo.license.spdx_id !== "NOASSERTION" && <span>{repo.license.spdx_id}</span>}
              <span className="ml-auto">Updated {formatDate(repo.updated_at)}</span>
            </div>
          </Link>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full m3-card flex flex-col items-center justify-center gap-4 !bg-surface-container px-8 py-16 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface-high text-on-surface-variant">
              <SearchX size={24} />
            </span>
            <div>
              <div className="text-base font-semibold text-on-surface">No repositories found</div>
              <div className="mt-1 text-sm text-on-surface-variant">Try different keywords or reset the filters.</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
