import { data, redirect, useLoaderData, useOutletContext } from "react-router";
import { ApiKeysPanel } from "../../components/application/ApplicationDetailPanels.jsx";
import { API_URI, getCookieHeaders } from "./shared.js";

export async function loader({ request, params }) {
  const appId = params.appId;

  if (!appId) {
    return data({ apiKeys: [], apiKeysError: "An application ID is required to load API keys." });
  }
  if (!API_URI) {
    return data({ apiKeys: [], apiKeysError: "The application service is not configured." });
  }

  try {
    const cookieHeader = request.headers.get("Cookie") || "";
    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/apiKey/get-api-keys/${encodeURIComponent(appId)}`;
    const response = await fetch(apiUrl, {
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

  if (!appId) {
    return data({ intent, success: false, message: "An application ID is required." }, { status: 400 });
  }
  if (!API_URI) {
    return data({ intent, success: false, message: "The application service is not configured." }, { status: 500 });
  }

  if (intent === "create-api-key") {
    const name = String(formData.get("name") || "").trim();
    if (!name) {
      return data({ intent, success: false, message: "Enter a name for this API key." }, { status: 400 });
    }

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/apiKey/create-api-key/${encodeURIComponent(appId)}`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getCookieHeaders(request, true),
        credentials: "include",
        body: JSON.stringify({ name }),
      });
      if ([401, 403].includes(response.status)) return redirect("/login");

      const payload = await response.json().catch(() => null);
      const responseData = payload?.data || {};
      const apiKey = responseData.apiKey;
      const keyRecord = responseData.key;
      if (!response.ok || payload?.success === false) {
        return data({
          intent,
          success: false,
          message: payload?.message || `Could not create an API key (HTTP ${response.status}).`,
        }, { status: response.status || 500 });
      }
      if (typeof apiKey !== "string" || !apiKey || !keyRecord?.id || !keyRecord?.keyPrefix) {
        return data({
          intent,
          success: false,
          message: "The service response did not include the new API key and its saved record.",
        }, { status: 502 });
      }

      return data({
        intent,
        success: true,
        apiKey,
        keyRecord,
        message: payload?.message || "API key created successfully.",
      });
    } catch {
      return data({
        intent,
        success: false,
        message: "Unable to connect to the application service. Try again.",
      }, { status: 502 });
    }
  }

  if (intent === "revoke-api-key") {
    const keyId = String(formData.get("keyId") || "").trim();
    if (!keyId) {
      return data({ intent, success: false, message: "An API key ID is required." }, { status: 400 });
    }

    const apiUrl = `${API_URI.replace(/\/+$/, "")}/api/v1/apiKey/revoke-api-key/${encodeURIComponent(appId)}/${encodeURIComponent(keyId)}`;
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: getCookieHeaders(request),
        credentials: "include",
      });
      if ([401, 403].includes(response.status)) return redirect("/login");

      const payload = await response.json().catch(() => null);
      const responseData = payload?.data || payload || {};
      const keyRecord = responseData.key
        || responseData.apiKeyRecord
        || responseData.updatedKey
        || responseData.apiKey
        || responseData;
      if (!response.ok || payload?.success === false) {
        return data({
          intent,
          success: false,
          message: payload?.message || `Could not revoke this API key (HTTP ${response.status}).`,
        }, { status: response.status || 500 });
      }
      if (!keyRecord || typeof keyRecord !== "object" || !keyRecord.revokedAt) {
        return data({
          intent,
          success: false,
          message: "The service did not return the revoked API key record.",
        }, { status: 502 });
      }

      return data({
        intent,
        success: true,
        keyRecord,
        message: payload?.message || "API key revoked successfully.",
      });
    } catch {
      return data({
        intent,
        success: false,
        message: "Unable to connect to the application service. Try again.",
      }, { status: 502 });
    }
  }

  return data({ intent, success: false, message: "Unknown API key action." }, { status: 400 });
}

export default function ApiKeysRoute() {
  const { appId } = useOutletContext();
  const { apiKeys = [], apiKeysError = "" } = useLoaderData();
  const actionUrl = `/dashboard/${encodeURIComponent(appId)}/keys`;

  return <ApiKeysPanel key={appId} appId={appId} apiKeys={apiKeys} apiKeysError={apiKeysError} actionUrl={actionUrl} />;
}
