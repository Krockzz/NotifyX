
import Brand from "../components/landing/Brand.jsx";
import LoginForm from "../components/login/LoginForm.jsx";
import LoginVisual from "../components/login/LoginVisual.jsx";

import { data, redirect, Link } from "react-router";
import { LockKeyhole, Mail } from "lucide-react";

export function meta() {
  return [
    { title: "Sign in to NotifyX" },
    {
      name: "description",
      content: "Sign in to your NotifyX notification workspace.",
    },
  ];
}

const API_URI = import.meta.env.VITE_API_URL;
console.log(API_URI)

export async function action({ request }) {
  const info = await request.formData();

  const email = String(info.get("email") ?? "").trim();
  const password = String(info.get("password") ?? "");

  if (!email || !password) {
    return data(
      { error: "Email or password is missing." },
      { status: 400 }
    );
  }

  if (!API_URI) {
    console.error("API_URL environment variable is not configured.");

    return data(
      { error: "Server configuration error. Please try again later." },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(`${API_URI}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));

      return data(
        {
          error: errorData.message || "Login failed. Please try again.",
        },
        { status: res.status }
      );
    }

    // Forward the session cookie if the backend sets one.
    const cookies = res.headers.get("Set-Cookie");
    const headers = new Headers();

    if (cookies) {
      headers.append("Set-Cookie", cookies);
    }

    return redirect("/dashboard", { headers });
  } catch (err) {
    console.error("Login error:", err);

    return data(
      {
        error: "Unable to connect to the server. Please try again.",
      },
      { status: 500 }
    );
  }
}

export default function Login() {
  return (
    <main className="signup-page login-page">
      <section
        className="signup-form-panel"
        aria-labelledby="login-title"
      >
        <div className="signup-form-top">
          <Brand href="/" />

          <span className="signup-secure">
            <LockKeyhole size={13} />
            Workspace access
          </span>
        </div>

        <div className="signup-form-wrap">
          <div className="signup-mobile-brandline">
            <span className="signup-mini-mark">
              <Mail size={15} />
            </span>

            <span>Your notification workspace, at a glance.</span>
          </div>

          <div className="signup-intro login-intro">
            <span className="signup-form-eyebrow">
              WELCOME BACK
            </span>

            <h1 id="login-title">Sign in to NotifyX</h1>

            <p>
              Access your notification workspace and keep your
              event flows moving.
            </p>
          </div>

          <LoginForm />

          <p className="signup-signin login-signup-prompt">
            New to NotifyX? <Link to="/signup">Create an account</Link>
          </p>

          <p className="signup-legal-note">
            Secure access for the systems that keep your users informed.
          </p>
        </div>

        <div className="signup-form-footer">
          <span>© {new Date().getFullYear()} NotifyX</span>
          <span>Developer-first notifications</span>
        </div>
      </section>

      <LoginVisual />
    </main>
  );
}
