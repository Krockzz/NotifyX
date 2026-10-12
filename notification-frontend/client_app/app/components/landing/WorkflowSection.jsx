import { ArrowDownRight, ArrowRight } from "lucide-react";
import { steps } from "./data.js";

export default function WorkflowSection() {
  return (
    <section className="workflow-section" id="workflow">
      <div className="section-shell workflow-layout">
        <div className="workflow-intro" data-reveal><span className="eyebrow section-eyebrow">A SMALLER SURFACE AREA</span><h2>From event<br />to <span>delivered.</span></h2><p>Keep your application focused on business logic. NotifyX takes care of the notification path.</p><a className="text-link" href="#developers">Explore the developer flow <ArrowRight size={14} /></a></div>
        <div className="steps-list">
          {steps.map(([number, title, description], i) => (
            <article className="step-row" key={number} data-reveal>
              <div className="step-track"><span className="step-number">{number}</span>{i < steps.length - 1 && <span className="step-line" />}</div>
              <div className="step-copy"><h3>{title}</h3><p>{description}</p></div>
              <ArrowDownRight className="step-arrow" size={17} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
