import { useEffect, useRef, useState } from "react";
import { Bell, Box, ChevronDown, LayoutDashboard, ListChecks, LogOut, Settings } from "lucide-react";
import { Form, Link, useNavigation } from "react-router";
import { getEmailInitial } from "../../utils/getEmailInitial.js";

const primaryLinks = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Applications", to: "/dashboard#applications", icon: Box, active: false },
  { label: "Logs", icon: ListChecks, active: false },
  { label: "Settings", icon: Settings, active: false },
];

export default function DashboardNavbar({ user }) {
  const accountRef = useRef(null);
  const avatarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const isLoggingOut = navigation.state !== "idle" && navigation.formAction === "/logout";
  const email = typeof user?.email === "string" ? user.email : "";
  const name = typeof user?.name === "string" && user.name.trim() ? user.name.trim() : "NotifyX user";
  const initial = getEmailInitial(email);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!accountRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        avatarRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-1/90 text-slate-200 shadow-sm shadow-black/10 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" className="flex shrink-0 items-center gap-2.5" aria-label="NotifyX overview">
          <span className="grid size-8 place-items-center rounded-lg border border-violet-300/20 bg-violet-400/10 text-violet-200">
            <Bell size={17} aria-hidden="true" />
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            Notify<span className="text-violet-300">X</span>
          </span>
        </Link>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {primaryLinks.map(({ label, to, icon: Icon, active }) =>
            to ? (
              <Link
                key={label}
                to={to}
                aria-current={active ? "page" : undefined}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition-colors ${
                  active ? "bg-surface-2/85 text-white" : "text-slate-400 hover:bg-surface-2/75 hover:text-slate-100"
                }`}
              >
                <Icon size={15} aria-hidden="true" />{label}
              </Link>
            ) : (
              <span
                key={label}
                aria-disabled="true"
                title={`${label} is coming soon`}
                className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-slate-600"
              >
                <Icon size={15} aria-hidden="true" />{label}
                <span className="sr-only">(coming soon)</span>
              </span>
            ),
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            aria-label="Notifications, coming soon"
            title="Notifications"
            disabled
            className="relative grid size-9 place-items-center rounded-lg text-slate-500 opacity-75 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed"
          >
            <Bell size={17} aria-hidden="true" />
          </button>

          <div className="relative" ref={accountRef}>
            <button
              ref={avatarRef}
              type="button"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={isOpen}
              onClick={() => setIsOpen((open) => !open)}
              className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-violet-300 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-1"
            >
              <span className="grid size-9 place-items-center rounded-full border border-violet-300/20 bg-violet-400/10 text-sm font-semibold text-violet-200 transition hover:border-violet-200/40">
                {initial}
              </span>
              <ChevronDown size={14} className="hidden text-slate-500 sm:block" aria-hidden="true" />
            </button>

            {isOpen && (
              <div role="menu" aria-label="Account options" className="absolute right-0 top-[calc(100%+12px)] z-50 w-72 rounded-xl border border-border bg-surface-2 p-2 shadow-2xl shadow-black/40">
                <div className="flex min-w-0 items-center gap-3 px-2 py-2.5" role="none">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-violet-300/20 bg-violet-400/10 text-sm font-semibold text-violet-200" aria-hidden="true">{initial}</span>
                  <span className="grid min-w-0 gap-1">
                    <strong className="truncate text-[13px] font-medium text-slate-100" title={name}>{name}</strong>
                    <span className="truncate text-xs text-slate-500" title={email}>{email || "Email unavailable"}</span>
                  </span>
                </div>
                <div className="my-1.5 h-px bg-surface-2/85" role="separator" />
                <span aria-disabled="true" title="Settings are coming soon" className="flex min-h-10 cursor-not-allowed items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-slate-600" role="menuitem">
                  <Settings size={16} aria-hidden="true" /> Settings <span className="ml-auto text-[10px]">Soon</span>
                </span>
                <div className="my-1.5 h-px bg-surface-2/85" role="separator" />
                <Form action="/logout" method="post" role="none">
                  <button
                    type="submit"
                    role="menuitem"
                    disabled={isLoggingOut}
                    className="flex min-h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-left text-[13px] text-slate-400 transition-colors hover:bg-rose-400/[0.08] hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-300 disabled:cursor-wait disabled:opacity-60"
                  >
                    <LogOut size={16} aria-hidden="true" />
                    <span>{isLoggingOut ? "Logging out…" : "Log out"}</span>
                  </button>
                </Form>
              </div>
            )}
          </div>
        </div>
      </div>

      <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden">
        {primaryLinks.map(({ label, to, active }) =>
          to ? (
            <Link key={label} to={to} aria-current={active ? "page" : undefined} className={`shrink-0 rounded-lg px-3 py-2 text-xs ${active ? "bg-surface-2/90 text-white" : "text-slate-400 hover:text-white"}`}>
              {label}
            </Link>
          ) : (
            <span key={label} aria-disabled="true" title={`${label} is coming soon`} className="shrink-0 cursor-not-allowed rounded-lg px-3 py-2 text-xs text-slate-600">{label}</span>
          ),
        )}
      </nav>
    </header>
  );
}
