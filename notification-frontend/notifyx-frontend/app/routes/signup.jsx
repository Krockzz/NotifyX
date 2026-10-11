
import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link } from "react-router";

import Brand from "../components/landing/Brand.jsx";
import SignupVisual from "../components/signup/SignupVisual.jsx";
import GoogleMark from "../components/signup/GoogleMark.jsx";

import { validateSignup } from "../utils/signupValidation.js";
import { initialSignupValues } from "../utils/signupConstants.js";

export function meta() {
  return [
    { title: "Create your NotifyX account" },
    {
      name: "description",
      content:
        "Create a NotifyX account to start building and managing your notification infrastructure.",
    },
  ];
}

export default function Signup() {
  const [values, setValues] = useState(initialSignupValues);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function updateValue(event) {
    const { name, value, checked, type } = event.target;

    const updated = {
      ...values,
      [name]: type === "checkbox" ? checked : value,
    };

    setValues(updated);
    setNotice("");

    if (attempted) {
      setErrors(validateSignup(updated));
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Check the highlighted fields and try again.");
      return;
    }

    setNotice(
      "Your details are valid. Account creation is not connected yet."
    );
  }

  function fieldProps(name, label) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: updateValue,
      "aria-label": label,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby": errors[name] ? `${name}-error` : undefined,
      autoComplete:
        name === "fullName"
          ? "name"
          : name === "email"
            ? "email"
            : "new-password",
    };
  }

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <main className="signup-page">
      <section
        className="signup-form-panel"
        aria-labelledby="signup-title"
      >
        <div className="signup-form-top">
          <Brand href="/" />

          <span className="signup-secure">
            <LockKeyhole size={13} />
            Secure account setup
          </span>
        </div>

        <div className="signup-form-wrap">
          <div className="signup-mobile-brandline">
            <span className="signup-mini-mark">
              <Mail size={15} />
            </span>
            <span>Notifications, thoughtfully delivered.</span>
          </div>

          <div className="signup-intro">
            <span className="signup-form-eyebrow">
              GET STARTED WITH NOTIFYX
            </span>

            <h1 id="signup-title">
              Create your NotifyX account
            </h1>

            <p>
              Start building and managing your notification
              infrastructure in one place.
            </p>
          </div>

          <button
            className="signup-google"
            type="button"
            disabled
            aria-describedby="google-signin-note"
          >
            <GoogleMark />
            Continue with Google
            <span className="signup-coming-soon">
              Coming soon
            </span>
          </button>

          <p
            className="signup-provider-note"
            id="google-signin-note"
          >
            Social sign-in is not connected yet.
          </p>

          <div className="signup-divider">
            <span>or continue with email</span>
          </div>

          <form
            className="signup-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="signup-field">
              <label htmlFor="fullName">Full name</label>

              <div
                className={`signup-input-wrap${
                  errors.fullName ? " has-error" : ""
                }`}
              >
                <UserRound size={16} aria-hidden="true" />

                <input
                  {...fieldProps("fullName", "Full name")}
                  type="text"
                  placeholder="Alex Morgan"
                  autoComplete="name"
                  required
                />
              </div>

              {errors.fullName && (
                <p
                  className="signup-field-error"
                  id="fullName-error"
                  role="alert"
                >
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="email">Work email</label>

              <div
                className={`signup-input-wrap${
                  errors.email ? " has-error" : ""
                }`}
              >
                <Mail size={16} aria-hidden="true" />

                <input
                  {...fieldProps("email", "Work email")}
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>

              {errors.email && (
                <p
                  className="signup-field-error"
                  id="email-error"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="password">Password</label>

              <div
                className={`signup-input-wrap${
                  errors.password ? " has-error" : ""
                }`}
              >
                <LockKeyhole size={16} aria-hidden="true" />

                <input
                  {...fieldProps("password", "Password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  aria-describedby={
                    errors.password
                      ? "password-hint password-error"
                      : "password-hint"
                  }
                />

                <button
                  className="signup-password-toggle"
                  type="button"
                  onClick={() =>
                    setShowPassword((shown) => !shown)
                  }
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                  aria-controls="password"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              <p className="signup-hint" id="password-hint">
                At least 8 characters, with a letter and a number.
              </p>

              {errors.password && (
                <p
                  className="signup-field-error"
                  id="password-error"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            <div className="signup-field">
              <label htmlFor="confirmPassword">
                Confirm password
              </label>

              <div
                className={`signup-input-wrap${
                  errors.confirmPassword ? " has-error" : ""
                }`}
              >
                <LockKeyhole size={16} aria-hidden="true" />

                <input
                  {...fieldProps(
                    "confirmPassword",
                    "Confirm password"
                  )}
                  type={
                    showConfirmPassword ? "text" : "password"
                  }
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                />

                <button
                  className="signup-password-toggle"
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((shown) => !shown)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmed password"
                      : "Show confirmed password"
                  }
                  aria-controls="confirmPassword"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {errors.confirmPassword && (
                <p
                  className="signup-field-error"
                  id="confirmPassword-error"
                  role="alert"
                >
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="signup-terms-row">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={values.terms}
                required
                onChange={updateValue}
                aria-invalid={Boolean(errors.terms)}
                aria-describedby={
                  errors.terms ? "terms-error" : undefined
                }
              />

              <label htmlFor="terms">
                I agree to the{" "}
                <a href="#terms">Terms of Service</a> and{" "}
                <a href="#privacy">Privacy Policy</a>.
              </label>
            </div>

            {errors.terms && (
              <p
                className="signup-field-error signup-terms-error"
                id="terms-error"
                role="alert"
              >
                {errors.terms}
              </p>
            )}

            <button className="signup-submit" type="submit">
              Create account <span aria-hidden="true">→</span>
            </button>

            <div
              className={`signup-form-notice${
                hasErrors ? " is-error" : ""
              }`}
              aria-live="polite"
              role={hasErrors ? "alert" : "status"}
            >
              {notice}
            </div>
          </form>

          <p className="signup-signin">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>

          <p className="signup-legal-note">
            By creating an account, you’ll be able to manage
            notification workflows in one place.
          </p>
        </div>

        <div className="signup-form-footer">
          <span>© {new Date().getFullYear()} NotifyX</span>
          <span>Developer-first notifications</span>
        </div>
      </section>

      <SignupVisual />
    </main>
  );
}
