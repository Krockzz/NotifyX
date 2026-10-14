import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
// Unified react-router imports for v7
import { Link, data, redirect, Form, useActionData, useNavigation } from "react-router";

import Brand from "../components/landing/Brand.jsx";
import SignupVisual from "../components/signup/SignupVisual.jsx";

import { validateSignup } from "../utils/signupValidation.js";
import { initialSignupValues } from "../utils/signupConstants.js";
import SignupForm from "../components/signup/signUpForm.jsx";

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

const API_URI = import.meta.env.VITE_API_URL;
console.log("API Destination URI:", API_URI);

export async function action({ request }) {
  const info = await request.formData();
  // Ensure these match the 'name' attributes on the native HTML inputs inside <SignupForm />
  const UserName = info.get("UserName");
  const email = info.get("email");
  const password = info.get("password");

  if (!UserName || !email || !password) {
    return data({ error: "Please provide all the fields" }, { status: 400 });
  }

  if (password.length < 6) {
    return data({ error: "Password should be at least 6 characters" }, { status: 400 });
  }

  try {
    const registerRes = await fetch(`${API_URI}/api/v1/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ UserName, email, password }),
    });

    // Safeguard against HTML error pages (Unexpected token '<')
    if (!registerRes.ok) {
      const contentType = registerRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await registerRes.json();
        return data({
          error: errorData.message || "Registration Failed",
          statusCode: registerRes.status,
        }, { status: registerRes.status });
      } else {
        return data({
          error: `Server endpoint not found (${registerRes.status}). Verify your registration backend route configuration.`,
          statusCode: registerRes.status,
        }, { status: registerRes.status });
      }
    }

    const loginRes = await fetch(`${API_URI}/api/v1/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      const contentType = loginRes.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const loginError = await loginRes.json();
        return data({
          error: loginError.message || "Login after registration failed",
          statusCode: loginRes.status,
        }, { status: loginRes.status });
      } else {
        return data({
          error: `Login fallback endpoint error (${loginRes.status}). Account created but session generation failed.`,
          statusCode: loginRes.status,
        }, { status: loginRes.status });
      }
    }

    const headers = new Headers();
    const cookies = typeof loginRes.headers.getSetCookie === "function"
      ? loginRes.headers.getSetCookie()
      : [loginRes.headers.get("Set-Cookie")].filter(Boolean);
    for (const cookie of cookies) headers.append("Set-Cookie", cookie);

    return redirect("/dashboard", { headers });
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    return data(
      {
        error: "Network error. Could not connect to the backend server.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

export default function Signup() {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

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

  // Pre-validate inputs client-side before letting React Router submit the form data
  function handleClientSubmit(event) {
    setAttempted(true);

    const nextErrors = validateSignup(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault(); // Stop execution here if validation fails locally
      setNotice("Check the highlighted fields and try again.");
    }
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

          {/* Clean UI feedback layout area for server error data maps */}
          {(actionData?.error || notice) && (
            <div className="form-alert-message" style={{ color: "#ff5252", padding: "0.5rem 0", fontSize: "0.9rem" }}>
              {actionData?.error || notice}
            </div>
          )}

          {/* Wrap your fields inside React Router v7's submission engine wrapper */}
          <Form method="post" onSubmit={handleClientSubmit}>
            <SignupForm 
              values={values} 
              errors={errors} 
              updateValue={updateValue}
              fieldProps={fieldProps}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              showConfirmPassword={showConfirmPassword}
              setShowConfirmPassword={setShowConfirmPassword}
              isSubmitting={isSubmitting}
            />
          </Form>

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
