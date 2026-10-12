import { useState } from "react";
import { Form, Link, useNavigation,  } from "react-router";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";


import GoogleMark from "../signup/GoogleMark.jsx";
import { validateLogin } from "../../utils/loginValidation.js";

const initialValues = {
  email: "",
  password: "",
  remember: true,
};

export default function LoginForm({ actionData }) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const actionErrors = actionData?.errors ?? {};
  const allErrors = { ...actionErrors, ...errors };
  const hasErrors = Object.keys(allErrors).length > 0;

  function updateValue(event) {
    const { name, value, checked, type } = event.target;

    const updated = {
      ...values,
      [name]: type === "checkbox" ? checked : value,
    };

    setValues(updated);
    setNotice("");

    if (attempted) {
      setErrors(validateLogin(updated));
    }
  }

  function handleSubmit() {
    setAttempted(true);
    setErrors(validateLogin(values));
    setNotice("");
  }

  function handleForgotPassword() {
    setNotice(
      "Password reset will be available when account services are connected."
    );
  }

  return (
    <>
      <button
        className="signup-google"
        type="button"
        disabled
        aria-describedby="login-google-note"
      >
        <GoogleMark />
        Continue with Google
        <span className="signup-coming-soon">Coming soon</span>
      </button>

      <p className="signup-provider-note" id="login-google-note">
        Social sign-in is not connected yet.
      </p>

      <div className="signup-divider">
        <span>or continue with email</span>
      </div>

      <Form
        className="signup-form login-form"
        method="post"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="signup-field">
          <label htmlFor="login-email">Email address</label>

          <div
            className={`signup-input-wrap${
              allErrors.email ? " has-error" : ""
            }`}
          >
            <Mail size={16} aria-hidden="true" />

            <input
              id="login-email"
              name="email"
              type="email"
              value={values.email}
              onChange={updateValue}
              placeholder="you@company.com"
              autoComplete="email"
              required
              aria-invalid={Boolean(allErrors.email)}
              aria-describedby={
                allErrors.email ? "login-email-error" : undefined
              }
            />
          </div>

          {allErrors.email && (
            <p
              className="signup-field-error"
              id="login-email-error"
              role="alert"
            >
              {allErrors.email}
            </p>
          )}
        </div>

        <div className="signup-field">
          <div className="login-password-label">
            <label htmlFor="login-password">Password</label>

            <button
              className="login-text-button"
              type="button"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <div
            className={`signup-input-wrap${
              allErrors.password ? " has-error" : ""
            }`}
          >
            <LockKeyhole size={16} aria-hidden="true" />

            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={updateValue}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              aria-invalid={Boolean(allErrors.password)}
              aria-describedby={
                allErrors.password
                  ? "login-password-error"
                  : undefined
              }
            />

            <button
              className="signup-password-toggle"
              type="button"
              onClick={() => setShowPassword((shown) => !shown)}
              aria-label={
                showPassword ? "Hide password" : "Show password"
              }
              aria-controls="login-password"
            >
              {showPassword ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
            </button>
          </div>

          {allErrors.password && (
            <p
              className="signup-field-error"
              id="login-password-error"
              role="alert"
            >
              {allErrors.password}
            </p>
          )}
        </div>

        <div className="login-remember-row">
          <label>
            <input
              name="remember"
              type="checkbox"
              checked={values.remember}
              onChange={updateValue}
            />
            <span>Keep me signed in</span>
          </label>

          <span className="login-session-note">
            <LockKeyhole size={11} />
            Private session
          </span>
        </div>

        <button
          className="signup-submit"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Signing in..." : "Sign in"}
          {!isSubmitting && <span aria-hidden="true">→</span>}
        </button>

        <div
          className={`signup-form-notice${hasErrors ? " is-error" : ""}`}
          aria-live="polite"
          role={hasErrors ? "alert" : "status"}
        >
          {hasErrors
            ? "Check the highlighted fields and try again."
            : notice || actionData?.notice || ""}
        </div>
      </Form>

      <p className="signup-signin">
        Don&apos;t have an account? <Link to="/signup">Create account</Link>
      </p>
    </>
  );
}
