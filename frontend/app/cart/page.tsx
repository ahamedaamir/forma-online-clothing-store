"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./cart.module.css";
import { products, type ProductColorway } from "../lib/products";
import {
  getCartLines,
  removeCartItem,
  subscribeToCart,
  updateCartItem,
  type CartLine,
} from "../lib/cart";

const configuredDeliveryFee = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || "350");
const deliveryFee = Number.isFinite(configuredDeliveryFee) && configuredDeliveryFee >= 0
  ? configuredDeliveryFee
  : 350;

function formatLkr(value: number) {
  return `LKR ${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function CartPage() {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const syncCart = () => setLines(getCartLines());
    const refreshFrame = window.requestAnimationFrame(syncCart);
    return () => {
      window.cancelAnimationFrame(refreshFrame);
    };
  }, []);

  useEffect(() => subscribeToCart(() => setLines(getCartLines())), []);

  const items = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((p) => p.slug === line.slug);
          if (!product) return null;
          const colorway = product.colorways?.find(
            (variant) => variant.colorName === line.color
          );
          return { ...line, product, colorway };
        })
        .filter(
          (item): item is CartLine & {
            product: (typeof products)[number];
            colorway: ProductColorway | undefined;
          } => item !== null
        ),
    [lines]
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const shipping = subtotal === 0 ? 0 : deliveryFee;
  const total = subtotal + shipping;

  return (
    <main className={styles.wrap}>
      <div className={styles.pageHeader}>
        <h1 className={styles.title}>Your cart</h1>
        {items.length > 0 && (
          <span className={styles.itemCount}>
            In your bag {items.reduce((count, item) => count + item.qty, 0)} items
          </span>
        )}
        <Link href="/shop" className={styles.continueShopping}>
          Continue shopping <span aria-hidden="true">→</span>
        </Link>
      </div>

      {items.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Nothing here yet.</p>
          <Link href="/shop" className={styles.emptyBtn}>
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className={styles.layout}>
          <div className={styles.lines}>
            {items.map((item) => (
              <div key={`${item.slug}-${item.size}-${item.color ?? "default"}`} className={styles.line}>
                <Link
                  href={`/product/${item.slug}`}
                  className={styles.lineImageWrap}
                >
                  <Image
                    src={item.colorway?.primaryImage ?? item.product.image}
                    alt={`${item.product.name}${item.color ? ` in ${item.color}` : ""}`}
                    width={168}
                    height={168}
                    unoptimized
                    className={styles.lineImage}
                  />
                </Link>

                <div className={styles.lineBody}>
                  <div className={styles.lineTop}>
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className={styles.lineName}
                      >
                        {item.product.name}
                      </Link>
                      <p className={styles.lineMeta}>
                        {item.color ? `${item.color} · ` : ""}Size {item.size}
                      </p>
                    </div>
                    <span className={styles.linePrice}>
                      {formatLkr(item.product.price * item.qty)}
                    </span>
                  </div>

                  <div className={styles.lineActions}>
                    <div className={styles.qtyRow}>
                      <button
                        onClick={() =>
                          updateCartItem(item.slug, item.size, item.color, item.qty - 1)
                        }
                        className={styles.qtyBtn}
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className={styles.qtyValue}>{item.qty}</span>
                      <button
                        onClick={() =>
                          updateCartItem(item.slug, item.size, item.color, item.qty + 1)
                        }
                        className={styles.qtyBtn}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeCartItem(item.slug, item.size, item.color)}
                      className={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className={styles.shippingEstimator}>
              <h2>Get estimate shipping for your order</h2>
              <div className={styles.shippingFields}>
                <label>
                  <span>Country</span>
                  <select defaultValue="Sri Lanka">
                    <option>Sri Lanka</option>
                  </select>
                </label>
                <label>
                  <span>Zip code</span>
                  <input type="text" placeholder="Pin Code" />
                </label>
                <button type="button" className={styles.estimateBtn}>
                  Get estimates <span aria-hidden="true">•</span>
                </button>
              </div>
            </div>
          </div>

          <aside className={styles.summary}>
            <p className={styles.summaryTitle}>Order Summary</p>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatLkr(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Island-wide Delivery</span>
              <span>{shipping === 0 ? "Free" : formatLkr(shipping)}</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>{formatLkr(total)}</span>
            </div>
            <Link href="/checkout" className={styles.checkoutBtn}>
              <span aria-hidden="true">▢</span> Checkout <span aria-hidden="true">•</span>
            </Link>
            <button type="button" className={styles.googlePayBtn}>
              <strong>G</strong> Pay
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}
