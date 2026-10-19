import { useEffect, useRef, useState } from "react";
import { Activity, Box, Check, CircleAlert, Plus, TrendingUp, X } from "lucide-react";
import { data, redirect, useFetcher, useLoaderData, useRevalidator } from "react-router";
import DashboardNavbar from "../components/dashboard/DashboardNavbar.jsx";
import MetricCard from "../components/dashboard/MetricCard.jsx";
import ApplicationCard from "../components/dashboard/ApplicationCard.jsx";

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

const sampleMetrics = [
  {
    label: "Total messages sent",
    value: "12,480",
    detail: <><TrendingUp size={14} className="text-emerald-300" aria-hidden="true" /><span>+12% from last week</span></>,
    icon: Activity,
    tone: "violet",
  },
  {
    label: "Success rate",
    value: "99.94%",
    detail: <><Check size={14} className="text-emerald-300" aria-hidden="true" /><span>Healthy delivery rate</span></>,
    icon: Check,
    tone: "green",
  },
  {
    label: "Error rate",
    value: "0.06%",
    detail: <><CircleAlert size={14} className="text-red-400" aria-hidden="true" /><span>Within expected range</span></>,
    icon: CircleAlert,
    tone: "red",
  },
];

export default function Dashboard() {
  const { info, user } = useLoaderData();
  const fetcher = useFetcher();
  const revalidator = useRevalidator();
  const dialogRef = useRef(null);
  const formRef = useRef(null);
  const [nameError, setNameError] = useState("");
  const [deletedApplicationIds, setDeletedApplicationIds] = useState([]);
  const applications = Array.isArray(info?.data) ? info.data : [];
  const visibleApplications = applications.filter((application) => !deletedApplicationIds.includes(application.id));
  const isSubmitting = fetcher.state !== "idle";

  function handleApplicationChanged({ id, type }) {
    if (type === "delete") {
      setDeletedApplicationIds((current) => [...current, id]);
    }
    revalidator.revalidate();
  }

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
            <stop offset="0%" stopColor="var(--color-queued)" />
            <stop offset="55%" stopColor="var(--color-primary-accent)" />
            <stop offset="100%" stopColor="var(--color-hover-accent)" />
          </linearGradient>
        </defs>
        <g fill="none" stroke="url(#workspace-network-stroke)" strokeWidth="1.4" opacity=".52">
          <path d="M56 72 146 96 235 48 323 84 403 23 498 61 610 14M56 72 112 190 208 232 235 48M146 96 151 204 208 232 323 84 328 190 421 211 498 61 552 174 610 14M112 190 151 204 176 313 273 289 328 190 350 300 421 211 487 306 552 174 610 244M208 232 273 289 350 300 421 211 487 306 610 244M176 313 273 289 297 396 385 351 487 306 532 395 610 244" />
          <path d="M52 684 142 636 217 671 299 586 390 632 486 574 604 624M52 684 39 786 135 824 217 671 205 792 297 855 299 586 390 632 420 746 486 574 517 690 604 624 595 788M39 786 135 824 205 792 297 855 355 777 420 746 517 690 595 788 604 624M135 824 172 886 297 855 355 777 417 882 517 690 556 829 595 788M172 886 297 855 417 882 556 829 624 899" />
          <path d="M421 211 385 351 297 396 355 477 385 351 532 395 487 306M297 396 241 470 355 477 420 746 355 777M532 395 609 472 517 690 556 829" />
        </g>
        <g fill="var(--color-queued)" opacity=".72">
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
        <g fill="var(--color-primary-accent)" opacity=".78">
          <circle cx="176" cy="313" r="4.5" /><circle cx="385" cy="351" r="4.5" /><circle cx="355" cy="477" r="4" />
          <circle cx="299" cy="586" r="4" /><circle cx="420" cy="746" r="4.5" /><circle cx="355" cy="777" r="4" />
          <circle cx="417" cy="882" r="4.5" />
        </g>
      </svg>
      <DashboardNavbar user={user} />
      <main id="overview" className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-9 sm:px-6 sm:pt-11 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-300/80">Workspace overview</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-100">Your applications</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage the applications connected to your notification infrastructure.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 text-sm font-medium text-white shadow-[0_0_25px_rgba(139,92,246,0.25)] transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
            type="button"
            onClick={openDialog}
          >
            <Plus size={16} aria-hidden="true" /> Create application
          </button>
        </header>

        <section aria-label="Sample delivery metrics" className="mb-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-slate-200">Delivery overview</h2>
            <span className="rounded-full border border-border px-2.5 py-1 text-[10px] font-medium text-slate-500">Sample data</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sampleMetrics.map((metric) => <MetricCard key={metric.label} {...metric} />)}
          </div>
        </section>

        {visibleApplications.length === 0 ? (
          <section id="applications" aria-labelledby="workspace-empty-title" className="grid min-h-72 place-items-center rounded-xl border border-dashed border-border bg-surface-1/70 px-6 text-center">
            <div className="max-w-sm">
              <span className="mx-auto grid size-12 place-items-center rounded-xl border border-border bg-surface-2 text-slate-400">
                <Box size={21} aria-hidden="true" />
              </span>
              <h2 id="workspace-empty-title" className="mt-4 text-lg font-medium text-slate-100">No applications yet</h2>
              <p className="mt-2 text-sm leading-6 text-slate-400">Create your first application to start integrating NotifyX.</p>
            </div>
          </section>
        ) : (
          <section id="applications" aria-label="Your applications">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-200">Applications</h2>
              <span className="text-xs text-slate-500">{visibleApplications.length} total</span>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {visibleApplications.map((application) => (
                <ApplicationCard key={application.id} application={application} onChanged={handleApplicationChanged} user={user} />
              ))}
            </div>
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
