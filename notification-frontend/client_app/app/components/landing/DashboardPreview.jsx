import { Bell, Check, Radio, Smartphone, Zap } from "lucide-react";

export default function DashboardPreview() {
  return (
    <div className="dashboard-stage" aria-label="Illustrative NotifyX dashboard preview">
      <div className="dashboard-glow" aria-hidden="true" />
      <div className="dashboard-window">
        <aside className="dashboard-sidebar" aria-label="Preview navigation">
          <div className="dashboard-brand"><span className="dashboard-brand-mark"><Bell size={13} /></span> NotifyX <span className="sidebar-caret">⌄</span></div>
          <span className="sidebar-label">WORKSPACE</span>
          <div className="sidebar-item active"><span className="sidebar-symbol">◫</span> Overview</div>
          <div className="sidebar-item"><span className="sidebar-symbol">↗</span> Events</div>
          <div className="sidebar-item"><span className="sidebar-symbol">▤</span> Templates</div>
          <div className="sidebar-item"><span className="sidebar-symbol">◷</span> Deliveries</div>
          <div className="sidebar-item"><span className="sidebar-symbol">⌘</span> API keys</div>
          <div className="sidebar-bottom"><span className="avatar-dot">N</span><span>NotifyX demo<small>Sample workspace</small></span><span className="sidebar-more">···</span></div>
        </aside>
        <div className="dashboard-main">
          <div className="dashboard-toolbar"><span>Workspace <b>/</b> Overview</span><span className="sample-label"><i /> SAMPLE DATA</span></div>
          <div className="dashboard-title"><div><h3>Overview</h3><p>A snapshot of notification activity</p></div><button className="date-button" type="button">Last 7 days <span>⌄</span></button></div>
          <div className="metric-grid">
            <div className="metric-card"><div><span>Events received</span><span className="metric-icon metric-purple"><Zap size={12} /></span></div><strong>1,284</strong><small><i className="metric-up">↗</i> Sample activity</small></div>
            <div className="metric-card"><div><span>Delivered</span><span className="metric-icon metric-green"><Check size={12} /></span></div><strong>1,196</strong><small>Across enabled channels</small></div>
            <div className="metric-card"><div><span>Needs attention</span><span className="metric-icon metric-amber"><Radio size={12} /></span></div><strong>18</strong><small>Review delivery attempts</small></div>
          </div>
          <div className="chart-card">
            <div className="chart-heading"><div><strong>Notification volume</strong><span>Illustrative weekly activity</span></div><button type="button" aria-label="More chart options">···</button></div>
            <div className="chart-area" role="img" aria-label="Illustrative notification volume chart trending upward during the week">
              <div className="chart-y-labels"><span>1.5k</span><span>1.0k</span><span>500</span><span>0</span></div>
              <svg viewBox="0 0 460 104" preserveAspectRatio="none" aria-hidden="true">
                <defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8d79ff" stopOpacity=".28" /><stop offset="1" stopColor="#8d79ff" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 83H460M0 54H460M0 25H460" className="chart-gridline" />
                <path d="M0 76 C18 74 24 54 47 61 S77 70 96 56 S130 42 152 48 S187 66 207 52 S238 55 258 42 S288 49 309 34 S342 47 360 39 S394 51 413 31 S442 29 460 17 L460 104 L0 104 Z" fill="url(#chart-fill)" />
                <path d="M0 76 C18 74 24 54 47 61 S77 70 96 56 S130 42 152 48 S187 66 207 52 S238 55 258 42 S288 49 309 34 S342 47 360 39 S394 51 413 31 S442 29 460 17" className="chart-line" />
                <circle cx="460" cy="17" r="3.5" className="chart-endpoint" />
              </svg>
              <div className="chart-x-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
            </div>
          </div>
        </div>
      </div>
      <div className="channel-float-card"><span className="float-icon float-email">@</span><span><b>Email</b><small><i className="float-status" /> Delivered · sample</small></span></div>
      <div className="channel-float-card float-sms"><span className="float-icon float-mobile"><Smartphone size={15} /></span><span><b>SMS</b><small><i className="float-status" /> Queued · sample</small></span></div>
      <div className="channel-float-card float-push"><span className="float-icon float-push-icon"><Bell size={15} /></span><span><b>Push</b><small><i className="float-status float-status-muted" /> Processing</small></span></div>
    </div>
  );
}
