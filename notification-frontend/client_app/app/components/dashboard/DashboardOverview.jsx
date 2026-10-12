import { ArrowUpRight, Layers3 } from "lucide-react";
import Button from "../ui/button.jsx";
import ApplicationsPanel from "./ApplicationsPanel.jsx";
import GettingStartedChecklist from "./GettingStartedChecklist.jsx";
import RecentActivity from "./RecentActivity.jsx";

export default function DashboardOverview({ applications, selectedAppId, onSelectApp, onCreate, selectedApp }) {
  return (
    <main className="dash-content" id="overview">
      <div className="dash-welcome"><div><div className="dash-page-eyebrow"><Layers3 size={14} /> NOTIFICATION WORKSPACE</div><h1>Your notification infrastructure,<br className="dash-title-break" /> at a glance.</h1><p>Manage the applications, events, and delivery channels that power your product updates.</p></div><Button onClick={onCreate}>Create application <ArrowUpRight size={15} /></Button></div>
      <div className="dash-demo-banner"><span className="dash-demo-indicator" /> <strong>UI preview</strong><span>Application data created here is local to this page session.</span></div>
      {selectedApp && <div className="dash-context-banner"><span className="dash-app-dot" /><span>Viewing <strong>{selectedApp.name}</strong></span><span className="dash-local-badge">LOCAL DEMO</span></div>}
      <div className="dash-overview-grid">
        <ApplicationsPanel applications={applications} selectedAppId={selectedAppId} onSelectApp={onSelectApp} onCreate={onCreate} />
        <GettingStartedChecklist hasApplication={applications.length > 0} onCreate={onCreate} />
      </div>
      <RecentActivity />
      <div className="dash-footer-note" id="settings"><span>Workspace preferences</span><span className="dash-settings-note">Theme is saved in this browser. Account settings are not connected in this UI preview.</span><a href="#getting-started">Getting started guide <ArrowUpRight size={13} /></a></div>
    </main>
  );
}
