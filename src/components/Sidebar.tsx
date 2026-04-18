import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router";

interface NavItem {
  label: string;
  path: string;
  external?: boolean;
}

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Navigation",
    items: [
      { label: "Home", path: "/" },
      { label: "Repositories", path: "/repos" },
    ],
  },
  {
    title: "Connect",
    items: [
      { label: "GitHub Profile", path: "https://github.com/ChidcGithub", external: true },
      { label: "Email", path: "mailto:chidcout@outlook.com", external: true },
    ],
  },
];

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const sidebarContent = (
    <nav className="flex flex-col" style={{ padding: "16px 0" }}>
      {navGroups.map((group) => (
        <div key={group.title} className="mb-4">
          <div
            className="font-medium px-5 mb-1"
            style={{ fontSize: 13, color: "#2d333b" }}
          >
            {group.title}
          </div>
          {group.items.map((item) => {
            const isActive = !item.external && location.pathname === item.path;
            // Check if current path is a project page (starts with /p/)
            const isProjectPage = location.pathname.startsWith("/p/");
            const isHomeActive = item.path === "/" && (location.pathname === "/" || isProjectPage);
            const isReposActive = item.path === "/repos" && (location.pathname === "/repos" || isProjectPage);

            let active = isActive;
            if (item.path === "/" && isHomeActive) active = true;
            if (item.path === "/repos" && isReposActive) active = true;

            return (
              <a
                key={item.label}
                href={item.path}
                target={item.external ? "_blank" : undefined}
                rel={item.external ? "noopener noreferrer" : undefined}
                className="block transition-colors no-underline hover:no-underline"
                style={{
                  padding: "5px 20px",
                  fontSize: 14,
                  color: active ? "#0969da" : "#2d333b",
                  backgroundColor: "transparent",
                  fontWeight: active ? 600 : 400,
                }}
                onMouseEnter={(e) => {
                  if (!active) e.currentTarget.style.color = "#0969da";
                }}
                onMouseLeave={(e) => {
                  if (!active) e.currentTarget.style.color = "#2d333b";
                }}
              >
                {item.label}
              </a>
            );
          })}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed z-50 lg:hidden flex items-center justify-center rounded"
        style={{
          top: 8,
          left: 8,
          width: 32,
          height: 32,
          backgroundColor: "rgba(92,107,115,0.9)",
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={16} color="#fff" /> : <Menu size={16} color="#fff" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed top-0 bottom-0 left-0 z-40 lg:hidden overflow-y-auto"
        style={{
          width: 260,
          backgroundColor: "#f7f7f7",
          borderRight: "1px solid #d0d7de",
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.2s ease",
          paddingTop: 48,
        }}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="fixed top-0 bottom-0 left-0 z-30 hidden lg:block overflow-y-auto"
        style={{
          width: 260,
          backgroundColor: "#f7f7f7",
          borderRight: "1px solid #d0d7de",
          paddingTop: 48,
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
