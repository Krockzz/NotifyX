import { data, Link, redirect, useLoaderData, useLocation, useParams } from "react-router";
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
const API_URI = import.meta.env.VITE_API_URL;

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

export async function loader({ request, params }) {
  if (params.tab !== "keys") {
    return data({ apiKeys: [], apiKeysError: "" });
  }

  const appId = params.appId

  if (!appId) {
    return data({ apiKeys: [], apiKeysError: "An application ID is required to load API keys." });
  }


  try {
    const cookieHeader = request.headers.get("Cookie") || "";
    const response = await fetch(`${API_URI}/api/v1/apiKey/get-api-keys/${encodeURIComponent(appId)}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      credentials: "include",
    });

    if ([400, 401, 403].includes(response.status)) return redirect("/login");

    let payload;
    try {
      payload = await response.json();
    } catch {
      return data({ apiKeys: [], apiKeysError: "The application service returned an unreadable API-key response." });
    }

    if (!response.ok || payload?.success === false) {
      return data({ apiKeys: [], apiKeysError: payload?.message || "Could not load API keys for this application." });
    }

    const apiKeys = payload?.data?.apiKeys;
    if (!Array.isArray(apiKeys)) {
      return data({ apiKeys: [], apiKeysError: "The application service returned an invalid API-key list." });
    }

    return data({ apiKeys, apiKeysError: "" });
  } catch {
    return data({ apiKeys: [], apiKeysError: "Unable to connect to the application service. Try again later." });
  }
}

export default function ApplicationDetail() {
  const { appId, tab } = useParams();
  const { apiKeys = [], apiKeysError = "" } = useLoaderData();
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
            {currentSection === "overview" ? (
              <>
                <ApplicationDetailHeader application={application} />
                <ApplicationStats />
                <OverviewPanel appId={appId} application={application} user={locationState.user} />
              </>
            ) : (
              <div className="application-detail-panel-enter">
                {currentSection === "keys" && <ApiKeysPanel key={appId} appId={appId} apiKeys={apiKeys} apiKeysError={apiKeysError} />}
                {currentSection === "events" && <EventTypesPanel />}
                {currentSection === "channels" && <ChannelsPanel />}
                {currentSection === "activity" && <ActivityPanel />}
                {currentSection === "settings" && <SettingsPanel />}
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
