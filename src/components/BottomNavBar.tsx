import { FolderGit2, Home } from "lucide-react";
import { Link, useLocation } from "react-router";

const items = [
  { label: "Home", path: "/", icon: Home },
  { label: "Repos", path: "/repos", icon: FolderGit2 },
];

/**
 * M3 navigation bar for compact screens (< lg).
 * The desktop layout swaps this for the navigation drawer instead.
 */
export function BottomNavBar() {
  const location = useLocation();

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/" || location.pathname.startsWith("/p/")
      : location.pathname.startsWith(path);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-outline-variant/50 bg-surface-container/95 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-md">
        {items.map(({ label, path, icon: Icon }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? "page" : undefined}
              className="flex flex-1 cursor-pointer flex-col items-center gap-1 py-2.5 no-underline transition-transform duration-300 ease-spring active:scale-95"
            >
              <span
                className={`grid h-8 w-16 place-items-center rounded-full transition-colors duration-200 ${
                  active ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant"
                }`}
              >
                <Icon size={22} />
              </span>
              <span className={`text-xs font-medium ${active ? "text-on-surface" : "text-on-surface-variant"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
