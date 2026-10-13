import { AppWindow, ArrowUpRight, Plus } from "lucide-react";
import Button from "../ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import EmptyApplicationsState from "./EmptyApplicationsState.jsx";

export default function ApplicationsPanel({ applications, selectedAppId, onSelectApp, onCreate }) {
  return (
    <Card id="applications" className="dash-applications-card">
      <CardHeader className="dash-panel-header"><div><CardTitle>Applications</CardTitle><p>Keep each product or environment organized.</p></div>{applications.length > 0 && <Button variant="outline" size="sm" onClick={onCreate}><Plus size={14} /> New application</Button>}</CardHeader>
      <CardContent className="dash-applications-content">
        {applications.length === 0 ? <EmptyApplicationsState onCreate={onCreate} /> : (
          <div className="dash-application-list">{applications.map((app) => <button type="button" key={app.id} onClick={() => onSelectApp(app.id)} className={`dash-application-row${selectedAppId === app.id ? " selected" : ""}`}><span className="dash-application-icon"><AppWindow size={17} /></span><span className="dash-application-info"><strong>{app.name}</strong><small><code>{app.id}</code><span>Created {app.createdAt}</span></small></span><span className="dash-local-badge">LOCAL DEMO</span><ArrowUpRight size={15} className="dash-app-arrow" /></button>)}</div>
        )}
      </CardContent>
    </Card>
  );
}
