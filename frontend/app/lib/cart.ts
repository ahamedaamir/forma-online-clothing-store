import { products } from "./products";

export type CartLine = {
  slug: string;
  size: string;
  color?: string;
  qty: number;
};

const CART_STORAGE_KEY = "forma-cart";
const CART_CHANGE_EVENT = "forma-cart-change";

function isCartLine(value: unknown): value is CartLine {
  if (!value || typeof value !== "object") return false;
  const line = value as Partial<CartLine>;
  const product = products.find((item) => item.slug === line.slug);
  return Boolean(
    product &&
      typeof line.size === "string" &&
      product.sizes.includes(line.size) &&
      (line.color === undefined ||
        product.colorways?.some((colorway) => colorway.colorName === line.color)) &&
      Number.isInteger(line.qty) &&
      line.qty! > 0
  );
}

export function getCartLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter(isCartLine) : [];
  } catch {
    return [];
  }
}

export function saveCartLines(lines: CartLine[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    const validLines = lines.filter(isCartLine);
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(validLines));
    window.dispatchEvent(new Event(CART_CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function addCartItem(
  slug: string,
  size: string,
  color?: string,
  quantity = 1
): boolean {
  const product = products.find((item) => item.slug === slug);
  if (!product || product.inStock === false) return false;

  const selectedSize = product.sizes.includes(size)
    ? size
    : product.sizes[0] || "One Size";
  const selectedColor = product.colorways?.some(
    (colorway) => colorway.colorName === color
  )
    ? color
    : product.colorways?.[0]?.colorName;
  const lines = getCartLines();
  const existingIndex = lines.findIndex(
    (line) =>
      line.slug === slug &&
      line.size === selectedSize &&
      line.color === selectedColor
  );

  if (existingIndex >= 0) {
    lines[existingIndex] = {
      ...lines[existingIndex],
      qty: Math.min(9, lines[existingIndex].qty + Math.max(1, quantity)),
    };
  } else {
    lines.push({
      slug,
      size: selectedSize,
      color: selectedColor,
      qty: Math.min(9, Math.max(1, quantity)),
    });
  }

  return saveCartLines(lines);
}

export function updateCartItem(
  slug: string,
  size: string,
  color: string | undefined,
  qty: number
) {
  const lines = getCartLines().map((line) =>
    line.slug === slug && line.size === size && line.color === color
      ? { ...line, qty: Math.max(1, Math.min(9, qty)) }
      : line
  );
  saveCartLines(lines);
}

export function removeCartItem(
  slug: string,
  size: string,
  color?: string
) {
  saveCartLines(
    getCartLines().filter(
      (line) =>
        !(line.slug === slug && line.size === size && line.color === color)
    )
  );
}

export function subscribeToCart(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CART_CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}