import { Activity, ArrowRight, Bell, Check, CircleDot, Code2, Mail, Radio, Webhook } from "lucide-react";

const activity = [
  { icon: Bell, name: "Event received", meta: "order.confirmed", status: "Captured", tone: "captured" },
  { icon: Code2, name: "Template matched", meta: "order_confirmation_v2", status: "Ready", tone: "ready" },
  { icon: Radio, name: "Channel delivery", meta: "Email · Webhook", status: "Queued", tone: "queued" },
];

export default function LoginVisual() {
  return (
    <aside className="signup-visual login-visual" aria-label="NotifyX notification operations preview">
      <div className="signup-visual-glow signup-glow-one" aria-hidden="true" />
      <div className="signup-visual-glow signup-glow-two" aria-hidden="true" />
      <div className="signup-visual-content">
        <div className="signup-visual-heading">
          <span className="signup-kicker"><span className="signup-kicker-dot" /> YOUR NOTIFICATION WORKSPACE</span>
          <h2>Pick up where<br /><span>your events begin.</span></h2>
          <p>Keep an eye on notification flows, channel activity, and delivery progress from one focused workspace.</p>
        </div>

        <div className="login-ops-preview" aria-label="Illustrative notification operations workspace">
          <div className="login-ops-topbar"><span className="login-ops-brand"><span><Bell size={13} /></span> NotifyX <small>/ Workspace</small></span><span className="login-workspace-pill"><CircleDot size={10} /> Operations</span></div>
          <div className="login-ops-content">
            <div className="login-ops-title"><div><span>ACTIVITY</span><h3>Recent event flow</h3></div><button type="button" aria-label="Activity filters"><Activity size={14} /></button></div>
            <div className="login-event-card"><span className="login-event-mark"><Bell size={15} /></span><span className="login-event-copy"><small>INCOMING EVENT</small><strong>order.confirmed</strong></span><span className="login-event-time">just now</span></div>
            <div className="login-event-steps">
              {activity.map(({ icon: Icon, name, meta, status, tone }, index) => (
                <div className="login-event-row" key={name}>
                  <span className={`login-event-step-icon ${tone}`}><Icon size={13} /></span>
                  <span className="login-event-step-copy"><strong>{name}</strong><small>{meta}</small></span>
                  <span className={`login-event-step-status ${tone}`}><i />{status}</span>
                  {index < activity.length - 1 && <span className="login-event-connector" aria-hidden="true" />}
                </div>
              ))}
            </div>
            <div className="login-ops-channels"><span>CHANNELS</span><div><span><Mail size={12} /> Email</span><span><Webhook size={12} /> Webhook</span></div></div>
          </div>
          <div className="login-ops-footer"><span><span className="login-footer-check"><Check size={11} /></span> Every event has a clear path</span><ArrowRight size={14} /></div>
        </div>
        <div className="signup-visual-footnote"><span><Check size={13} /> Developer-first visibility</span><span>Illustrative product preview</span></div>
      </div>
      <div className="signup-visual-bottom" aria-hidden="true"><span>NOTIFYX</span><span>EVENTS IN · DELIVERY OUT</span></div>
    </aside>
  );
}
