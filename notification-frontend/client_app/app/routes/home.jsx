import { useEffect, useState } from "react";
import DeveloperSection from "../components/landing/DeveloperSection.jsx";
import FeatureSection from "../components/landing/FeatureSection.jsx";
import FeatureStrip from "../components/landing/FeatureStrip.jsx";
import FinalCallToAction from "../components/landing/FinalCallToAction.jsx";
import Footer from "../components/landing/Footer.jsx";
import Hero from "../components/landing/Hero.jsx";
import Navigation from "../components/landing/Navigation.jsx";
import WorkflowSection from "../components/landing/WorkflowSection.jsx";
import useScrollReveal from "../hooks/useScrollReveal.js";

export function meta() {
  return [
    { title: "NotifyX — Powerful notifications for modern applications" },
    {
      name: "description",
      content:
        "NotifyX helps product teams route and track event-driven notifications across email, SMS, and push.",
    },
  ];
}


export default function Home() {
  const [theme, setTheme] = useState("dark");
  const landingRef = useScrollReveal();

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("notifyx-theme");
    if (storedTheme === "light" || storedTheme === "dark") setTheme(storedTheme);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("notifyx-theme", theme);
  }, [theme]);

  return (
    <div className="landing-page" ref={landingRef}>
      <Navigation theme={theme} onToggleTheme={() => setTheme((current) => current === "dark" ? "light" : "dark")} />
      <main>
        <Hero />
        <FeatureStrip />
        <FeatureSection />
        <WorkflowSection />
        <DeveloperSection />
        <FinalCallToAction />
      </main>
      <Footer />
    </div>
  );
}
