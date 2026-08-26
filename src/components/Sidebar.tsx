import { useEffect, useState } from "react";
import { ArrowUpRight, FolderGit2, Github, Home, Mail, X } from "lucide-react";
import { useLocation, Link } from "react-router";

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  external?: boolean;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Navigation",
    items: [
      { label: "Home", path: "/", icon: Home },
      { label: "Repositories", path: "/repos", icon: FolderGit2 },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "GitHub Profile", path: "https://github.com/ChidcGithub", icon: Github, external: true },
      { label: "Email", path: "mailto:chidcout@outlook.com", icon: Mail, external: true },
    ],
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setMobileOpen((open) => !open);
    window.addEventListener("chidc:toggle-sidebar", handler);
    return () => window.removeEventListener("chidc:toggle-sidebar", handler);
  }, []);

  const isActive = (item: NavItem) =>
    !item.external &&
    (item.path === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/p/")
      : location.pathname.startsWith(item.path));

  const sidebarContent = (
    <nav
      className="flex h-full flex-col px-4"
      style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}
      aria-label="Sidebar"
    >
      {navGroups.map((group) => (
        <div key={group.title} className="mb-6 mt-4">
          <div className="mb-2 px-4 text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface-variant">
            {group.title}
          </div>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = isActive(item);
              const Icon = item.icon;
              return item.external ? (
                <a
                  key={item.label}
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m3-nav-item"
                >
                  <Icon size={20} />
                  <span className="flex-1">{item.label}</span>
                  <ArrowUpRight size={16} className="opacity-60" />
                </a>
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`m3-nav-item ${active ? "m3-nav-item-active" : ""}`}
                >
                  <Icon size={20} />
                  <span className="flex-1">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}

      {/* Decorative footer card */}
      <div className="mt-auto rounded-[24px] bg-primary-container p-5 text-on-primary-container">
        <div className="text-sm font-bold">Open Source</div>
        <p className="mt-1 text-xs leading-relaxed opacity-80">
          All data is fetched live from the GitHub REST API.
        </p>
        <a
          href="https://github.com/ChidcGithub"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface/25 px-3 py-1.5 text-xs font-semibold no-underline transition-colors hover:bg-surface/40"
        >
          <Github size={13} />
          Follow on GitHub
        </a>
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 w-[300px] overflow-y-auto border-r border-outline-variant/50 bg-surface-low transition-transform duration-300 ease-emphasized lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button type="button" aria-label="Close menu" onClick={() => setMobileOpen(false)} className="m3-icon-btn absolute right-2 top-2 z-10">
          <X size={18} />
        </button>
        {sidebarContent}
      </aside>

      {/* Desktop drawer */}
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-[280px] overflow-y-auto border-r border-outline-variant/50 bg-surface-low pt-16 lg:block">
        {sidebarContent}
      </aside>
    </>
  );
}
