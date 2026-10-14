import { ArrowRight, Check, Code2 } from "lucide-react";
import DashboardPreview from "./DashboardPreview.jsx";
import { Link } from "react-router";


export default function Hero() {
  return (
    <section className="reference-hero section-shell" id="top">
      <div className="hero-copy reference-hero-copy">
        <div className="announcement"><span className="announcement-dot" /> RELIABLE · EVENT-DRIVEN · DEVELOPER-FIRST</div>
        <h1>Powerful notifications<br />for modern <span className="headline-highlight">applications.</span></h1>
        <p className="hero-description">NotifyX helps your product send, manage, and track notifications across multiple channels—through one event-driven workflow.</p>
        <div className="hero-actions">
     

           <Link 
  to="/signup" 
  className="button button-primary button-large"
  onClick={(e) => console.log("Link clicked! Destination:", e.currentTarget.href)}
> 
  Getting started <ArrowRight size={16} />
</Link>

          <a className="button button-quiet button-large" href="#developers"><Code2 size={16} /> View developer overview</a>
        </div>
        <div className="hero-note"><span className="hero-note-icon"><Check size={12} /></span> One event pipeline. Clear delivery history.</div>
      </div>
      <DashboardPreview />
    </section>
  );
}
