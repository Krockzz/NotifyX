
import { Link } from "react-router";
import { ArrowUpRight, Menu, Moon, Sun } from "lucide-react";
import Brand from "./Brand.jsx";

export default function Navigation({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <nav className="nav-shell" aria-label="Main navigation">
        <Brand />

        <div className="nav-links">
          <a href="#product">Product</a>
          <a href="#workflow">How it works</a>
          <a href="#developers">Developers</a>
          <a href="#developers">Documentation</a>
        </div>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-pressed={theme === "light"}
            aria-label={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } theme`}
            title={`Switch to ${
              theme === "dark" ? "light" : "dark"
            } theme`}
          >
            {theme === "dark" ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>

          <Link className="nav-signin" to="/login">
            Sign in
          </Link>

          <Link
            className="button button-small button-primary"
            to="/signup"
          >
            Get started <ArrowUpRight size={14} />
          </Link>
        </div>

        <details className="mobile-menu">
          <summary aria-label="Open navigation">
            <Menu size={21} />
          </summary>

          <div className="mobile-menu-panel">
            <a href="#product">Product</a>
            <a href="#workflow">How it works</a>
            <a href="#developers">Developers &amp; docs</a>
            <Link to="/signup">Get started</Link>
            <Link to="/login">Sign in</Link>
          </div>
        </details>
      </nav>
    </header>
  );
}
