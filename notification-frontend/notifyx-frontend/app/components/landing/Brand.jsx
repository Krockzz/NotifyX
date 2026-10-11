import { Bell } from "lucide-react";

export default function Brand({ footer = false, href = "#top" }) {
  return (
    <a className={`brand${footer ? " brand-footer" : ""}`} href={href} aria-label="NotifyX home">
      <span className="brand-mark" aria-hidden="true"><Bell size={15} strokeWidth={2.4} /></span>
      <span>Notify<span className="brand-accent">X</span></span>
    </a>
  );
}
