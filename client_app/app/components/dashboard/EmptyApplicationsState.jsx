import { ArrowRight, Plus, Workflow } from "lucide-react";
import Button from "../ui/button.jsx";

export default function EmptyApplicationsState({ onCreate }) {
  return (
    <div className="dash-empty-state">
      <div className="dash-empty-illustration" aria-hidden="true"><span className="dash-empty-orbit orbit-left" /><span className="dash-empty-orbit orbit-right" /><span className="dash-empty-icon"><Workflow size={22} /></span><i className="dash-empty-node node-top" /><i className="dash-empty-node node-bottom" /></div>
      <span className="dash-empty-eyebrow">YOUR WORKSPACE STARTS HERE</span>
      <h3>No applications yet</h3>
      <p>Create an application to represent a product or environment. It gives your events, channels, and templates a clear home.</p>
      <Button onClick={onCreate}><Plus size={16} /> Create your first application</Button>
      <span className="dash-empty-footnote"><ArrowRight size={13} /> You can create separate applications for staging and production.</span>
    </div>
  );
}
