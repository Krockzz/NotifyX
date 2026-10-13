import { useState } from "react";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { Link, data, redirect } from "react-router";

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

// Use Vite's import.meta.env or fallback appropriately
const API_URI = process.env.API_URL;
console.log(API_URI)

export async function action({ request }) {
  const info = await request.formData();
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

    if (!registerRes.ok) {
      // FIX: Use .json() instead of .data()
      const errorData = await registerRes.json();
      return data({
        error: errorData.message || "Registration Failed",
        statusCode: errorData.status || 400,
      });
    }

    const loginRes = await fetch(`${API_URI}/api/v1/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      // FIX: Use .json() instead of .data()
      const loginError = await loginRes.json();
      return data({
        error: loginError.message || "Login after registration failed",
        statusCode: loginError.status || 500,
      });
    }

    return redirect("/dashboard");
  } catch (error) {
    console.error("REGISTRATION ERROR:", error);
    return data(
      {
        error: "Something went wrong. Please try again.",
        details: error.message,
      },
      { status: 500 }
    );
  }
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

          <SignupForm />

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