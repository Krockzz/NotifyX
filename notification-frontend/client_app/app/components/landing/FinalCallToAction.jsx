import { ArrowUpRight, Bell, Check, Radio, Zap } from "lucide-react";

export default function FinalCallToAction() {
  return (
    <section className="cta-section section-shell" id="get-started">
      <div className="cta-glow" aria-hidden="true" />
      <div className="cta-content" data-reveal><span className="eyebrow">YOUR EVENTS, IN GOOD HANDS</span><h2>Give every message<br />a clear path.</h2><p>Build notification experiences around your product events—with delivery you can follow.</p><a className="button button-primary button-large" href="#top">Explore NotifyX <ArrowUpRight size={15} /></a></div>
      <div className="cta-orbit" data-reveal aria-hidden="true"><div className="orbit-ring ring-a" /><div className="orbit-ring ring-b" /><div className="orbit-core"><Bell size={25} /></div><span className="orbit-node node-a"><Check size={13} /></span><span className="orbit-node node-b"><Zap size={13} /></span><span className="orbit-node node-c"><Radio size={13} /></span></div>
    </section>
  );
}
