"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getStaggerDelay } from "../lib/motion";
import { useReducedMotion } from "./Motion";

export default function PageMotion() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      "main > section, main > article, main > div, [data-motion], [data-motion-reveal]",
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
      target.style.setProperty("--motion-delay", `${Math.min(getStaggerDelay(index, "grid"), 280)}ms`);
      observer.observe(target);
    });

    return () => observer.disconnect();
  }, [pathname, reduceMotion]);

  return null;
}
