import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import NotificationsPanel, { NotificationsSkeleton } from "../../components/application/NotificationsPanel.jsx";
import { API_URI, fetchJson } from "./shared.js";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZES = new Set([10, 20, 50]);
const NOTIFICATION_STATUSES = new Set([
  "PENDING",
  "QUEUED",
  "PROCESSING",
  "SENT",
  "FAILED",
  "CANCELLED",
]);
const CHANNEL_TYPES = new Set(["EMAIL", "SMS", "PUSH", "WEBHOOK"]);

function readPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function getInitialData({ page, pageSize, status, channelType }, message = "") {
  return {
    notifications: [],
    pagination: {
      currentPage: page,
      limit: pageSize,
      totalNotifications: 0,
      totalPages: 0,
    },
    filters: {
      page,
      pageSize,
      status,
      channelType,
    },
    error: message,
  };
}

export async function loader({ request, params }) {
  const { appId } = params;
  const searchParams = new URL(request.url).searchParams;
  const page = readPositiveInteger(searchParams.get("page"), 1);
  const requestedPageSize = readPositiveInteger(searchParams.get("limit"), DEFAULT_PAGE_SIZE);
  const pageSize = PAGE_SIZES.has(requestedPageSize) ? requestedPageSize : DEFAULT_PAGE_SIZE;
  const requestedStatus = searchParams.get("status") || "";
  const requestedChannel = searchParams.get("channelType") || "";
  const status = NOTIFICATION_STATUSES.has(requestedStatus) ? requestedStatus : "";
  const channelType = CHANNEL_TYPES.has(requestedChannel) ? requestedChannel : "";
  const filters = { page, pageSize, status, channelType };
  const initialData = getInitialData(filters);

  if (!appId) {
    return data({ ...initialData, error: "An application ID is required to load notifications." });
  }

  if (!API_URI) {
    return data({ ...initialData, error: "The application service is not configured." });
  }

  const apiQuery = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  if (status) apiQuery.set("status", status);
  if (channelType) apiQuery.set("channelType", channelType);

  const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/notification/${encodeURIComponent(appId)}?${apiQuery}`;

  try {
    const { response, payload } = await fetchJson(apiUrl, request);

    if ([401, 403].includes(response.status)) return redirect("/login");

    if (!response.ok || payload?.success === false) {
      return data({
        ...initialData,
        error: payload?.message || `Could not load notifications (HTTP ${response.status}).`,
      });
    }

    const responseData = payload?.data;
    if (!Array.isArray(responseData?.notifications) || !responseData?.pagination) {
      return data({
        ...initialData,
        error: "The service returned an invalid notifications response.",
      });
    }

    return data({
      notifications: responseData.notifications,
      pagination: responseData.pagination,
      filters,
      error: "",
    });
  } catch (error) {
    if (request.signal.aborted) throw error;

    const detail = error instanceof Error ? error.message : "Unknown network error";
    return data({ ...initialData, error: `Unable to load notifications: ${detail}` });
  }
}

export function HydrateFallback() {
  return <NotificationsSkeleton />;
}

export default function NotificationsRoute() {
  const { appId, application } = useOutletContext();
  const { notifications, pagination, filters, error } = useLoaderData();

  return (
    <NotificationsPanel
      appId={appId}
      application={application}
      notifications={notifications}
      pagination={pagination}
      filters={filters}
      error={error}
    />
  );
}
