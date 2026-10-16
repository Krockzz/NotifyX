import { Link, useLocation, useParams } from "react-router";
import DashboardNavbar from "../components/dashboard/DashboardNavbar.jsx";
import ApplicationDetailHeader from "../components/application/ApplicationDetailHeader.jsx";
import ApplicationSidebar from "../components/application/ApplicationSidebar.jsx";
import {
  ActivityPanel,
  ApiKeysPanel,
  ApplicationStats,
  ChannelsPanel,
  EventTypesPanel,
  OverviewPanel,
  SettingsPanel,
} from "../components/application/ApplicationDetailPanels.jsx";

const sections = new Set(["keys", "events", "channels", "activity", "settings"]);

function ApplicationUnavailableState({ notFound = false }) {
  return (
    <main className="grid min-h-[65vh] place-items-center px-5 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-surface-2/45 text-slate-400" aria-hidden="true">{notFound ? "!" : ""}</span>
        <h1 className="mt-4 text-lg font-semibold text-slate-100">{notFound ? "Application details unavailable" : "Open an application"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {notFound
            ? "This page was opened without application data. Return to your applications and open one from its card."
            : "Select an application from your dashboard to view its workspace."}
        </p>
        <Link to="/dashboard#applications" className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm text-slate-200 transition hover:bg-surface-2/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">Back to applications</Link>
      </div>
    </main>
  );
}

export default function ApplicationDetail() {
  const { appId, tab } = useParams();
  const location = useLocation();
  const locationState = location.state || {};
  const candidate = locationState.application;
  const application = String(candidate?.id ?? "") === appId ? candidate : null;
  const currentSection = sections.has(tab) ? tab : "overview";

  return (
    <div className="workspace-dashboard min-h-screen">
      <DashboardNavbar user={locationState.user} />
      {!appId || !application ? (
        <ApplicationUnavailableState notFound={Boolean(appId)} />
      ) : (
        <main className="application-detail-enter mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-4 pb-12 pt-5 sm:px-6 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:pt-7">
          <ApplicationSidebar appId={appId} currentSection={currentSection} application={application} user={locationState.user} />
          <div className="min-w-0">
            <ApplicationDetailHeader application={application} />
            <ApplicationStats />

            {currentSection === "overview" && <OverviewPanel appId={appId} application={application} user={locationState.user} />}
            {currentSection === "keys" && <div className="application-detail-panel-enter"><ApiKeysPanel /></div>}
            {currentSection === "events" && <div className="application-detail-panel-enter"><EventTypesPanel eventTypes={null} /></div>}
            {currentSection === "channels" && <div className="application-detail-panel-enter"><ChannelsPanel /></div>}
            {currentSection === "activity" && <div className="application-detail-panel-enter"><ActivityPanel /></div>}
            {currentSection === "settings" && <div className="application-detail-panel-enter"><SettingsPanel /></div>}
          </div>
        </main>
      )}
    </div>
  );
}
