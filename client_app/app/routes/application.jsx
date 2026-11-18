import { data, Link, redirect, useLoaderData, useLocation, useParams } from "react-router";
import DashboardNavbar from "../components/dashboard/DashboardNavbar.jsx";
import ApplicationDetailHeader from "../components/application/ApplicationDetailHeader.jsx";
import ApplicationSidebar from "../components/application/ApplicationSidebar.jsx";
import EntityGroupsPanel from "../components/application/EntityGroupsPanel.jsx";
import {
  ActivityPanel,
  ApiKeysPanel,
  ApplicationStats,
  ChannelsPanel,
  EventTypesPanel,
  OverviewPanel,
  SettingsPanel,
} from "../components/application/ApplicationDetailPanels.jsx";

const sections = new Set(["keys", "entities", "events", "channels", "activity", "settings"]);
const API_URI = import.meta.env.VITE_API_URL;

function getCookieHeaders(request, includeJson = false) {
  const cookieHeader = request.headers.get("Cookie") || "";
  return {
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

async function fetchJson(url, request) {
  const response = await fetch(url, {
    method: "GET",
    headers: getCookieHeaders(request),
    credentials: "include",
  });
  const payload = await response.json().catch(() => null);

  return { response, payload };
}

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
  if (params.tab === "events") {
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
      return data({
        ...emptyResult,
        eventTypesError: "An application ID is required to load Event Types.",
      });
    }

    if (!API_URI) {
      return data({
        ...emptyResult,
        eventTypesError: "The application service is not configured.",
      });
    }

    try {
      const apiBaseUrl = API_URI.replace(/\/+$/, "");
      const [eventTypesResult, entityGroupsResult] = await Promise.all([
        fetchJson(`${apiBaseUrl}/api/v1/eventTypes/getEventTypes/${encodeURIComponent(appId)}`, request),
        fetchJson(`${apiBaseUrl}/api/v1/Entity/get-entity/${encodeURIComponent(appId)}`, request),
      ]);
      const statuses = [eventTypesResult.response.status, entityGroupsResult.response.status];

      if (statuses.some((status) => [401, 403].includes(status))) {
        return redirect("/login");
      }

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
          const channelsUrl = `${apiBaseUrl}/api/v1/eventChannels/get-channels/${encodeURIComponent(selectedEventType.id)}`;
          try {
            const channelsResult = await fetchJson(channelsUrl, request);

            if ([401, 403].includes(channelsResult.response.status)) {
              return redirect("/login");
            }

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

  if (params.tab === "entities") {
    const appId = params.appId;
    if (!appId) return data({ entityGroups: [], entityGroupsError: "An application ID is required.", selectedEntityGroup: null, entityGroupError: "" });
    if (!API_URI) return data({ entityGroups: [], entityGroupsError: "The application service is not configured.", selectedEntityGroup: null, entityGroupError: "" });

    try {
      const baseUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Entity`;
      const listResponse = await fetch(`${baseUrl}/get-entity/${encodeURIComponent(appId)}`, {
        method: "GET",
        headers: getCookieHeaders(request),
        credentials: "include",
      });
      if ([401, 403].includes(listResponse.status)) return redirect("/login");
      const listPayload = await listResponse.json().catch(() => null);
      if (!listResponse.ok || listPayload?.success === false) {
        return data({ entityGroups: [], entityGroupsError: listPayload?.message || "Could not load Entity Groups for this application.", selectedEntityGroup: null, entityGroupError: "" });
      }
      if (!Array.isArray(listPayload?.data)) {
        return data({ entityGroups: [], entityGroupsError: "The service returned an invalid Entity Groups list.", selectedEntityGroup: null, entityGroupError: "" });
      }

      const entityGroupId = new URL(request.url).searchParams.get("entityGrpId");
      if (!entityGroupId) return data({ entityGroups: listPayload.data, entityGroupsError: "", selectedEntityGroup: null, entityGroupError: "" });

      const detailResponse = await fetch(`${baseUrl}/get-entity-id/${encodeURIComponent(appId)}/${encodeURIComponent(entityGroupId)}`, {
        method: "GET",
        headers: getCookieHeaders(request),
        credentials: "include",
      });
      if ([401, 403].includes(detailResponse.status)) return redirect("/login");
      const detailPayload = await detailResponse.json().catch(() => null);
      if (!detailResponse.ok || detailPayload?.success === false) {
        return data({ entityGroups: listPayload.data, entityGroupsError: "", selectedEntityGroup: null, entityGroupError: detailPayload?.message || "Could not load this Entity Group." });
      }
      return data({ entityGroups: listPayload.data, entityGroupsError: "", selectedEntityGroup: detailPayload?.data || null, entityGroupError: "" });
    } catch {
      return data({ entityGroups: [], entityGroupsError: "Unable to connect to the application service. Try again later.", selectedEntityGroup: null, entityGroupError: "" });
    }
  }

  if (params.tab !== "keys") {
    return data({ apiKeys: [], apiKeysError: "", entityGroups: [], entityGroupsError: "", selectedEntityGroup: null, entityGroupError: "" });
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

export async function action({ request, params }) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  const appId = params.appId;

  if (intent === "create-event-type") {
    const eventCode = String(formData.get("eventCode") || "").trim();
    const description = String(formData.get("description") || "").trim();
    const entityGrpId = String(formData.get("entityGrpId") || "").trim();
    const invalid = (message) => data({ intent, success: false, message }, { status: 400 });

    if (!appId) return invalid("An application ID is required.");
    if (!API_URI) {
      return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
    }
    if (!eventCode) return invalid("Enter an Event Type name.");
    if (eventCode.length > 50) return invalid("Event Type names must be 50 characters or fewer.");

    try {
      const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventTypes/createEvent/${encodeURIComponent(appId)}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getCookieHeaders(request, true),
        credentials: "include",
        body: JSON.stringify({
          eventCode,
          description: description || null,
          entityGrpId: entityGrpId || null,
        }),
      });

      if ([401, 403].includes(response.status)) return redirect("/login");

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        return data({
          intent,
          success: false,
          message: payload?.message || "Could not create the Event Type.",
        }, { status: response.status || 500 });
      }

      return data({
        intent,
        success: true,
        message: payload?.message || "Event Type created successfully.",
      });
    } catch {
      return data({
        intent,
        success: false,
        message: "Unable to connect to the application service. Try again.",
      }, { status: 502 });
    }
  }

  if (intent === "create-event-channel" || intent === "update-event-channel") {
    const channelType = String(formData.get("channelType") || "");
    const eventTypeId = String(formData.get("eventTypeId") || "");
    const channelId = String(formData.get("channelId") || "");
    const recipientPath = String(formData.get("recipientPath") || "").trim();
    const isEnabledValue = String(formData.get("isEnabled") || "");
    const invalid = (message) => data({ intent, success: false, message }, { status: 400 });
    const allowedChannels = ["EMAIL", "SMS", "PUSH"];

    if (!API_URI) {
      return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
    }

    if (!allowedChannels.includes(channelType)) {
      return invalid("Choose a supported notification channel.");
    }

    if (intent === "create-event-channel") {
      if (!eventTypeId) return invalid("An Event Type is required.");
      if (!recipientPath) return invalid("Enter the payload path for this channel's recipient.");
      if (recipientPath.length > 255) return invalid("Recipient paths must be 255 characters or fewer.");
    } else {
      if (!channelId) return invalid("A channel configuration ID is required.");
      if (!["true", "false"].includes(isEnabledValue)) {
        return invalid("A valid channel state is required.");
      }
    }

    const apiBaseUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventChannels`;
    const apiUrl = intent === "create-event-channel"
      ? `${apiBaseUrl}/create-channel/${encodeURIComponent(eventTypeId)}`
      : `${apiBaseUrl}/update-channels/${encodeURIComponent(channelId)}`;
    const body = intent === "create-event-channel"
      ? { channelType, recipientPath }
      : { isEnabled: isEnabledValue === "true" };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getCookieHeaders(request, true),
        credentials: "include",
        body: JSON.stringify(body),
      });

      if ([401, 403].includes(response.status)) return redirect("/login");

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        return data({
          intent,
          success: false,
          message: payload?.message || "Could not update this channel configuration.",
        }, { status: response.status || 500 });
      }

      return data({
        intent,
        success: true,
        message: payload?.message || "Channel configuration saved.",
      });
    } catch {
      return data({
        intent,
        success: false,
        message: "Unable to connect to the application service. Try again.",
      }, { status: 502 });
    }
  }

  if (intent === "deactivate-event-type") {
    const eventTypeId = String(formData.get("eventTypeId") || "");

    if (!appId) {
      return data({ intent, success: false, message: "An application ID is required." }, { status: 400 });
    }
    if (!eventTypeId) {
      return data({ intent, success: false, message: "An Event Type ID is required." }, { status: 400 });
    }
    if (!API_URI) {
      return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
    }

    try {
      const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/eventTypes/deleteEventType/${encodeURIComponent(eventTypeId)}`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getCookieHeaders(request),
        credentials: "include",
      });

      if ([401, 403].includes(response.status)) return redirect("/login");

      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.success === false) {
        return data({
          intent,
          success: false,
          message: payload?.message || "Could not deactivate this Event Type.",
        }, { status: response.status || 500 });
      }

      return data({
        intent,
        success: true,
        message: payload?.message || "Event Type deactivated successfully.",
      });
    } catch {
      return data({
        intent,
        success: false,
        message: "Unable to connect to the application service. Try again.",
      }, { status: 502 });
    }
  }

  const entityGroupId = String(formData.get("entityGroupId") || "");
  const name = String(formData.get("name") || "").trim();
  const entityIdPath = String(formData.get("entityIdPath") || "").trim();
  const description = String(formData.get("description") || "").trim();

  const invalid = (message) => data({ intent, success: false, message }, { status: 400 });
  if (!appId) return invalid("An application ID is required.");
  if (!API_URI) return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
  if (!["create-entity-group", "update-entity-group", "delete-entity-group"].includes(intent)) return invalid("Unknown Entity Group action.");
  if (intent !== "create-entity-group" && !entityGroupId) return invalid("An Entity Group ID is required.");
  if (intent !== "delete-entity-group" && (!name || !entityIdPath)) return invalid("Enter an Entity Group name and entity ID path.");

  const baseUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Entity`;
  const isCreate = intent === "create-entity-group";
  const isUpdate = intent === "update-entity-group";
  const url = isCreate
    ? `${baseUrl}/create-entity/${encodeURIComponent(appId)}`
    : isUpdate
      ? `${baseUrl}/update-entity/${encodeURIComponent(appId)}/${encodeURIComponent(entityGroupId)}`
      : `${baseUrl}/delete-entity/${encodeURIComponent(appId)}/${encodeURIComponent(entityGroupId)}`;
  const body = isCreate || isUpdate ? { name, entityIdPath, description: description || null } : undefined;

  try {
    const response = await fetch(url, {
      method: isCreate ? "POST" : isUpdate ? "PATCH" : "DELETE",
      headers: getCookieHeaders(request, Boolean(body)),
      credentials: "include",
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if ([401, 403].includes(response.status)) return redirect("/login");
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.success === false) {
      return data({ intent, success: false, message: payload?.message || `Could not ${isCreate ? "create" : isUpdate ? "update" : "delete"} the Entity Group.` }, { status: response.status || 500 });
    }
    return data({ intent, success: true, message: payload?.message || (isCreate ? "Entity Group created." : isUpdate ? "Entity Group updated." : "Entity Group deleted."), entityGroup: payload?.data || null });
  } catch {
    return data({ intent, success: false, message: "Unable to connect to the application service. Try again." }, { status: 502 });
  }
}

export default function ApplicationDetail() {
  const { appId, tab } = useParams();
  const {
    apiKeys = [],
    apiKeysError = "",
    entityGroups = [],
    entityGroupsError = "",
    selectedEntityGroup = null,
    entityGroupError = "",
    eventTypes = [],
    eventTypesError = "",
    eventTypeGroups = [],
    eventTypeGroupsError = "",
    selectedEventType = null,
    selectedEventTypeError = "",
    eventTypeChannels = [],
    eventTypeChannelsError = "",
  } = useLoaderData();
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
                {currentSection === "entities" && <EntityGroupsPanel key={appId} appId={appId} entityGroups={entityGroups} entityGroupsError={entityGroupsError} selectedEntityGroup={selectedEntityGroup} entityGroupError={entityGroupError} application={application} user={locationState.user} />}
                {currentSection === "events" && (
                  <EventTypesPanel
                    appId={appId}
                    eventTypes={eventTypes}
                    eventTypesError={eventTypesError}
                    entityGroups={eventTypeGroups}
                    entityGroupsError={eventTypeGroupsError}
                    application={application}
                    user={locationState.user}
                    selectedEventType={selectedEventType}
                    selectedEventTypeError={selectedEventTypeError}
                    eventTypeChannels={eventTypeChannels}
                    eventTypeChannelsError={eventTypeChannelsError}
                  />
                )}
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
