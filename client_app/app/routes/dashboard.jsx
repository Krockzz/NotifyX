import { useEffect, useRef, useState } from "react";
import { ArrowRight, Box, Plus, X } from "lucide-react";
import { data, redirect, useFetcher, useLoaderData } from "react-router";
import DashboardNavbar from "../components/dashboard/DashboardNavbar.jsx";

const API_URI = import.meta.env.VITE_API_URL;

function getUserFromValidatedCookie(cookieHeader) {
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

export async function loader({ request }) {
  const cookieHeader = request.headers.get("cookie") || "";
  const res = await fetch(`${API_URI}/api/v1/applications/get-applications`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    credentials: "include",
  });

  if ([400, 401, 403].includes(res.status) || !res.ok) return redirect("/login");

  const info = await res.json();
  return data({ info, user: getUserFromValidatedCookie(cookieHeader) });
}

export async function action({ request }) {
  const formData = await request.formData();

  const appName = String(formData.get("appName") ?? "").trim();

  if (!appName) return data({ error: "Enter an application name." }, { status: 400 });
  if (!API_URI) {
    return data({ error: "Application service is not configured. Please try again later." }, { status: 500 });
  }

  try {
    const res = await fetch(`${API_URI}/api/v1/applications/create-application`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify({ appName }),
    });

    if ([401, 403].includes(res.status)) return redirect("/login");
    const result = await res.json().catch(() => ({}));
    if (!res.ok) {
      return data({ error: result.message || "Could not create the application." }, { status: res.status });
    }
    return data({ created: true });
  } catch {
    return data({ error: "Unable to connect to the application service. Try again." }, { status: 502 });
  }
}

