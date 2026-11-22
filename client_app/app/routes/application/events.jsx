import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import EventsPanel from "../../components/application/EventsPanel.jsx";
import { API_URI, fetchJson } from "./shared.js";

const DEFAULT_PAGE_SIZE = 10;
const ALLOWED_PAGE_SIZES = new Set([10, 25, 50]);

function readPositiveInteger(value, fallback) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function isDateOnly(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function toApiDate(value, isEndOfDay = false) {
  const time = isEndOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  return new Date(`${value}${time}`).toISOString();
}

function getApiErrorMessage(result, fallback) {
  if (result.error) return "Unable to connect to the application service. Try again later.";
  return result.payload?.message || fallback;
}

export async function loader({ request, params }) {
  const appId = params.appId;
  const searchParams = new URL(request.url).searchParams;
  const page = readPositiveInteger(searchParams.get("page"), 1);
  const requestedPageSize = readPositiveInteger(searchParams.get("limit"), DEFAULT_PAGE_SIZE);
  const pageSize = ALLOWED_PAGE_SIZES.has(requestedPageSize) ? requestedPageSize : DEFAULT_PAGE_SIZE;
  const eventTypeId = searchParams.get("eventTypeId") || "";
  const from = searchParams.get("from") || "";
  const to = searchParams.get("to") || "";
  const filters = { page, pageSize, eventTypeId, from, to };
  const emptyResult = {
    events: [],
    pagination: { currentPage: 1, pageSize, totalEvents: 0, totalPages: 0, hasNextPage: false, hasPreviousPage: false },
    eventTypes: [],
    eventsError: "",
    eventTypesError: "",
    filters,
  };

  if (!appId) {
    return data({ ...emptyResult, eventsError: "An application ID is required to load events." });
  }
  if (!API_URI) {
    return data({ ...emptyResult, eventsError: "The application service is not configured." });
  }

  let dateError = "";
  if ((from && !isDateOnly(from)) || (to && !isDateOnly(to))) {
    dateError = "Choose valid start and end dates.";
  } else if (from && to && from > to) {
    dateError = "The start date must be on or before the end date.";
  }

  const apiBaseUrl = API_URI.replace(/\/+$/, "");
  const eventsQuery = new URLSearchParams({ page: String(page), limit: String(pageSize) });
  if (eventTypeId) eventsQuery.set("eventTypeId", eventTypeId);
  if (from && !dateError) eventsQuery.set("from", toApiDate(from));
  if (to && !dateError) eventsQuery.set("to", toApiDate(to, true));

  const eventsUrl = `${apiBaseUrl}/api/v1/Events/${encodeURIComponent(appId)}?${eventsQuery}`;
  const eventTypesUrl = `${apiBaseUrl}/api/v1/eventTypes/getEventTypes/${encodeURIComponent(appId)}`;
  const [eventsResult, eventTypesResult] = await Promise.all([
    dateError ? Promise.resolve(null) : fetchJson(eventsUrl, request).catch((error) => ({ error })),
    fetchJson(eventTypesUrl, request).catch((error) => ({ error })),
  ]);

  if ([eventsResult?.response?.status, eventTypesResult?.response?.status].some((status) => [401, 403].includes(status))) {
    return redirect("/login");
  }

  const eventTypesValid = eventTypesResult.response?.ok
    && eventTypesResult.payload?.success !== false
    && Array.isArray(eventTypesResult.payload?.data);
  const eventsValid = eventsResult?.response?.ok
    && eventsResult.payload?.success !== false
    && Array.isArray(eventsResult.payload?.data?.events)
    && eventsResult.payload?.data?.pagination;

  return data({
    ...emptyResult,
    events: eventsValid ? eventsResult.payload.data.events : [],
    pagination: eventsValid ? eventsResult.payload.data.pagination : emptyResult.pagination,
    eventsError: dateError || (eventsValid ? "" : getApiErrorMessage(eventsResult, "Could not load events for this application.")),
    eventTypes: eventTypesValid ? eventTypesResult.payload.data : [],
    eventTypesError: eventTypesValid ? "" : getApiErrorMessage(eventTypesResult, "Could not load Event Types for the filter."),
    filters,
  });
}

export default function EventsRoute() {
  const { appId, application } = useOutletContext();
  const { events, pagination, eventTypes, eventsError, eventTypesError, filters } = useLoaderData();

  return (
    <EventsPanel
      appId={appId}
      application={application}
      events={events}
      pagination={pagination}
      eventTypes={eventTypes}
      eventsError={eventsError}
      eventTypesError={eventTypesError}
      filters={filters}
    />
  );
}
