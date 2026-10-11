import {
  Activity,
  ArrowDown,
  ArrowRight,
  Bell,
  Check,
  Code2,
  Mail,
  Radio,
  Webhook,
} from "lucide-react";

const workflowItems = [
  { icon: Bell, label: "Event received", detail: "order.confirmed", state: "Complete" },
  { icon: Radio, label: "Rules applied", detail: "Transactional route", state: "Processing" },
  { icon: Mail, label: "Email delivery", detail: "sam@example.com", state: "Delivered" },
];

export default function SignupVisual() {
  return (
    <aside className="signup-visual" aria-label="NotifyX product preview">
      <div className="signup-visual-glow signup-glow-one" aria-hidden="true" />
      <div className="signup-visual-glow signup-glow-two" aria-hidden="true" />
      <div className="signup-visual-content">
        <div className="signup-visual-heading">
          <span className="signup-kicker"><span className="signup-kicker-dot" /> EVENT-DRIVEN DELIVERY</span>
          <h2>Every notification.<br /><span>One platform.</span></h2>
          <p>Create, deliver, and monitor notifications through a developer-friendly platform.</p>
        </div>

        <div className="signup-preview" aria-label="Illustrative notification delivery dashboard">
          <div className="signup-preview-topbar">
            <div className="signup-preview-brand"><span><Bell size={14} /></span> NotifyX <small>WORKSPACE</small></div>
            <span className="signup-live"><i /> LIVE PREVIEW</span>
          </div>
          <div className="signup-preview-body">
            <div className="signup-preview-title"><div><span className="signup-preview-eyebrow">DELIVERY OVERVIEW</span><h3>Notification flow</h3></div><button type="button" aria-label="Illustrative activity view"><Activity size={15} /></button></div>
            <div className="signup-workflow">
              {workflowItems.map(({ icon: Icon, label, detail, state }, index) => (
                <div className="signup-workflow-step" key={label}>
                  <span className={`signup-workflow-icon workflow-icon-${index}`}><Icon size={15} /></span>
                  <span className="signup-workflow-copy"><strong>{label}</strong><small>{detail}</small></span>
                  <span className={`signup-step-status signup-status-${index}`}><i />{state}</span>
                  {index < workflowItems.length - 1 && <span className="signup-workflow-connector" aria-hidden="true"><ArrowDown size={11} /></span>}
                </div>
              ))}
            </div>
            <div className="signup-preview-footer">
              <span>ROUTED CHANNELS</span>
              <div className="signup-channel-pills"><span><Mail size={12} /> Email</span><span><Webhook size={12} /> Webhook</span><span><Code2 size={12} /> API</span></div>
            </div>
          </div>
          <div className="signup-activity">
            <div className="signup-activity-icon"><Check size={13} /></div>
            <div><strong>Delivery recorded</strong><span>Event status updated · just now</span></div>
            <ArrowRight size={14} />
          </div>
        </div>

        <div className="signup-visual-footnote"><span><Check size={13} /> Built around your product events</span><span>Illustrative product preview</span></div>
      </div>
      <div className="signup-visual-bottom" aria-hidden="true"><span>NOTIFYX</span><span>ONE EVENT PIPELINE · CLEAR DELIVERY HISTORY</span></div>
    </aside>
  );
}
