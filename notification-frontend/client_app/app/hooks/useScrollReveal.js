import { useEffect, useRef } from "react";

export default function useScrollReveal() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (!container || reducedMotion.matches || !("IntersectionObserver" in window)) {
      return;
    }

    const targets = Array.from(container.querySelectorAll("[data-reveal]"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.remove("reveal-pending");
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -36px 0px" },
    );

    for (const target of targets) {
      const bounds = target.getBoundingClientRect();
      const alreadyVisible = bounds.top < window.innerHeight && bounds.bottom > 0;

      if (alreadyVisible) {
        target.classList.add("is-visible");
      } else {
        target.classList.add("reveal-pending");
        observer.observe(target);
      }
    }

    container.dataset.revealReady = "true";

    return () => observer.disconnect();
  }, []);

  return containerRef;
}
