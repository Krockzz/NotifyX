
import { redirect, data } from "react-router";

const API_URI = import.meta.env.VITE_API_URL;

export async function action({ request, params }) {
    const cookieHeader = request.headers.get("Cookie");
    const appId = params.appId;

    if (!appId) {
        return data(
            { message: "No application ID provided" },
            { status: 400 }
        );
    }

    try {
        const response = await fetch(
            `${API_URI}/api/v1/applications/deleteApp/${appId}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(cookieHeader && { Cookie: cookieHeader }),
                },
                body: JSON.stringify({ appId }),
            }
        );

        if (!response.ok) {
            return data(
                { message: "Something went wrong while deleting the application" },
                { status: response.status }
            );
        }

        return redirect("/dashboard");
    } catch (err) {
        return data(
            { message: err.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
