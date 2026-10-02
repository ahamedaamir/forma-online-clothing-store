"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react";
import { motionTokens } from "../lib/motion";
import styles from "./Motion.module.css";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQuery = window.matchMedia(reducedMotionQuery);
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia(reducedMotionQuery).matches;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, () => false);
}

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollableHeight > 0 ? Math.min(1, window.scrollY / scrollableHeight) : 0);
      });
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

export function ScrollProgressBar() {
  const progress = useScrollProgress();
  return (
    <div className={styles.scrollProgressTrack} aria-hidden="true">
      <div className={styles.scrollProgressBar} style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

export function Reveal({
  children,
  className = "",
  delay = 0,
  distance = motionTokens.distance.medium,
  threshold = 0.15,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  distance?: number;
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const element = ref.current;
    if (!element || reducedMotion || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting && once) observer.unobserve(element);
    }, { threshold });
    observer.observe(element);
    return () => observer.disconnect();
  }, [once, reducedMotion, threshold]);

  const style = {
    "--motion-delay": `${delay}ms`,
    "--motion-distance": `${reducedMotion ? 0 : distance}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className={`${styles.reveal} ${className}`} data-visible={visible || reducedMotion} style={style}>
      {children}
    </div>
  );
}

export function MotionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`${styles.motionCard} ${className}`}>{children}</div>;
}