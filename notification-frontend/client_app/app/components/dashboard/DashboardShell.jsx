import { useEffect, useState } from "react";
import DashboardHeader from "./DashboardHeader.jsx";
import DashboardSidebar from "./DashboardSidebar.jsx";
import DashboardOverview from "./DashboardOverview.jsx";
import CreateApplicationDialog from "./CreateApplicationDialog.jsx";

export default function DashboardShell() {
  const [theme, setTheme] = useState("dark");
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState(null);
  const [activeAppSection, setActiveAppSection] = useState("Overview");
  const [dialogOpen, setDialogOpen] = useState(false);
  const selectedApp = applications.find((app) => app.id === selectedAppId) ?? null;

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("notifyx-theme");
    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      document.documentElement.dataset.theme = savedTheme;
    }
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("notifyx-theme", nextTheme);
  }

  function createApplication(name) {
    const nextApp = {
      id: `app_demo_${String(applications.length + 1).padStart(2, "0")}`,
      name,
      createdAt: "just now",
    };
    setApplications((current) => [...current, nextApp]);
    setSelectedAppId(nextApp.id);
    setActiveAppSection("Overview");
  }

  return (
    <div className="dashboard-shell">
      <DashboardSidebar selectedApp={selectedApp} activeAppSection={activeAppSection} onSelectAppSection={setActiveAppSection} />
      <div className="dash-main-column">
        <DashboardHeader selectedApp={selectedApp} theme={theme} onToggleTheme={toggleTheme} />
        <DashboardOverview applications={applications} selectedAppId={selectedAppId} onSelectApp={setSelectedAppId} onCreate={() => setDialogOpen(true)} selectedApp={selectedApp} />
      </div>
      <CreateApplicationDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreate={createApplication} />
    </div>
  );
}