function formatCreatedDate(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function ApplicationCard({ application }) {
  const createdDate = formatCreatedDate(application.created_at);
  return (
    <article className="workspace-app-card">
      <span className="workspace-app-icon" aria-hidden="true"><Box size={19} strokeWidth={1.8} /></span>
      <span className="workspace-app-details">
        <strong>{application.appName}</strong>
        {createdDate && <small>Created {createdDate}</small>}
      </span>
      <ArrowRight className="workspace-app-arrow" size={17} aria-hidden="true" />
    </article>
  );
}

export default function Dashboard() {
  const { info, user } = useLoaderData();
  const fetcher = useFetcher();
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const [nameError, setNameError] = useState("");
  const applications = Array.isArray(info?.data) ? info.data : [];
  const isSubmitting = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.data?.created) {
      dialogRef.current?.close();
      formRef.current?.reset();
      setNameError("");
    }
  }, [fetcher.data]);

  function openDialog() {
    setNameError("");
    dialogRef.current?.showModal();
  }

  function closeDialog() {
    if (!isSubmitting) dialogRef.current?.close();
  }

  function validateApplicationName(event) {
    const name = String(new FormData(event.currentTarget).get("appName") ?? "").trim();
    if (!name) {
      event.preventDefault();
      setNameError("Application name is required.");
    } else {
      setNameError("");
    }
  }

  return (
    <div className="workspace-dashboard">
      <svg
        className="workspace-network"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 640 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="workspace-network-stroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6bb3c4" />
            <stop offset="55%" stopColor="#777ab6" />
            <stop offset="100%" stopColor="#a879d4" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#workspace-network-stroke)" strokeWidth="1.4" opacity=".52">
          <path d="M56 72 146 96 235 48 323 84 403 23 498 61 610 14M56 72 112 190 208 232 235 48M146 96 151 204 208 232 323 84 328 190 421 211 498 61 552 174 610 14M112 190 151 204 176 313 273 289 328 190 350 300 421 211 487 306 552 174 610 244M208 232 273 289 350 300 421 211 487 306 610 244M176 313 273 289 297 396 385 351 487 306 532 395 610 244" />
          <path d="M52 684 142 636 217 671 299 586 390 632 486 574 604 624M52 684 39 786 135 824 217 671 205 792 297 855 299 586 390 632 420 746 486 574 517 690 604 624 595 788M39 786 135 824 205 792 297 855 355 777 420 746 517 690 595 788 604 624M135 824 172 886 297 855 355 777 417 882 517 690 556 829 595 788M172 886 297 855 417 882 556 829 624 899" />
          <path d="M421 211 385 351 297 396 355 477 385 351 532 395 487 306M297 396 241 470 355 477 420 746 355 777M532 395 609 472 517 690 556 829" />
        </g>
        <g fill="#78bfd0" opacity=".72">
          <circle cx="56" cy="72" r="4" /><circle cx="146" cy="96" r="4.5" /><circle cx="235" cy="48" r="4" />
          <circle cx="323" cy="84" r="4.5" /><circle cx="403" cy="23" r="4" /><circle cx="498" cy="61" r="4.5" />
          <circle cx="112" cy="190" r="4" /><circle cx="151" cy="204" r="4.5" /><circle cx="208" cy="232" r="4" />
          <circle cx="328" cy="190" r="4.5" /><circle cx="421" cy="211" r="4" /><circle cx="552" cy="174" r="4.5" />
          <circle cx="273" cy="289" r="4" /><circle cx="350" cy="300" r="4.5" /><circle cx="487" cy="306" r="4" />
          <circle cx="532" cy="395" r="4" /><circle cx="52" cy="684" r="4" /><circle cx="142" cy="636" r="4.5" />
          <circle cx="217" cy="671" r="4" /><circle cx="299" cy="586" r="4.5" /><circle cx="390" cy="632" r="4" />
          <circle cx="486" cy="574" r="4.5" /><circle cx="604" cy="624" r="4" /><circle cx="135" cy="824" r="4.5" />
          <circle cx="205" cy="792" r="4" /><circle cx="297" cy="855" r="4.5" /><circle cx="420" cy="746" r="4" />
          <circle cx="517" cy="690" r="4.5" /><circle cx="595" cy="788" r="4" />
        </g>
        <g fill="#ad82dc" opacity=".78">
          <circle cx="176" cy="313" r="4.5" /><circle cx="385" cy="351" r="4.5" /><circle cx="355" cy="477" r="4" />
          <circle cx="299" cy="586" r="4" /><circle cx="420" cy="746" r="4.5" /><circle cx="355" cy="777" r="4" />
          <circle cx="417" cy="882" r="4.5" />
        </g>
      </svg>
      <DashboardNavbar user={user} />
      <main className="workspace-content">
        <header className="workspace-heading">
          <div>
            <h1>Your applications</h1>
            <p>Manage the applications connected to your notification infrastructure.</p>
          </div>
          <button className="workspace-create-button" type="button" onClick={openDialog}>
            <Plus size={16} aria-hidden="true" /> Create application
          </button>
        </header>

        {applications.length === 0 ? (
          <section className="workspace-empty" aria-labelledby="workspace-empty-title">
            <span className="workspace-empty-icon" aria-hidden="true"><Box size={22} strokeWidth={1.7} /></span>
            <h2 id="workspace-empty-title">No applications yet</h2>
            <p>Create your first application to start integrating NotifyX.</p>
          </section>
        ) : (
          <section className="workspace-applications" aria-label="Your applications">
            {applications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </section>
        )}
      </main>

      <dialog
        ref={dialogRef}
        className="workspace-dialog"
        aria-labelledby="workspace-dialog-title"
        onCancel={(event) => { if (isSubmitting) event.preventDefault(); }}
      >
        <div className="workspace-dialog-heading">
          <span className="workspace-dialog-icon" aria-hidden="true"><Box size={18} /></span>
          <button className="workspace-dialog-close" type="button" aria-label="Close dialog" onClick={closeDialog} disabled={isSubmitting}>
            <X size={17} />
          </button>
        </div>
        <h2 id="workspace-dialog-title">Create application</h2>
        <p className="workspace-dialog-description">Give your application a name to add it to your NotifyX workspace.</p>

        <fetcher.Form ref={formRef} method="post" onSubmit={validateApplicationName}>
          <label className="workspace-field-label" htmlFor="application-name">
            Application name <span aria-hidden="true">*</span>
          </label>
          <input
            id="application-name"
            name="appName"
            type="text"
            placeholder="e.g. Customer portal"
            autoComplete="off"
            maxLength={50}
            required
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? "application-name-error" : undefined}
            onChange={() => setNameError("")}
          />
          {nameError && <p className="workspace-field-error" id="application-name-error" role="alert">{nameError}</p>}
          {fetcher.state === "idle" && fetcher.data?.error && <p className="workspace-field-error" role="alert">{fetcher.data.error}</p>}
          <div className="workspace-dialog-actions">
            <button className="workspace-cancel-button" type="button" onClick={closeDialog} disabled={isSubmitting}>Cancel</button>
            <button className="workspace-create-button" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create application"}
            </button>
          </div>
        </fetcher.Form>
      </dialog>
    </div>
  );
}
