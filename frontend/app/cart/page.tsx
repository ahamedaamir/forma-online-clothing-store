"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./cart.module.css";
import { products } from "../lib/products";

type Line = { slug: string; size: string; qty: number };

// Demo starting bag — in a wired-up build this would come from
// cart state/context or the backend cart API (FR-04).
const initialLines: Line[] = [
  { slug: "luna-linen-set", size: "M", qty: 1 },
  { slug: "crest-knit-tee", size: "L", qty: 1 },
];

export default function CartPage() {
  const [lines, setLines] = useState<Line[]>(initialLines);

  const items = useMemo(
    () =>
      lines
        .map((line) => {
          const product = products.find((p) => p.slug === line.slug);
          return product ? { ...line, product } : null;
        })
        .filter(Boolean) as (Line & { product: (typeof products)[number] })[],
    [lines]
  );

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0
  );
  const shipping = subtotal === 0 || subtotal >= 75 ? 0 : 8;
  const total = subtotal + shipping;

  function updateQty(slug: string, size: string, qty: number) {
    setLines((prev) =>
      prev.map((line) =>
        line.slug === slug && line.size === size
          ? { ...line, qty: Math.max(1, Math.min(9, qty)) }
          : line
      )
    );
  }

  function removeLine(slug: string, size: string) {
    setLines((prev) =>
      prev.filter((line) => !(line.slug === slug && line.size === size))
    );
  }

  return (
    <main className={styles.wrap}>
      <p className={styles.eyebrow}>Your bag</p>
      <h1 className={styles.title}>
        {items.length === 0 ? "Your bag is empty" : "Review &amp; checkout"}
      </h1>

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
              <div key={`${item.slug}-${item.size}`} className={styles.line}>
                <Link
                  href={`/product/${item.slug}`}
                  className={styles.lineImageWrap}
                >
                  <img
                    src={item.product.image}
                    alt={item.product.name}
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
                      <p className={styles.lineMeta}>Size {item.size}</p>
                    </div>
                    <span className={styles.linePrice}>
                      ${item.product.price * item.qty}
                    </span>
                  </div>

                  <div className={styles.lineActions}>
                    <div className={styles.qtyRow}>
                      <button
                        onClick={() =>
                          updateQty(item.slug, item.size, item.qty - 1)
                        }
                        className={styles.qtyBtn}
                        aria-label="Decrease quantity"
                      >
                        &minus;
                      </button>
                      <span className={styles.qtyValue}>{item.qty}</span>
                      <button
                        onClick={() =>
                          updateQty(item.slug, item.size, item.qty + 1)
                        }
                        className={styles.qtyBtn}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeLine(item.slug, item.size)}
                      className={styles.removeBtn}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className={styles.summary}>
            <p className={styles.summaryTitle}>Order summary</p>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>{shipping === 0 ? "Free" : `$${shipping}`}</span>
            </div>
            {shipping > 0 && (
              <p className={styles.shippingNote}>
                Add ${75 - subtotal} more for free shipping
              </p>
            )}
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total</span>
              <span>${total}</span>
            </div>
            <button className={styles.checkoutBtn}>Checkout</button>
            <Link href="/shop" className={styles.continueLink}>
              &larr; Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
