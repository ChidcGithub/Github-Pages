import { TopNavbar } from "@/components/TopNavbar";
import { Sidebar } from "@/components/Sidebar";
import { HomePage } from "@/pages/HomePage";
import { RepositoriesPage } from "@/pages/RepositoriesPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { Routes, Route } from "react-router";

function App() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#ffffff" }}>
      <TopNavbar />
      <Sidebar />

      <main className="lg:ml-[260px]" style={{ minHeight: "100vh" }}>
        <div style={{ maxWidth: 900 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/repos" element={<RepositoriesPage />} />
            <Route path="/p/:name" element={<ProjectPage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
