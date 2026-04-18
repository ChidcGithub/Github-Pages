import { FileCode, Github, Lightbulb, Search } from "lucide-react";
import { Link, useLocation } from "react-router";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Repos", path: "/repos" },
];

export function TopNavbar() {
  const location = useLocation();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4"
      style={{ height: 48, backgroundColor: "#5c6b73" }}
    >
      {/* Left: Icon + Title */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2 no-underline hover:no-underline">
          <FileCode size={20} color="#fff" />
          <span className="text-white font-medium" style={{ fontSize: 16 }}>
            Chidc
          </span>
        </Link>
      </div>

      {/* Center: Search */}
      <div className="hidden sm:flex items-center flex-1 justify-center" style={{ maxWidth: 400 }}>
        <div
          className="flex items-center gap-2 px-3 w-full"
          style={{
            height: 32,
            borderRadius: 6,
            backgroundColor: "rgba(255,255,255,0.15)",
          }}
        >
          <Search size={14} color="rgba(255,255,255,0.6)" />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
            Search
          </span>
        </div>
      </div>

      {/* Right: Nav links + GitHub */}
      <div className="flex items-center gap-3">
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.path === location.pathname;
            return (
              <Link
                key={link.path}
                to={link.path}
                className="px-2 py-1 rounded transition-colors no-underline hover:no-underline"
                style={{
                  fontSize: 13,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                  backgroundColor: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button className="flex items-center justify-center transition-opacity hover:opacity-80" style={{ color: "#fff" }}>
          <Lightbulb size={18} />
        </button>
        <a
          href="https://github.com/ChidcGithub"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center transition-opacity hover:opacity-80 no-underline hover:no-underline"
          style={{ color: "#fff" }}
        >
          <Github size={18} />
        </a>
        <div className="hidden md:flex items-center gap-1 text-white" style={{ fontSize: 12 }}>
          <span>Open Source</span>
        </div>
      </div>
    </header>
  );
}
