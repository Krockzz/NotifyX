import { ArrowUpRight } from "lucide-react";
import { featureCards } from "./data.js";

export default function FeatureSection() {
  return (
    <section className="section section-shell" id="product">
      <div className="section-heading" data-reveal>
        <div><span className="eyebrow section-eyebrow">THE NOTIFICATION LAYER</span><h2>Less plumbing.<br /><span>More product.</span></h2></div>
        <p>Notification infrastructure should keep your team moving—not become another system to babysit.</p>
      </div>
      <div className="feature-grid">
        {featureCards.map(({ icon: Icon, title, description, tag }, i) => (
          <article className="feature-card" key={title} data-reveal>
            <div className="feature-card-top"><span className="feature-icon"><Icon size={19} strokeWidth={1.8} /></span><span className="feature-number">0{i + 1}</span></div>
            <span className="feature-tag">{tag}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="card-arrow" aria-hidden="true"><ArrowUpRight size={15} /></span>
          </article>
        ))}
      </div>
    </section>
  );
}
