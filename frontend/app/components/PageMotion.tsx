"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageMotion() {
  const pathname = usePathname();

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targets = document.querySelectorAll<HTMLElement>(
      "main > section, main > article, main > div, [data-motion]",
    );

    document.documentElement.dataset.motionReady = "true";
    document.body.dataset.motionRoute = pathname;

    if (reduceMotion) {
      targets.forEach((target) => {
        target.dataset.motionVisible = "true";
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.motionVisible = "true";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    targets.forEach((target, index) => {
      target.dataset.motion = target.dataset.motion || "reveal";
      target.style.setProperty("--motion-delay", `${Math.min(index * 55, 275)}ms`);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return null;
}
