import { useState } from "react";
import { Github, Menu, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Repositories", path: "/repos" },
];

function useThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light"
  );
  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    try {
      localStorage.setItem("chidc-theme", next);
    } catch {
      // storage unavailable
    }
    setTheme(next);
  };
  return { theme, toggle };
}

export function TopNavbar() {
  const location = useLocation();
  const { theme, toggle } = useThemeToggle();

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant/40 bg-surface/85 backdrop-blur-xl"
      style={{
        paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        paddingRight: "max(0.75rem, env(safe-area-inset-right))",
      }}
    >
      <div className="flex h-14 items-center justify-between gap-2 sm:h-16">
        {/* Left: brand + mobile menu */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Toggle navigation menu"
            onClick={() => window.dispatchEvent(new Event("chidc:toggle-sidebar"))}
            className="m3-icon-btn lg:hidden"
          >
            <Menu size={20} />
          </button>
          <Link to="/" className="flex items-center rounded-full py-1 no-underline">
            <span className="text-lg font-bold tracking-tight text-on-surface">Chidc</span>
          </Link>
        </div>

        {/* Right: nav + actions */}
        <div className="flex items-center gap-1.5">
          <nav className="hidden items-center gap-1.5 md:flex" aria-label="Primary">
            {navLinks.map((link) => {
              const active =
                link.path === "/"
                  ? location.pathname === "/" || location.pathname.startsWith("/p/")
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  aria-current={active ? "page" : undefined}
                  className={`m3-nav-link ${active ? "m3-nav-link-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <span className="mx-1 hidden h-6 w-px bg-outline-variant/60 md:block" aria-hidden />

          <a
            href="https://github.com/ChidcGithub"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub profile"
            className="m3-icon-btn"
          >
            <Github size={19} />
          </a>
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
            className="m3-icon-btn"
          >
            {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
          </button>
        </div>
      </div>
    </header>
  );
}
