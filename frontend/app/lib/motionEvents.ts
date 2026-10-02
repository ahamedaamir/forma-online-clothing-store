export const cartAddedEventName = "forma-cart-added";

export type CartAddedDetail = {
  name: string;
  image: string;
  source: { left: number; top: number; width: number; height: number };
};

export function notifyCartAdded(name: string, image: string, sourceElement?: HTMLElement | null) {
  if (typeof window === "undefined") return;
  const rect = sourceElement?.getBoundingClientRect();
  const detail: CartAddedDetail = {
    name,
    image,
    source: rect
      ? { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
      : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 1, height: 1 },
  };
  window.dispatchEvent(new CustomEvent<CartAddedDetail>(cartAddedEventName, { detail }));
}