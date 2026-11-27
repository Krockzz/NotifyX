import { data, redirect, useLoaderData, useOutletContext, useRevalidator } from "react-router";
import NotificationDetailsPanel from "../../components/application/NotificationDetailsPanel.jsx";
import EventDetailsSkeleton from "../../components/application/EventDetailsSkeleton.jsx";
import { API_URI, fetchJson } from "./shared.js";

function getEmptyResult(message = "") {
  return {
    notification: null,
    notificationError: message,
    notificationNotFound: false,
  };
}

export async function loader({ request, params }) {
  const { appId, notificationId } = params;

  if (!appId || !notificationId) {
    return data(getEmptyResult("Both an application ID and notification ID are required."));
  }

  if (!API_URI) {
    return data(getEmptyResult("The application service is not configured."));
  }

  const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/notification/${encodeURIComponent(appId)}/${encodeURIComponent(notificationId)}`;

  try {
    const { response, payload } = await fetchJson(apiUrl, request);

    if ([401, 403].includes(response.status)) return redirect("/login");

    if (response.status === 404) {
      return data({
        notification: null,
        notificationError: payload?.message || "This notification could not be found in the selected application.",
        notificationNotFound: true,
      });
    }

    if (!response.ok || payload?.success === false) {
      return data(getEmptyResult(payload?.message || "Could not load this notification."));
    }

    const notification = payload?.data ?? payload?.notification ?? payload;

    if (!notification || typeof notification !== "object" || Array.isArray(notification)) {
      return data({
        notification: null,
        notificationError: "The service returned invalid notification details.",
        notificationNotFound: true,
      });
    }

    return data({
      notification,
      notificationError: "",
      notificationNotFound: false,
    });
  } catch {
    return data(getEmptyResult("Unable to connect to the application service. Try again later."));
  }
}

export function HydrateFallback() {
  return <EventDetailsSkeleton />;
}

export default function NotificationDetailsRoute() {
  const { appId, application } = useOutletContext();
  const { notification, notificationError, notificationNotFound } = useLoaderData();
  const revalidator = useRevalidator();

  return (
    <NotificationDetailsPanel
      appId={appId}
      application={application}
      notification={notification}
      error={notificationError}
      notFound={notificationNotFound}
      isRetrying={revalidator.state !== "idle"}
      onRetry={() => revalidator.revalidate()}
    />
  );
}
