import { BookOpen, ChevronRight, Moon, Sun } from "lucide-react";
import { Link } from "react-router";
import Button from "../ui/button.jsx";

export default function DashboardHeader({ selectedApp, theme, onToggleTheme }) {
  return (
    <header className="dash-header">
      <div className="dash-breadcrumbs"><Link to="/dashboard#overview">Workspace</Link><ChevronRight size={14} /><span>{selectedApp?.name ?? "Overview"}</span></div>
      <div className="dash-header-actions">
        <a className="dash-docs-link" href="#getting-started"><BookOpen size={15} /><span>Docs</span></a>
        <Button variant="ghost" size="icon-sm" onClick={onToggleTheme} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`} title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}>{theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}</Button>
        <details className="dash-user-menu"><summary aria-label="Open profile menu"><span className="dash-avatar">D</span></summary><div className="dash-user-popover"><strong>Developer</strong><small>Preview workspace</small><span>Authentication is not connected</span></div></details>
      </div>
    </header>
  );
}
