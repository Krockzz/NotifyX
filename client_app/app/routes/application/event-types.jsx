import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import { EventTypesPanel } from "../../components/application/ApplicationDetailPanels.jsx";
import { API_URI, fetchJson, getCookieHeaders } from "./shared.js";

export async function loader({ request, params }) {
  const appId = params.appId;
  const emptyResult = {
    eventTypes: [],
    eventTypesError: "",
    eventTypeGroups: [],
    eventTypeGroupsError: "",
    selectedEventType: null,
    selectedEventTypeError: "",
    eventTypeChannels: [],
    eventTypeChannelsError: "",
  };

  if (!appId) {
    return data({ ...emptyResult, eventTypesError: "An application ID is required to load Event Types." });
  }
  if (!API_URI) {
    return data({ ...emptyResult, eventTypesError: "The application service is not configured." });
  }

  try {
    const apiBaseUrl = API_URI.replace(/\/+$/, "");
    const [eventTypesResult, entityGroupsResult] = await Promise.all([
      fetchJson(`${apiBaseUrl}/api/v1/eventTypes/getEventTypes/${encodeURIComponent(appId)}`, request),
      fetchJson(`${apiBaseUrl}/api/v1/Entity/get-entity/${encodeURIComponent(appId)}`, request),
    ]);
    const statuses = [eventTypesResult.response.status, entityGroupsResult.response.status];

    if (statuses.some((status) => [401, 403].includes(status))) return redirect("/login");

    const eventTypesValid = eventTypesResult.response.ok
      && eventTypesResult.payload?.success !== false
      && Array.isArray(eventTypesResult.payload?.data);
    const entityGroupsValid = entityGroupsResult.response.ok
      && entityGroupsResult.payload?.success !== false
      && Array.isArray(entityGroupsResult.payload?.data);
    const selectedEventTypeId = new URL(request.url).searchParams.get("eventTypeId");
    let selectedEventType = null;
    let selectedEventTypeError = "";
    let eventTypeChannels = [];
    let eventTypeChannelsError = "";

    if (selectedEventTypeId && eventTypesValid) {
      selectedEventType = eventTypesResult.payload.data.find(
        (eventType) => String(eventType.id) === selectedEventTypeId,
      ) || null;

      if (!selectedEventType) {
        selectedEventTypeError = "This Event Type could not be found in the selected application.";
      } else {
        try {
          const channelsUrl = `${apiBaseUrl}/api/v1/eventChannels/get-channels/${encodeURIComponent(selectedEventType.id)}`;
          const channelsResult = await fetchJson(channelsUrl, request);

          if ([401, 403].includes(channelsResult.response.status)) return redirect("/login");

          const channelsValid = channelsResult.response.ok
            && channelsResult.payload?.success !== false
            && Array.isArray(channelsResult.payload?.data);
          eventTypeChannels = channelsValid ? channelsResult.payload.data : [];
          eventTypeChannelsError = channelsValid
            ? ""
            : channelsResult.payload?.message || "Could not load channel configuration for this Event Type.";
        } catch {
          eventTypeChannelsError = "Unable to connect to the application service while loading channel configuration.";
        }
      }
    } else if (selectedEventTypeId && !eventTypesValid) {
      selectedEventTypeError = "Load the Event Types list before opening its channel configuration.";
    }

    return data({
      eventTypes: eventTypesValid ? eventTypesResult.payload.data : [],
      eventTypesError: eventTypesValid
        ? ""
        : eventTypesResult.payload?.message || "Could not load Event Types for this application.",
      eventTypeGroups: entityGroupsValid ? entityGroupsResult.payload.data : [],
      eventTypeGroupsError: entityGroupsValid
        ? ""
        : entityGroupsResult.payload?.message || "Could not load Entity Groups for this application.",
      selectedEventType,
      selectedEventTypeError,
      eventTypeChannels,
      eventTypeChannelsError,
    });
  } catch {
    return data({
      ...emptyResult,
      eventTypesError: "Unable to connect to the application service. Try again later.",
      eventTypeGroupsError: "Unable to connect to the application service. Try again later.",
    });
  }
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  const appId = params.appId;
  const invalid = (message) => data({ intent, success: false, message }, { status: 400 });

  if (!appId) return invalid("An application ID is required.");
  if (!API_URI) {
    return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
  }

  if (intent === "create-event-type") {
    const eventCode = String(formData.get("eventCode") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const entityGrpId = String(formData.get("entityGrpId") || "").trim();

    if (!eventCode) return invalid("Enter an Event Type name.");
    if (eventCode.length > 50) return invalid("Event Type names must be 50 characters or fewer.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventTypes/createEvent/${encodeURIComponent(appId)}`;
    return sendEventTypeRequest(apiUrl, "POST", {
      eventCode,
      description: description || null,
      entityGrpId: entityGrpId || null,
    }, request, intent, "Could not create the Event Type.", "Event Type created successfully.");
  }

  if (intent === "update-event-type") {
    const eventTypeId = String(formData.get("eventTypeId") || "").trim();
    const eventCode = String(formData.get("eventCode") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const hasEntityGroupField = formData.has("entityGrpId");
    const entityGrpId = String(formData.get("entityGrpId") || "").trim();

    if (!eventTypeId) return invalid("An Event Type ID is required.");
    if (!eventCode) return invalid("Enter an Event Type name.");
    if (eventCode.length > 50) return invalid("Event Type names must be 50 characters or fewer.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventTypes/updateEventType/${encodeURIComponent(eventTypeId)}`;
    const body = {
      eventCode,
      description: description || null,
      ...(hasEntityGroupField ? { entityGrpId: entityGrpId || null } : {}),
    };

    return sendEventTypeRequest(apiUrl, "PATCH", body, request, intent, "Could not update this Event Type.", "Event Type updated successfully.");
  }

  if (intent === "create-event-channel" || intent === "update-event-channel") {
    const channelType = String(formData.get("channelType") || "");
    const eventTypeId = String(formData.get("eventTypeId") || "");
    const channelId = String(formData.get("channelId") || "");
    const recipientPath = String(formData.get("recipientPath") || "").trim();
    const isEnabledValue = String(formData.get("isEnabled") || "");
    const allowedChannels = ["EMAIL", "SMS", "PUSH"];

    if (!allowedChannels.includes(channelType)) return invalid("Choose a supported notification channel.");
    if (intent === "create-event-channel") {
      if (!eventTypeId) return invalid("An Event Type is required.");
      if (!recipientPath) return invalid("Enter the payload path for this channel's recipient.");
      if (recipientPath.length > 255) return invalid("Recipient paths must be 255 characters or fewer.");
    } else {
      if (!channelId) return invalid("A channel configuration ID is required.");
      if (!["true", "false"].includes(isEnabledValue)) return invalid("A valid channel state is required.");
    }

    const apiBaseUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventChannels`;
    const apiUrl = intent === "create-event-channel"
      ? `${apiBaseUrl}/create-channel/${encodeURIComponent(eventTypeId)}`
      : `${apiBaseUrl}/update-channels/${encodeURIComponent(channelId)}`;
    const body = intent === "create-event-channel"
      ? { channelType, recipientPath }
      : { isEnabled: isEnabledValue === "true" };

    return sendEventTypeRequest(
      apiUrl,
      "POST",
      body,
      request,
      intent,
      "Could not update this channel configuration.",
      "Channel configuration saved.",
    );
  }

  if (intent === "deactivate-event-type") {
    const eventTypeId = String(formData.get("eventTypeId") || "");
    if (!eventTypeId) return invalid("An Event Type ID is required.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventTypes/deleteEventType/${encodeURIComponent(eventTypeId)}`;
    return sendEventTypeRequest(
      apiUrl,
      "POST",
      undefined,
      request,
      intent,
      "Could not deactivate this Event Type.",
      "Event Type deactivated successfully.",
    );
  }

  return invalid("Unknown Event Type action.");
}

async function sendEventTypeRequest(apiUrl, method, body, request, intent, errorMessage, successMessage) {
  try {
    const response = await fetch(apiUrl, {
      method,
      headers: getCookieHeaders(request, Boolean(body)),
      credentials: "include",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if ([401, 403].includes(response.status)) return redirect("/login");

    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      return data({
        intent,
        success: false,
        message: payload?.message || errorMessage,
      }, { status: response.status || 500 });
    }

    return data({
      intent,
      success: true,
      message: payload?.message || successMessage,
    });
  } catch {
    return data({
      intent,
      success: false,
      message: "Unable to connect to the application service. Try again.",
    }, { status: 502 });
  }
}

export default function EventTypesRoute() {
  const { appId, application, user } = useOutletContext();
  const {
    eventTypes = [],
    eventTypesError = "",
    eventTypeGroups = [],
    eventTypeGroupsError = "",
    selectedEventType = null,
    selectedEventTypeError = "",
    eventTypeChannels = [],
    eventTypeChannelsError = "",
  } = useLoaderData();

  return (
    <EventTypesPanel
      appId={appId}
      eventTypes={eventTypes}
      eventTypesError={eventTypesError}
      entityGroups={eventTypeGroups}
      entityGroupsError={eventTypeGroupsError}
      application={application}
      user={user}
      selectedEventType={selectedEventType}
      selectedEventTypeError={selectedEventTypeError}
      eventTypeChannels={eventTypeChannels}
      eventTypeChannelsError={eventTypeChannelsError}
    />
  );
}
