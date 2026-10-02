"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./checkout.module.css";

type PaymentOrder = {
  orderId: string;
  status: "pending" | "paid" | "failed" | string;
  currency: string;
  amount: string;
  subtotal: string;
  deliveryFee: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    size: string;
    color: string;
    image: string;
    lineTotal: number;
  }>;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function formatLkr(value: number | string) {
  return `LKR ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function PaymentResult({
  mode,
  orderId,
}: {
  mode: "success" | "cancel";
  orderId: string;
}) {
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!orderId) return;

    let stopped = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;

    async function loadOrder() {
      attempts += 1;
      try {
        const response = await fetch(`${apiBaseUrl}/orders/${encodeURIComponent(orderId)}`, {
          cache: "no-store",
        });
        const result = await response.json();
        if (!response.ok || !result.order) throw new Error(result.message || "Order status is unavailable.");
        if (stopped) return;
        setOrder(result.order as PaymentOrder);
        setLoadError("");
        if (mode === "success" && result.order.status === "pending" && attempts < 20) {
          timer = setTimeout(loadOrder, 2000);
        }
      } catch (error) {
        if (stopped) return;
        setLoadError(error instanceof Error ? error.message : "Order status is unavailable.");
      }
    }

    void loadOrder();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [mode, orderId]);

  const title = mode === "cancel"
    ? "Payment cancelled"
    : order?.status === "paid"
      ? "Payment successful"
      : order?.status === "failed"
        ? "Payment not completed"
        : "Checking payment status";
  const description = mode === "cancel"
    ? "Your payment was cancelled. Your cart is still available if you would like to try again."
    : order?.status === "paid"
      ? "Your order is confirmed. Thank you for choosing Forma."
      : order?.status === "failed"
        ? "We could not confirm this payment. Your order has not been marked as paid."
        : "We are waiting for PayHere to confirm the payment securely.";
  const visibleLoadError = orderId
    ? loadError
    : "No order number was included in the payment return.";

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <section className={styles.resultPanel} aria-live="polite">
          <span className={styles.resultMark} aria-hidden="true">
            {mode === "cancel" ? "×" : order?.status === "paid" ? "✓" : "·"}
          </span>
          <p className={styles.eyebrow}>{mode === "cancel" ? "Checkout" : "Payment update"}</p>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.resultCopy}>{description}</p>

          {orderId && (
            <div className={styles.orderNumber}>
              <span>Order number</span>
              <strong>{orderId}</strong>
            </div>
          )}

          {order && (
            <>
              <span className={styles.resultStatus}>Status · {order.status}</span>
              <div className={styles.summaryItems}>
                {order.items.map((item) => (
                  <div className={styles.summaryItem} key={`${item.id}-${item.size}-${item.color}`}>
                    <div className={styles.thumbWrap}>
                      <Image src={item.image} alt={item.name} width={128} height={154} unoptimized className={styles.thumb} />
                      <span className={styles.quantityBadge}>{item.quantity}</span>
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <h3>{item.name}</h3>
                      <p>{item.color ? `${item.color} · ` : ""}Size {item.size}</p>
                      <strong>{formatLkr(item.lineTotal)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.totalRow}>
                <span>Order total</span>
                <strong>{formatLkr(order.amount)}</strong>
              </div>
            </>
          )}

          {visibleLoadError && <p className={styles.requestError} role="status">{visibleLoadError}</p>}
          {mode === "success" && order?.status === "pending" && (
            <p className={styles.currencyNote}>This page will update when PayHere sends its payment notification.</p>
          )}

          <div className={styles.resultActions}>
            {mode === "cancel" ? (
              <Link href="/cart" className={styles.primaryLink}>Return to cart</Link>
            ) : (
              <>
                <Link href="/shop" className={styles.primaryLink}>Continue shopping</Link>
                <Link href="/cart" className={styles.secondaryLink}>View cart</Link>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}