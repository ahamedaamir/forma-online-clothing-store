export const motionTokens = {
  duration: {
    instant: 100,
    fast: 200,
    base: 300,
    slow: 500,
    hero: 800,
  },
  easing: {
    standard: "cubic-bezier(0.4, 0, 0.2, 1)",
    enter: "cubic-bezier(0, 0, 0.2, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
    bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },
  spring: {
    soft: { stiffness: 120, damping: 14 },
    snappy: { stiffness: 300, damping: 24 },
  },
  stagger: { list: 60, grid: 40 },
  distance: { small: 8, medium: 24, large: 48 },
} as const;

export function getStaggerDelay(index: number, kind: keyof typeof motionTokens.stagger = "grid") {
  return Math.max(0, index) * motionTokens.stagger[kind];
}