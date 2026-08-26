import { useEffect } from "react";
import { TopNavbar } from "@/components/TopNavbar";
import { Sidebar } from "@/components/Sidebar";
import { BottomNavBar } from "@/components/BottomNavBar";
import { Footer } from "@/components/Footer";
import { HomePage } from "@/pages/HomePage";
import { RepositoriesPage } from "@/pages/RepositoriesPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { initDynamicTheme } from "@/lib/dynamic-theme";
import { Routes, Route } from "react-router";
import { Toaster } from "@/components/ui/sonner";

function App() {
  useEffect(() => initDynamicTheme(), []);

  return (
    <div className="min-h-screen bg-surface text-on-surface transition-colors duration-300">
      <TopNavbar />
      <Sidebar />

      <main className="lg:pl-[280px]">
        {/* Bottom padding clears the mobile navigation bar + safe area */}
        <div className="mx-auto w-full max-w-[920px] px-5 pb-[calc(96px+env(safe-area-inset-bottom))] pt-6 md:px-8 lg:pb-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/repos" element={<RepositoriesPage />} />
            <Route path="/p/:name" element={<ProjectPage />} />
          </Routes>
          <Footer />
        </div>
      </main>

      <BottomNavBar />
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
