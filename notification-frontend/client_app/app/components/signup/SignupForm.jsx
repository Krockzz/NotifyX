
import { useState } from "react";
import { Form } from "react-router";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";

import GoogleMark from "./GoogleMark.jsx";
import { validateSignup } from "../../utils/signupValidation.js";
import { initialSignupValues } from "../../utils/signupConstants.js";

export default function SignupForm({ actionData }) {
  const [values, setValues] = useState(initialSignupValues);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const serverErrors = actionData?.errors ?? {};
  const allErrors = { ...serverErrors, ...errors };
  const hasErrors = Object.keys(allErrors).length > 0;

  function updateValue(event) {
    const { name, value, checked, type } = event.target;

    const updated = {
      ...values,
      [name]: type === "checkbox" ? checked : value,
    };

    setValues(updated);

    if (attempted) {
      setErrors(validateSignup(updated));
    }
  }

  function handleSubmit() {
    setAttempted(true);
    setErrors(validateSignup(values));
  }

  function fieldProps(name, label) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: updateValue,
      "aria-label": label,
      "aria-invalid": Boolean(allErrors[name]),
      "aria-describedby": allErrors[name]
        ? `${name}-error`
        : undefined,
      autoComplete:
        name === "fullName"
          ? "name"
          : name === "email"
            ? "email"
            : "new-password",
    };
  }

  return (
    <>
      <button
        className="signup-google"
        type="button"
        disabled
        aria-describedby="google-signin-note"
      >
        <GoogleMark />
        Continue with Google
        <span className="signup-coming-soon">Coming soon</span>
      </button>

      <p className="signup-provider-note" id="google-signin-note">
        Social sign-in is not connected yet.
      </p>

      <div className="signup-divider">
        <span>or continue with email</span>
      </div>

      <Form
        className="signup-form"
        method="post"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="signup-field">
          <label htmlFor="fullName">Full name</label>

          <div
            className={`signup-input-wrap${
              allErrors.fullName ? " has-error" : ""
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

          {allErrors.fullName && (
            <p className="signup-field-error" id="fullName-error" role="alert">
              {allErrors.fullName}
            </p>
          )}
        </div>

        <div className="signup-field">
          <label htmlFor="email">Work email</label>

          <div
            className={`signup-input-wrap${
              allErrors.email ? " has-error" : ""
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

          {allErrors.email && (
            <p className="signup-field-error" id="email-error" role="alert">
              {allErrors.email}
            </p>
          )}
        </div>

        <div className="signup-field">
          <label htmlFor="password">Password</label>

          <div
            className={`signup-input-wrap${
              allErrors.password ? " has-error" : ""
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
                allErrors.password
                  ? "password-hint password-error"
                  : "password-hint"
              }
            />

            <button
              className="signup-password-toggle"
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-controls="password"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <p className="signup-hint" id="password-hint">
            At least 8 characters, with a letter and a number.
          </p>

          {allErrors.password && (
            <p className="signup-field-error" id="password-error" role="alert">
              {allErrors.password}
            </p>
          )}
        </div>

        <div className="signup-field">
          <label htmlFor="confirmPassword">Confirm password</label>

          <div
            className={`signup-input-wrap${
              allErrors.confirmPassword ? " has-error" : ""
            }`}
          >
            <LockKeyhole size={16} aria-hidden="true" />
            <input
              {...fieldProps("confirmPassword", "Confirm password")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Enter your password again"
              autoComplete="new-password"
              required
            />

            <button
              className="signup-password-toggle"
              type="button"
              onClick={() => setShowConfirmPassword((shown) => !shown)}
              aria-label={
                showConfirmPassword
                  ? "Hide confirmed password"
                  : "Show confirmed password"
              }
              aria-controls="confirmPassword"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {allErrors.confirmPassword && (
            <p
              className="signup-field-error"
              id="confirmPassword-error"
              role="alert"
            >
              {allErrors.confirmPassword}
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
            aria-invalid={Boolean(allErrors.terms)}
            aria-describedby={allErrors.terms ? "terms-error" : undefined}
          />

          <label htmlFor="terms">
            I agree to the <a href="#terms">Terms of Service</a> and{" "}
            <a href="#privacy">Privacy Policy</a>.
          </label>
        </div>

        {allErrors.terms && (
          <p
            className="signup-field-error signup-terms-error"
            id="terms-error"
            role="alert"
          >
            {allErrors.terms}
          </p>
        )}

        <button className="signup-submit" type="submit">
          Create account <span aria-hidden="true">→</span>
        </button>

        <div
          className={`signup-form-notice${hasErrors ? " is-error" : ""}`}
          aria-live="polite"
          role={hasErrors ? "alert" : "status"}
        >
          {hasErrors
            ? "Check the highlighted fields and try again."
            : actionData?.notice ?? ""}
        </div>
      </Form>
    </>
  );
}
