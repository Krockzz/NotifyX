import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import DeadLettersPanel, { DeadLettersSkeleton } from "../../components/application/DeadLettersPanel.jsx";
import { API_URI, fetchJson } from "./shared.js";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZES = new Set([10, 20, 50]);
const DEAD_LETTER_STATUSES = new Set(["PENDING", "REPLAYED", "RESOLVED"]);
const CHANNEL_TYPES = new Set(["EMAIL", "SMS", "PUSH", "WEBHOOK"]);

function readPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function createEmptyResult({ appId, page, pageSize, status, channelType }, error = "") {
  return {
    appId,
    deadLetters: [],
    pagination: {
      page,
      limit: pageSize,
      totalCount: 0,
      totalPages: 0,
    },
    filters: { page, pageSize, status, channelType },
    error,
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
  const status = DEAD_LETTER_STATUSES.has(requestedStatus) ? requestedStatus : "";
  const channelType = CHANNEL_TYPES.has(requestedChannel) ? requestedChannel : "";
  const filters = { appId, page, pageSize, status, channelType };
  const emptyResult = createEmptyResult(filters);

  if (!appId) {
    return data(createEmptyResult(filters, "An application ID is required to load dead letters."));
  }

  if (!API_URI) {
    return data(createEmptyResult(filters, "The application service is not configured."));
  }

  const apiQuery = new URLSearchParams({
    page: String(page),
    limit: String(pageSize),
  });
  if (status) apiQuery.set("status", status);
  if (channelType) apiQuery.set("channelType", channelType);

  const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/DLQ/application/${encodeURIComponent(appId)}?${apiQuery}`;

  try {
    const { response, payload } = await fetchJson(apiUrl, request);

    if ([401, 403].includes(response.status)) return redirect("/login");

    if (!response.ok || payload?.success === false) {
      return data({
        ...emptyResult,
        error: payload?.message || `Could not load dead letters (HTTP ${response.status}).`,
      });
    }

    const responseData = payload?.data;
    if (!Array.isArray(responseData?.deadLetters) || !responseData?.pagination) {
      return data({
        ...emptyResult,
        error: "The service returned an invalid dead-letter response.",
      });
    }

    return data({
      ...emptyResult,
      deadLetters: responseData.deadLetters,
      pagination: responseData.pagination,
      error: "",
    });
  } catch (error) {
    if (request.signal.aborted) throw error;

    const detail = error instanceof Error ? error.message : "Unknown network error";
    return data({
      ...emptyResult,
      error: `Unable to load dead letters: ${detail}`,
    });
  }
}

export function HydrateFallback() {
  return <DeadLettersSkeleton />;
}

export default function DeadLettersRoute() {
  const { appId, application } = useOutletContext();
  const { deadLetters, pagination, filters, error } = useLoaderData();

  return (
    <DeadLettersPanel
      appId={appId}
      application={application}
      deadLetters={deadLetters}
      pagination={pagination}
      filters={filters}
      error={error}
    />
  );
}
