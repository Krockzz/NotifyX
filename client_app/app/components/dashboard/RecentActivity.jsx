import { Activity, ArrowRight, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";

export default function RecentActivity() {
  return (
    <Card id="recent-activity" className="dash-activity-card">
      <CardHeader className="dash-panel-header"><div><CardTitle id="events">Recent activity</CardTitle><p id="deliveries">See events and delivery updates as your system starts sending.</p></div><span className="dash-activity-period"><Clock3 size={13} /> Live view</span></CardHeader>
      <CardContent><div className="dash-activity-empty"><span className="dash-activity-icon"><Activity size={17} /></span><div><strong>Nothing to show just yet</strong><p>When your app begins sending events, their processing and delivery updates will appear here.</p></div><ArrowRight size={15} className="dash-activity-arrow" /></div></CardContent>
    </Card>
  );
}
