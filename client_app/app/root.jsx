import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import "./app.css";

export function links() {
  return [
    { rel: "preconnect", href: "https://fonts.googleapis.com" },
    { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
    { rel: "icon", href: "/notifyx.svg", type: "image/svg+xml" },
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
    },
  ];
}

export function Layout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#090a12" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }) {
  const isResponse = isRouteErrorResponse(error);
  const title = isResponse && error.status === 404 ? "404" : "Something went wrong";
  const message = isResponse
    ? error.statusText || "The requested page could not be found."
    : import.meta.env.DEV && error instanceof Error
      ? error.message
      : "Please try again in a moment.";

  return (
    <main className="error-page">
      <a className="brand" href="/" aria-label="NotifyX home">
        <span className="brand-mark" aria-hidden="true">N</span>Notify<span>X</span>
      </a>
      <h1>{title}</h1>
      <p>{message}</p>
      <a className="button button-primary" href="/">Return home</a>
    </main>
  );
}
