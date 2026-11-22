import { data, redirect, useLoaderData, useOutletContext, useRevalidator } from "react-router";
import EventDetailsPanel from "../../components/application/EventDetailsPanel.jsx";
import EventDetailsSkeleton from "../../components/application/EventDetailsSkeleton.jsx";
import { API_URI, fetchJson } from "./shared.js";

function getEmptyResult(message = "") {
  return {
    event: null,
    eventError: message,
    eventNotFound: false,
  };
}

export async function loader({ request, params }) {
  const { appId, eventId } = params;

  if (!appId || !eventId) {
    return data(getEmptyResult("Both an application ID and event ID are required."));
  }
  if (!API_URI) {
    return data(getEmptyResult("The application service is not configured."));
  }

  const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Events/${encodeURIComponent(appId)}/${encodeURIComponent(eventId)}`;

  try {
    const { response, payload } = await fetchJson(apiUrl, request);

    if ([401, 403].includes(response.status)) return redirect("/login");

    if (response.status === 404) {
      return data({
        event: null,
        eventError: payload?.message || "This event could not be found in the selected application.",
        eventNotFound: true,
      });
    }

    if (!response.ok || payload?.success === false) {
      return data(getEmptyResult(payload?.message || "Could not load this event."));
    }

    if (!payload?.data || typeof payload.data !== "object") {
      return data(getEmptyResult("The service returned invalid event details."));
    }

    return data({
      event: payload.data,
      eventError: "",
      eventNotFound: false,
    });
  } catch {
    return data(getEmptyResult("Unable to connect to the application service. Try again later."));
  }
}

export function HydrateFallback() {
  return <EventDetailsSkeleton />;
}

export default function EventDetailsRoute() {
  const { appId, application } = useOutletContext();
  const { event, eventError, eventNotFound } = useLoaderData();
  const revalidator = useRevalidator();

  return (
    <EventDetailsPanel
      appId={appId}
      application={application}
      event={event}
      error={eventError}
      notFound={eventNotFound}
      isRetrying={revalidator.state !== "idle"}
      onRetry={() => revalidator.revalidate()}
    />
  );
}

