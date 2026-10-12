import { ArrowRight, Check, Circle, LockKeyhole, Plus } from "lucide-react";
import Button from "../ui/button.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";

const steps = [
  { label: "Create your first application", detail: "Choose a name for the product you are connecting.", action: "create" },
  { label: "Define an event type", detail: "Describe the events your application can send.", action: "events" },
  { label: "Connect a delivery channel", detail: "Choose where notifications should be delivered.", action: "channels" },
];

export default function GettingStartedChecklist({ hasApplication, onCreate }) {
  return (
    <Card id="getting-started" className="dash-checklist-card">
      <CardHeader className="dash-panel-header"><div><CardTitle>Getting started</CardTitle><p>A few steps to get your notification flow ready.</p></div><span className="dash-checklist-count">{hasApplication ? "1" : "0"}/3</span></CardHeader>
      <CardContent>
        <ol className="dash-checklist">{steps.map((step, index) => {
          const complete = index === 0 && hasApplication;
          return <li key={step.label} className={complete ? "complete" : ""}><span className="dash-check-icon">{complete ? <Check size={13} /> : index === 0 ? <Circle size={13} /> : <LockKeyhole size={12} />}</span><span className="dash-check-copy"><strong>{step.label}</strong><small>{step.detail}</small>{index === 0 && !hasApplication && <Button variant="ghost" size="sm" onClick={onCreate}><Plus size={13} /> Create application</Button>}</span>{index > 0 && <span className="dash-step-locked">After app setup</span>}</li>;
        })}</ol>
        {hasApplication && <div className="dash-checklist-next"><ArrowRight size={14} /><span>Your next step is defining your first event type.</span></div>}
      </CardContent>
    </Card>
  );
}
