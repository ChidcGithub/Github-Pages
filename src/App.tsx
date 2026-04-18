import { TopNavbar } from "@/components/TopNavbar";
import { Sidebar } from "@/components/Sidebar";
import { HomePage } from "@/pages/HomePage";
import { RepositoriesPage } from "@/pages/RepositoriesPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";

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
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
