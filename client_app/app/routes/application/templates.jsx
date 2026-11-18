import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import TemplatesPanel from "../../components/application/TemplatesPanel.jsx";
import { API_URI, fetchJson, getCookieHeaders } from "./shared.js";

const CHANNEL_TYPES = new Set(["EMAIL", "SMS", "PUSH", "WEBHOOK"]);

export async function loader({ request, params }) {
  const appId = params.appId;
  const emptyResult = {
    eventTypes: [],
    eventTypesError: "",
    selectedEventTypeId: "",
    selectedEventType: null,
    selectedEventTypeError: "",
    templates: [],
    templatesError: "",
    channels: [],
    channelsError: "",
    selectedTemplate: null,
    selectedTemplateError: "",
  };

  if (!appId) {
    return data({ ...emptyResult, eventTypesError: "An application ID is required." });
  }
  if (!API_URI) {
    return data({ ...emptyResult, eventTypesError: "The application service is not configured." });
  }

  try {
    const apiBaseUrl = API_URI.replace(/\/+$/, "");
    const eventTypesUrl = `${apiBaseUrl}/api/v1/eventTypes/getEventTypes/${encodeURIComponent(appId)}`;
    const eventTypesResult = await fetchJson(eventTypesUrl, request);
    if ([401, 403].includes(eventTypesResult.response.status)) return redirect("/login");

    const eventTypesValid = eventTypesResult.response.ok
      && eventTypesResult.payload?.success !== false
      && Array.isArray(eventTypesResult.payload?.data);
    if (!eventTypesValid) {
      return data({
        ...emptyResult,
        eventTypesError: eventTypesResult.payload?.message || "Could not load Event Types for this application.",
      });
    }

    const eventTypes = eventTypesResult.payload.data;
    const searchParams = new URL(request.url).searchParams;
    const selectedEventTypeId = searchParams.get("eventTypeId") || "";
    const selectedTemplateId = searchParams.get("templateId") || "";
    if (!selectedEventTypeId) {
      return data({ ...emptyResult, eventTypes });
    }

    const selectedEventType = eventTypes.find(
      (eventType) => String(eventType.id) === selectedEventTypeId,
    ) || null;
    if (!selectedEventType) {
      return data({
        ...emptyResult,
        eventTypes,
        selectedEventTypeId,
        selectedEventTypeError: "This Event Type could not be found in the selected application.",
      });
    }

    const [templatesResult, channelsResult] = await Promise.all([
      fetchJson(`${apiBaseUrl}/api/v1/Templates/get-template/${encodeURIComponent(selectedEventTypeId)}`, request),
      fetchJson(`${apiBaseUrl}/api/v1/eventChannels/get-channels/${encodeURIComponent(selectedEventTypeId)}`, request),
    ]);
    if ([templatesResult.response.status, channelsResult.response.status].some((status) => [401, 403].includes(status))) {
      return redirect("/login");
    }

    const templatesValid = templatesResult.response.ok
      && templatesResult.payload?.success !== false
      && Array.isArray(templatesResult.payload?.data);
    const channelsValid = channelsResult.response.ok
      && channelsResult.payload?.success !== false
      && Array.isArray(channelsResult.payload?.data);
    let selectedTemplate = null;
    let selectedTemplateError = "";

    if (selectedTemplateId) {
      const detailUrl = `${apiBaseUrl}/api/v1/Templates/get-templateId/${encodeURIComponent(selectedTemplateId)}`;
      const detailResult = await fetchJson(detailUrl, request);
      if ([401, 403].includes(detailResult.response.status)) return redirect("/login");

      if (!detailResult.response.ok || detailResult.payload?.success === false || !detailResult.payload?.data) {
        selectedTemplateError = detailResult.payload?.message || "Could not load this template.";
      } else if (String(detailResult.payload.data.eventTypeId) !== selectedEventTypeId) {
        selectedTemplateError = "This template does not belong to the selected Event Type.";
      } else {
        selectedTemplate = detailResult.payload.data;
      }
    }

    return data({
      eventTypes,
      eventTypesError: "",
      selectedEventTypeId,
      selectedEventType,
      selectedEventTypeError: "",
      templates: templatesValid ? templatesResult.payload.data : [],
      templatesError: templatesValid
        ? ""
        : templatesResult.payload?.message || "Could not load templates for this Event Type.",
      channels: channelsValid
        ? channelsResult.payload.data.filter((channel) => CHANNEL_TYPES.has(channel.channelType))
        : [],
      channelsError: channelsValid
        ? ""
        : channelsResult.payload?.message || "Could not load channel availability for this Event Type.",
      selectedTemplate,
      selectedTemplateError,
    });
  } catch {
    return data({
      ...emptyResult,
      eventTypesError: "Unable to connect to the application service. Try again later.",
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

  if (intent === "create-template") {
    const eventTypeId = String(formData.get("eventTypeId") || "").trim();
    const channelType = String(formData.get("channelType") || "");
    const subject = String(formData.get("subject") || "").trim();
    const bodyContent = String(formData.get("bodyContent") || "");

    if (!eventTypeId) return invalid("Select an Event Type before creating a template.");
    if (!CHANNEL_TYPES.has(channelType)) return invalid("Choose a supported channel type.");
    if (!bodyContent.trim()) return invalid("Body content cannot be empty.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Templates/create-template/${encodeURIComponent(eventTypeId)}`;
    return sendTemplateRequest(apiUrl, "POST", {
      channelType,
      subject: subject || null,
      bodyContent: bodyContent.trim(),
    }, request, intent, "Could not create this template.", "Template created successfully.");
  }

  if (intent === "update-template") {
    const templateId = String(formData.get("templateId") || "").trim();
    const subject = String(formData.get("subject") || "").trim();
    const bodyContent = String(formData.get("bodyContent") || "");

    if (!templateId) return invalid("A template ID is required.");
    if (!bodyContent.trim()) return invalid("Body content cannot be empty.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Templates/update-template/${encodeURIComponent(templateId)}`;
    return sendTemplateRequest(apiUrl, "POST", {
      subject: subject || null,
      bodyContent: bodyContent.trim(),
    }, request, intent, "Could not update this template.", "Template updated successfully.");
  }

  if (intent === "activate-template") {
    const templateId = String(formData.get("templateId") || "").trim();
    if (!templateId) return invalid("A template ID is required.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Templates/update-template/${encodeURIComponent(templateId)}`;
    return sendTemplateRequest(apiUrl, "POST", { isActive: true }, request, intent, "Could not activate this template.", "Template activated successfully.");
  }

  if (intent === "deactivate-template") {
    const templateId = String(formData.get("templateId") || "").trim();
    if (!templateId) return invalid("A template ID is required.");

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Templates/delete-template/${encodeURIComponent(templateId)}`;
    return sendTemplateRequest(apiUrl, "POST", undefined, request, intent, "Could not deactivate this template.", "Template deactivated successfully.");
  }

  return invalid("Unknown template action.");
}

async function sendTemplateRequest(apiUrl, method, body, request, intent, errorMessage, successMessage) {
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
      template: payload?.data || null,
    });
  } catch {
    return data({
      intent,
      success: false,
      message: "Unable to connect to the application service. Try again.",
    }, { status: 502 });
  }
}

export default function TemplatesRoute() {
  const { appId, application, user } = useOutletContext();
  const loaderData = useLoaderData();
  const actionUrl = `/dashboard/${encodeURIComponent(appId)}/templates`;

  return (
    <TemplatesPanel
      application={application}
      user={user}
      actionUrl={actionUrl}
      {...loaderData}
    />
  );
}
