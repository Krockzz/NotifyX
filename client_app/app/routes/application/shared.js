export const API_URI = import.meta.env.VITE_API_URL;

export function getCookieHeaders(request, includeJson = false) {
  const cookieHeader = request.headers.get("Cookie") || "";

  return {
    Accept: "application/json",
    ...(includeJson ? { "Content-Type": "application/json" } : {}),
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
  };
}

export async function fetchJson(url, request) {
  const response = await fetch(url, {
    method: "GET",
    headers: getCookieHeaders(request),
    credentials: "include",
    signal: request.signal,
  });
  const payload = await response.json().catch(() => null);

  return { response, payload };
}

export function getUserFromValidatedCookie(cookieHeader) {
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("accessToken="))
    ?.slice("accessToken=".length);

  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return "";

    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return {
      name: typeof claims.UserName === "string" ? claims.UserName : "",
      email: typeof claims.email === "string" ? claims.email : "",
    };
  } catch {
    return null;
  }
}
