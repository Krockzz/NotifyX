import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link } from "react-router";
import GoogleMark from "../signup/GoogleMark.jsx";

function validateLogin(values) {
  const errors = {};
  if (!values.email.trim()) errors.email = "Enter your email address.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = "Enter a valid email address.";
  if (!values.password) errors.password = "Enter your password.";
  return errors;
}

export default function LoginForm() {
  const [values, setValues] = useState({ email: "", password: "", remember: true });
  const [errors, setErrors] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notice, setNotice] = useState("");

  function updateValue(event) {
    const { name, value, checked, type } = event.target;
    const updated = { ...values, [name]: type === "checkbox" ? checked : value };
    setValues(updated);
    setNotice("");
    if (attempted) setErrors(validateLogin(updated));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setAttempted(true);
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);
    setNotice(Object.keys(nextErrors).length
      ? "Check the highlighted fields and try again."
      : "Your details are valid. Sign-in is not connected yet.");
  }

  return (
    <>
      <button className="signup-google" type="button" disabled aria-describedby="login-google-note">
        <GoogleMark /> Continue with Google <span className="signup-coming-soon">Coming soon</span>
      </button>
      <p className="signup-provider-note" id="login-google-note">Social sign-in is not connected yet.</p>
      <div className="signup-divider"><span>or continue with email</span></div>

      <form className="signup-form login-form" onSubmit={handleSubmit} noValidate>
        <div className="signup-field">
          <label htmlFor="login-email">Email address</label>
          <div className={`signup-input-wrap${errors.email ? " has-error" : ""}`}>
            <Mail size={16} aria-hidden="true" />
            <input id="login-email" name="email" type="email" value={values.email} onChange={updateValue} placeholder="you@company.com" autoComplete="email" required aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "login-email-error" : undefined} />
          </div>
          {errors.email && <p className="signup-field-error" id="login-email-error" role="alert">{errors.email}</p>}
        </div>

        <div className="signup-field">
          <div className="login-password-label"><label htmlFor="login-password">Password</label><button className="login-text-button" type="button" onClick={() => setNotice("Password reset will be available when account services are connected.")}>Forgot password?</button></div>
          <div className={`signup-input-wrap${errors.password ? " has-error" : ""}`}>
            <LockKeyhole size={16} aria-hidden="true" />
            <input id="login-password" name="password" type={showPassword ? "text" : "password"} value={values.password} onChange={updateValue} placeholder="Enter your password" autoComplete="current-password" required aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? "login-password-error" : undefined} />
            <button className="signup-password-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? "Hide password" : "Show password"} aria-controls="login-password">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
          </div>
          {errors.password && <p className="signup-field-error" id="login-password-error" role="alert">{errors.password}</p>}
        </div>

        <div className="login-remember-row">
          <label><input name="remember" type="checkbox" checked={values.remember} onChange={updateValue} /> <span>Keep me signed in</span></label>
          <span className="login-session-note"><LockKeyhole size={11} /> Private session</span>
        </div>

        <button className="signup-submit" type="submit">Sign in <span aria-hidden="true">→</span></button>
        <div className={`signup-form-notice${Object.keys(errors).length ? " is-error" : ""}`} aria-live="polite" role={Object.keys(errors).length ? "alert" : "status"}>{notice}</div>
      </form>
    </>
  );
}
