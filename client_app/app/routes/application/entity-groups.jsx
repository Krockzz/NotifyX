import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import EntityGroupsPanel from "../../components/application/EntityGroupsPanel.jsx";
import { API_URI, getCookieHeaders } from "./shared.js";

export async function loader({ request, params }) {
  const appId = params.appId;
  const emptyResult = {
    entityGroups: [],
    entityGroupsError: "",
    selectedEntityGroup: null,
    entityGroupError: "",
  };

  if (!appId) {
    return data({ ...emptyResult, entityGroupsError: "An application ID is required." });
  }
  if (!API_URI) {
    return data({ ...emptyResult, entityGroupsError: "The application service is not configured." });
  }

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
      return data({
        ...emptyResult,
        entityGroupsError: listPayload?.message || "Could not load Entity Groups for this application.",
      });
    }
    if (!Array.isArray(listPayload?.data)) {
      return data({
        ...emptyResult,
        entityGroupsError: "The service returned an invalid Entity Groups list.",
      });
    }

    const entityGroupId = new URL(request.url).searchParams.get("entityGrpId");
    if (!entityGroupId) {
      return data({ ...emptyResult, entityGroups: listPayload.data });
    }

    const detailResponse = await fetch(
      `${baseUrl}/get-entity-id/${encodeURIComponent(appId)}/${encodeURIComponent(entityGroupId)}`,
      {
        method: "GET",
        headers: getCookieHeaders(request),
        credentials: "include",
      },
    );
    if ([401, 403].includes(detailResponse.status)) return redirect("/login");

    const detailPayload = await detailResponse.json().catch(() => null);
    if (!detailResponse.ok || detailPayload?.success === false) {
      return data({
        ...emptyResult,
        entityGroups: listPayload.data,
        entityGroupError: detailPayload?.message || "Could not load this Entity Group.",
      });
    }

    return data({
      ...emptyResult,
      entityGroups: listPayload.data,
      selectedEntityGroup: detailPayload?.data || null,
    });
  } catch {
    return data({
      ...emptyResult,
      entityGroupsError: "Unable to connect to the application service. Try again later.",
    });
  }
}

export async function action({ request, params }) {
  const formData = await request.formData();
  const intent = String(formData.get("intent") || "");
  const appId = params.appId;
  const entityGroupId = String(formData.get("entityGroupId") || "");
  const name = String(formData.get("name") || "").trim();
  const entityIdPath = String(formData.get("entityIdPath") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const invalid = (message) => data({ intent, success: false, message }, { status: 400 });

  if (!appId) return invalid("An application ID is required.");
  if (!API_URI) {
    return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
  }
  if (!["create-entity-group", "update-entity-group", "delete-entity-group"].includes(intent)) {
    return invalid("Unknown Entity Group action.");
  }
  if (intent !== "create-entity-group" && !entityGroupId) {
    return invalid("An Entity Group ID is required.");
  }
  if (intent !== "delete-entity-group" && (!name || !entityIdPath)) {
    return invalid("Enter an Entity Group name and entity ID path.");
  }

  const baseUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/Entity`;
  const isCreate = intent === "create-entity-group";
  const isUpdate = intent === "update-entity-group";
  const apiUrl = isCreate
    ? `${baseUrl}/create-entity/${encodeURIComponent(appId)}`
    : isUpdate
      ? `${baseUrl}/update-entity/${encodeURIComponent(appId)}/${encodeURIComponent(entityGroupId)}`
      : `${baseUrl}/delete-entity/${encodeURIComponent(appId)}/${encodeURIComponent(entityGroupId)}`;
  const body = isCreate || isUpdate
    ? { name, entityIdPath, description: description || null }
    : undefined;

  try {
    const response = await fetch(apiUrl, {
      method: isCreate ? "POST" : isUpdate ? "PATCH" : "DELETE",
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
        message: payload?.message || `Could not ${isCreate ? "create" : isUpdate ? "update" : "delete"} the Entity Group.`,
      }, { status: response.status || 500 });
    }

    return data({
      intent,
      success: true,
      message: payload?.message || (isCreate ? "Entity Group created." : isUpdate ? "Entity Group updated." : "Entity Group deleted."),
      entityGroup: payload?.data || null,
    });
  } catch {
    return data({
      intent,
      success: false,
      message: "Unable to connect to the application service. Try again.",
    }, { status: 502 });
  }
}

export default function EntityGroupsRoute() {
  const { appId, application, user } = useOutletContext();
  const { entityGroups = [], entityGroupsError = "", selectedEntityGroup = null, entityGroupError = "" } = useLoaderData();

  return (
    <EntityGroupsPanel
      key={appId}
      appId={appId}
      entityGroups={entityGroups}
      entityGroupsError={entityGroupsError}
      selectedEntityGroup={selectedEntityGroup}
      entityGroupError={entityGroupError}
      application={application}
      user={user}
    />
  );
}
