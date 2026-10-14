import { Bell } from "lucide-react";
import { getEmailInitial } from "../../utils/getEmailInitial.js";
import "./DashboardNavbar.css";

export default function DashboardNavbar({ email }) {
  const initial = getEmailInitial(email);

  return (
    <header className="dashboard-navbar">
      <div className="dashboard-navbar__brand" aria-label="NotifyX">
        <span className="dashboard-navbar__brand-icon" aria-hidden="true">
          <Bell size={17} strokeWidth={2.2} />
        </span>
        <span className="dashboard-navbar__brand-name">NotifyX</span>
      </div>

      <span
        className="dashboard-navbar__avatar"
        role="img"
        aria-label={`Account avatar: ${initial}`}
      >
        {initial}
      </span>
    </header>
  );
}
