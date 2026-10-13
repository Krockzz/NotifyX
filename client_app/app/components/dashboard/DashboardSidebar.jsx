import { useLocation, Link } from "react-router";
import {
  Activity, AppWindow, Bell, Braces, Cable, ChevronDown,
  CircleHelp, CircleUserRound, Command, FileText, KeyRound, LayoutDashboard,
  Settings2,
} from "lucide-react";
import Brand from "../landing/Brand.jsx";

const primaryLinks = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard#overview", key: "overview" },
  { label: "Applications", icon: AppWindow, to: "/dashboard#applications", key: "applications" },
  { label: "Events", icon: Braces, to: "/dashboard#events", key: "events" },
  { label: "Deliveries", icon: Activity, to: "/dashboard#deliveries", key: "deliveries" },
  { label: "Settings", icon: Settings2, to: "/dashboard#settings", key: "settings" },
];

const appLinks = [
  { label: "Overview", icon: LayoutDashboard, to: "/dashboard#overview" },
  { label: "Event Types", icon: Braces, to: "/dashboard#getting-started" },
  { label: "Channels", icon: Cable, to: "/dashboard#getting-started" },
  { label: "Templates", icon: FileText, to: "/dashboard#getting-started" },
  { label: "API Keys", icon: KeyRound, to: "/dashboard#getting-started" },
];

export default function DashboardSidebar({ selectedApp, activeAppSection, onSelectAppSection }) {
  const location = useLocation();
  const hash = location.hash.replace("#", "");
  const activeKey = hash === "events" ? "events" : hash === "deliveries" ? "deliveries" : hash === "applications" ? "applications" : hash === "settings" ? "settings" : "overview";

  return (
    <aside className="dash-sidebar" aria-label="Dashboard sidebar">
      <div className="dash-sidebar-top"><Brand href="/dashboard#overview" /><button className="dash-workspace-switcher" type="button" disabled aria-label="Current workspace; switching is not available in this preview"><span className="dash-workspace-mark"><Command size={14} /></span><span><strong>Personal workspace</strong><small>Developer plan</small></span><ChevronDown size={14} /></button></div>
      <nav className="dash-side-nav" aria-label="Workspace navigation">
        <span className="dash-nav-label">WORKSPACE</span>
        {primaryLinks.map(({ label, icon: Icon, to, key }) => (
          <Link key={key} to={to} className={`dash-nav-item${activeKey === key ? " active" : ""}`} aria-current={activeKey === key ? "page" : undefined}><Icon size={16} strokeWidth={1.8} /><span>{label}</span>{label === "Applications" && selectedApp && <span className="dash-nav-count">1</span>}</Link>
        ))}
        {selectedApp && (
          <div className="dash-context-nav">
            <span className="dash-nav-label">APPLICATION</span>
            <button type="button" className="dash-selected-app" onClick={() => onSelectAppSection("Overview")}><span className="dash-app-dot" />{selectedApp.name}<ChevronDown size={13} /></button>
            {appLinks.map(({ label, icon: Icon, to }) => <Link key={label} to={to} onClick={() => onSelectAppSection(label)} className={`dash-nav-item dash-nav-subitem${activeAppSection === label ? " active" : ""}`}><Icon size={15} strokeWidth={1.8} /><span>{label}</span></Link>)}
          </div>
        )}
      </nav>
      <div className="dash-sidebar-bottom">
        <Link to="/dashboard#getting-started" className="dash-help-link"><CircleHelp size={16} /><span>Help & documentation</span></Link>
        <div className="dash-profile"><span className="dash-avatar">D</span><span><strong>Developer</strong><small>Local UI preview</small></span><CircleUserRound size={15} /></div>
      </div>
    </aside>
  );
}
