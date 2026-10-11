import { ArrowRight, Check, Copy } from "lucide-react";
import { useState } from "react";

export default function DeveloperSection() {
  const [copied, setCopied] = useState(false);

  async function copyExample() {
    const sample = JSON.stringify({ event: "order.confirmed", data: { orderId: "ord_2048", email: "sam@example.com" } }, null, 2);
    try {
      await navigator.clipboard.writeText(sample);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section className="section section-shell developer-section" id="developers">
      <div className="developer-copy"><span className="eyebrow section-eyebrow">BUILT FOR DEVELOPERS</span><h2>Start with an event.<br /><span>Keep your code clean.</span></h2><p>Model what happened in your product, then let notification rules handle how it reaches your users.</p><a className="text-link" href="#get-started">Explore NotifyX <ArrowRight size={14} /></a></div>
      <div className="code-window">
        <div className="code-titlebar"><div className="window-dots" aria-hidden="true"><i /><i /><i /></div><span>event-payload.json</span><button className="copy-button" type="button" onClick={copyExample} aria-label={copied ? "Payload copied" : "Copy example payload"}>{copied ? <Check size={14} /> : <Copy size={14} />}</button></div>
        <div className="code-body"><div className="code-lines" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span></div><pre><code><span className="code-brace">&#123;</span>{"\n"}  <span className="code-key">"event"</span>: <span className="code-string">"order.confirmed"</span>,{"\n"}  <span className="code-key">"data"</span>: <span className="code-brace">&#123;</span>{"\n"}    <span className="code-key">"orderId"</span>: <span className="code-string">"ord_2048"</span>,{"\n"}    <span className="code-key">"email"</span>: <span className="code-string">"sam@example.com"</span>{"\n"}  <span className="code-brace">&#125;</span>{"\n"}<span className="code-brace">&#125;</span></code></pre></div>
        <div className="code-foot"><span><span className="pulse-dot" /> Illustrative event payload</span><span>API contract to follow</span></div>
      </div>
    </section>
  );
}
