import { LockKeyhole, Mail } from "lucide-react";
import Brand from "../components/landing/Brand.jsx";
import LoginForm from "../components/login/LoginForm.jsx";
import LoginVisual from "../components/login/LoginVisual.jsx";
import { Link, redirect } from "react-router";

export function meta() {
  return [
    { title: "Sign in to NotifyX" },
    { name: "description", content: "Sign in to your NotifyX notification workspace." },
  ];
}

const API_URI = import.meta.env.API_URL
console.log(API_URI)

export async function action({request}){

  const data = await request.formData();
  const email = data.get("email");
  const password = data.get("password");

  if (!email || !password) {
    return json({ error: "Email or password is missing" }, { status: 400 });
  }

  try{

    const res = await fetch(`${API_URI}/api/v1/users/login` , {

       method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }), 
    });

     if (!res.ok) {
      const errorData = await res.json();
      return json(
        { error: errorData.message || "Login Failed!" },
        { status: errorData.status || 500 }
      );
    }

    const cookies = res.headers.get("Set-Cookie");

    return redirect("/dashboard" , 

      {

        headers: {

          "Set-Cookie" : cookies
        }
      }

    )


  }

  catch(err){

    return json(
      { error: "Something went wrong. Please try again.", details: err.message },
      { status: 500 }
    );


  }



}

export default function Login() {
  return (
    <main className="signup-page login-page">
      <section className="signup-form-panel" aria-labelledby="login-title">
        <div className="signup-form-top">
          <Brand href="/" />
          <span className="signup-secure"><LockKeyhole size={13} /> Workspace access</span>
        </div>

        <div className="signup-form-wrap">
          <div className="signup-mobile-brandline">
            <span className="signup-mini-mark"><Mail size={15} /></span>
            <span>Your notification workspace, at a glance.</span>
          </div>
          <div className="signup-intro login-intro">
            <span className="signup-form-eyebrow">WELCOME BACK</span>
            <h1 id="login-title">Sign in to NotifyX</h1>
            <p>Access your notification workspace and keep your event flows moving.</p>
          </div>

          <LoginForm />

          <p className="signup-signin login-signup-prompt">New to NotifyX? <Link to="/signup">Create an account</Link></p>
          <p className="signup-legal-note">Secure access for the systems that keep your users informed.</p>
        </div>

        <div className="signup-form-footer"><span>© {new Date().getFullYear()} NotifyX</span><span>Developer-first notifications</span></div>
      </section>
      <LoginVisual />
    </main>
  );
}
