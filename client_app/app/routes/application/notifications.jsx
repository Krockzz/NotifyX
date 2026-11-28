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

function isValidDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getInitialData({ page, pageSize, status, channelType, search, from, to }, message = "") {
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
      search,
      from,
      to,
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
  const search = (searchParams.get("search") || "").trim();
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const filters = { page, pageSize, status, channelType, search, from, to };
  const initialData = getInitialData(filters);

  if (!appId) {
    return data({ ...initialData, error: "An application ID is required to load notifications." });
  }

  if (!API_URI) {
    return data({ ...initialData, error: "The application service is not configured." });
  }

  if ((from && !isValidDateOnly(from)) || (to && !isValidDateOnly(to))) {
    return data({ ...initialData, error: "Choose valid calendar dates for the notification range." });
  }

  if (from && to && from > to) {
    return data({ ...initialData, error: "The from date must be on or before the to date." });
  }

  const apiQuery = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  if (status) apiQuery.set("status", status);
  if (channelType) apiQuery.set("channelType", channelType);
  if (search) apiQuery.set("search", search);
  if (from) apiQuery.set("from", from);
  if (to) apiQuery.set("to", to);

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
