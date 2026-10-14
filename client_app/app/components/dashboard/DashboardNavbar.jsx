import { useEffect, useRef, useState } from "react";
import { Bell, LogOut, Settings } from "lucide-react";
import { Form, Link, useNavigation } from "react-router";
import { getEmailInitial } from "../../utils/getEmailInitial.js";
import "./DashboardNavbar.css";

export default function DashboardNavbar({ user }) {
  const accountRef = useRef(null);
  const avatarRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  const navigation = useNavigation();

const isLoggingOut =
  navigation.state === "submitting" &&
  navigation.formAction === "/logout";

  const email = typeof user?.email === "string" ? user.email : "";
  const name =
    typeof user?.name === "string" && user.name.trim()
      ? user.name.trim()
      : "NotifyX user";

  const initial = getEmailInitial(email);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!accountRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
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
    <header className="dashboard-navbar">
      <div className="dashboard-navbar__brand" aria-label="NotifyX">
        <span
          className="dashboard-navbar__brand-icon"
          aria-hidden="true"
        >
          <Bell size={17} strokeWidth={2.2} />
        </span>

        <span className="dashboard-navbar__brand-name">
          NotifyX
        </span>
      </div>

      <div
        className="dashboard-navbar__account"
        ref={accountRef}
      >
        <button
          ref={avatarRef}
          className="dashboard-navbar__avatar"
          type="button"
          aria-label="Account menu"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((open) => !open)}
        >
          {initial}
        </button>

        {isOpen && (
          <div
            className="dashboard-account-menu"
            role="menu"
            aria-label="Account options"
          >
            <div
              className="dashboard-account-menu__identity"
              role="none"
            >
              <span
                className="dashboard-account-menu__avatar"
                aria-hidden="true"
              >
                {initial}
              </span>

              <span className="dashboard-account-menu__user-copy">
                <strong title={name}>{name}</strong>
                <span title={email}>
                  {email || "Email unavailable"}
                </span>
              </span>
            </div>

            <div
              className="dashboard-account-menu__divider"
              role="separator"
            />

            <Link
              className="dashboard-account-menu__item"
              to="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              <Settings size={17} aria-hidden="true" />
              <span>Settings</span>
            </Link>

            <div
              className="dashboard-account-menu__divider"
              role="separator"
            />

            <Form action="/logout" method="post" role="none">
  <button
    className="dashboard-account-menu__item dashboard-account-menu__logout"
    type="submit"
    role="menuitem"
    disabled={isLoggingOut}
  >
    <LogOut size={17} aria-hidden="true" />
    <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
  </button>
</Form>

          </div>
        )}
      </div>
    </header>
  );
}
