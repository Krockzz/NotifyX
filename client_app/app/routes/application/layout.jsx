import { data, Link, Outlet, redirect, useLoaderData, useLocation, useNavigation, useParams } from "react-router";
import DashboardNavbar from "../../components/dashboard/DashboardNavbar.jsx";
import ApplicationSidebar from "../../components/application/ApplicationSidebar.jsx";
import EventDetailsSkeleton from "../../components/application/EventDetailsSkeleton.jsx";
import { API_URI, getCookieHeaders, getUserFromValidatedCookie } from "./shared.js";

export async function loader({ request, params }) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const user = getUserFromValidatedCookie(cookieHeader);

  if (!params.appId) {
    return data({ application: null, applicationError: "An application ID is required.", user });
  }

  if (!API_URI) {
    return data({ application: null, applicationError: "The application service is not configured.", user });
  }

  try {
    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/applications/get-applications`;
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: getCookieHeaders(request),
      credentials: "include",
    });

    if ([400, 401, 403].includes(response.status)) return redirect("/login");

    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false || !Array.isArray(payload?.data)) {
      return data({
        application: null,
        applicationError: payload?.message || "Could not load this application.",
        user,
      });
    }

    const application = payload.data.find((item) => String(item.id) === params.appId) || null;

    return data({
      application,
      applicationError: application ? "" : "This application was not found for your account.",
      user,
    });
  } catch {
    return data({
      application: null,
      applicationError: "Unable to connect to the application service. Try again later.",
      user,
    });
  }
}

function ApplicationUnavailableState({ message }) {
  return (
    <main className="grid min-h-[65vh] place-items-center px-5 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-11 place-items-center rounded-xl border border-border bg-surface-2/45 text-slate-400" aria-hidden="true">!</span>
        <h1 className="mt-4 text-lg font-semibold text-slate-100">Application details unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {message || "This application could not be loaded."}
        </p>
        <Link to="/dashboard#applications" className="mt-5 inline-flex min-h-10 items-center rounded-lg border border-border px-4 text-sm text-slate-200 transition hover:bg-surface-2/75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 motion-reduce:transition-none">
          Back to applications
        </Link>
      </div>
    </main>
  );
}

export default function ApplicationLayout() {
  const { appId } = useParams();
  const { application, applicationError, user } = useLoaderData();
  const location = useLocation();
  const navigation = useNavigation();
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const currentSection = pathSegments[2] || "overview";
  const eventDetailsPath = `/dashboard/${encodeURIComponent(appId)}/events/`;
  const isOpeningEventDetails = navigation.state === "loading"
    && navigation.location?.pathname.startsWith(eventDetailsPath);

  return (
    <div className="workspace-dashboard min-h-screen">
      <DashboardNavbar user={user} />
      {!application ? (
        <ApplicationUnavailableState message={applicationError} />
      ) : (
        <main className="application-detail-enter mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-5 px-4 pb-12 pt-5 sm:px-6 lg:grid-cols-[224px_minmax(0,1fr)] lg:gap-7 lg:px-8 lg:pt-7">
          <ApplicationSidebar
            appId={appId}
            currentSection={currentSection}
            application={application}
            user={user}
          />
          <div className="min-w-0 application-detail-panel-enter">
            {isOpeningEventDetails
              ? <EventDetailsSkeleton />
              : <Outlet context={{ appId, application, user }} />
            }
          </div>
        </main>
      )}
    </div>
  );
}


