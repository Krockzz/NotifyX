import { featureCards } from "./data.js";

export default function FeatureStrip() {
  return (
    <section className="feature-strip section-shell" aria-label="NotifyX capabilities">
      {featureCards.map(({ icon: Icon, title, description }) => (
        <article className="strip-item" key={title}>
          <span className="strip-icon"><Icon size={18} strokeWidth={1.8} /></span>
          <span className="strip-copy"><strong>{title}</strong><small>{description}</small></span>
        </article>
      ))}
    </section>
  );
}
