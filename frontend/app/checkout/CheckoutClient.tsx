"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products, type ProductColorway } from "../lib/products";
import {
  getCartLines,
  subscribeToCart,
  type CartLine,
} from "../lib/cart";
import styles from "./checkout.module.css";

type CheckoutForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
};

type FieldName = keyof CheckoutForm;

type CheckoutOrder = {
  orderId: string;
  amount: string;
  currency: string;
  subtotal: string;
  deliveryFee: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
    lineTotal: number;
  }>;
};

type CreateOrderResponse = {
  success: boolean;
  message?: string;
  errors?: Partial<Record<FieldName, string>>;
  order?: CheckoutOrder;
  fields?: Record<string, string>;
};

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const configuredDeliveryFee = Number(process.env.NEXT_PUBLIC_DELIVERY_FEE || "350");
const deliveryFee = Number.isFinite(configuredDeliveryFee) && configuredDeliveryFee >= 0
  ? configuredDeliveryFee
  : 350;

const initialForm: CheckoutForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  postalCode: "",
};

const fieldLabels: Record<FieldName, string> = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email address",
  phone: "Phone number",
  addressLine1: "Address line 1",
  addressLine2: "Address line 2",
  city: "City",
  postalCode: "Postal code",
};

function formatLkr(value: number | string) {
  return `LKR ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function validateField(name: FieldName, value: string) {
  const clean = value.trim();
  if (name === "addressLine2") return "";
  if (!clean) return `${fieldLabels[name]} is required.`;
  if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
    return "Enter a valid email address.";
  }
  if (name === "phone" && !/^07\d{8}$/.test(clean.replace(/[\s()-]/g, ""))) {
    return "Enter a valid Sri Lankan mobile number, e.g. 07X XXX XXXX.";
  }
  if (name === "postalCode" && !/^[a-zA-Z0-9 -]{3,12}$/.test(clean)) {
    return "Enter a valid postal code.";
  }
  return "";
}

function Field({
  name,
  value,
  error,
  type = "text",
  placeholder,
  autoComplete,
  onChange,
  onBlur,
}: {
  name: FieldName;
  value: string;
  error: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  onChange: (name: FieldName, value: string) => void;
  onBlur: (name: FieldName) => void;
}) {
  const id = `checkout-${name}`;
  const optional = name === "addressLine2";
  return (
    <label className={`${styles.field} ${name === "addressLine1" || name === "addressLine2" ? styles.fieldWide : ""}`} htmlFor={id}>
      <span className={styles.fieldLabel}>
        {fieldLabels[name]}{optional && <span className={styles.optional}>Optional</span>}
      </span>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={!optional}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`${styles.input} ${error ? styles.inputInvalid : ""}`}
        onChange={(event) => onChange(name, event.target.value)}
        onBlur={() => onBlur(name)}
      />
      <span className={styles.fieldError} id={`${id}-error`}>
        {error || " "}
      </span>
    </label>
  );
}

export default function CheckoutClient() {
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    const syncCart = () => setCartLines(getCartLines());
    syncCart();
    return subscribeToCart(syncCart);
  }, []);

  const items = cartLines.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    if (!product) return [];
    const colorway: ProductColorway | undefined = product.colorways?.find(
      (variant) => variant.colorName === line.color
    );
    return [{ ...line, product, image: colorway?.primaryImage || product.image }];
  });
  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const total = subtotal + (items.length ? deliveryFee : 0);
  const fieldErrors = Object.fromEntries(
    Object.entries(form).map(([name, value]) => [name, validateField(name as FieldName, value)])
  ) as Record<FieldName, string>;
  const formIsValid = Object.values(fieldErrors).every((error) => !error);

  function updateField(name: FieldName, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setRequestError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched(Object.fromEntries(Object.keys(form).map((name) => [name, true])) as Record<FieldName, boolean>);
    if (!formIsValid || items.length === 0 || submitting) return;

    setSubmitting(true);
    setRequestError("");
    try {
      const response = await fetch(`${apiBaseUrl}/checkout/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.slug,
            quantity: item.qty,
            size: item.size,
            color: item.color || "",
          })),
          customer: {
            ...form,
            phone: form.phone.replace(/[\s()-]/g, ""),
            country: "Sri Lanka",
          },
        }),
      });
      const result = (await response.json()) as CreateOrderResponse;
      if (!response.ok || !result.fields) {
        if (result.errors) {
          setTouched((current) => ({ ...current, ...Object.fromEntries(Object.keys(result.errors!).map((name) => [name, true])) }));
        }
        throw new Error(result.message || "Could not create the order. Please try again.");
      }

      const payHereForm = document.createElement("form");
      payHereForm.method = "POST";
      payHereForm.action = "https://sandbox.payhere.lk/pay/checkout";
      payHereForm.hidden = true;
      Object.entries(result.fields).forEach(([name, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        payHereForm.appendChild(input);
      });
      document.body.appendChild(payHereForm);
      payHereForm.submit();
    } catch (error) {
      setRequestError(error instanceof Error ? error.message : "Could not start PayHere checkout.");
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.pageInner}>
        <div className={styles.pageHeading}>
          <Link href="/cart" className={styles.backLink}>
            <span className={`${styles.materialSymbol} material-symbols-outlined`} aria-hidden="true">arrow_back</span>
            Back to cart
          </Link>
          <p className={styles.eyebrow}>Secure checkout</p>
          <h1 className={styles.title}>Complete your order</h1>
          <p className={styles.subtitle}>Delivery across Sri Lanka, with care.</p>
        </div>

        {items.length === 0 ? (
          <section className={styles.emptyPanel}>
            <h2>Your cart is empty</h2>
            <p>Add a few everyday essentials before checking out.</p>
            <Link href="/shop" className={styles.primaryLink}>Continue shopping</Link>
          </section>
        ) : (
          <div className={styles.checkoutGrid}>
            <form className={styles.formPanel} onSubmit={handleSubmit} noValidate>
              <div className={styles.panelHeading}>
                <span className={styles.stepNumber}>01</span>
                <div>
                  <h2>Delivery details</h2>
                  <p>Where should we send your order?</p>
                </div>
              </div>

              <div className={styles.formGrid}>
                <Field name="firstName" value={form.firstName} error={touched.firstName ? fieldErrors.firstName : ""} autoComplete="given-name" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="lastName" value={form.lastName} error={touched.lastName ? fieldErrors.lastName : ""} autoComplete="family-name" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="email" type="email" value={form.email} error={touched.email ? fieldErrors.email : ""} autoComplete="email" placeholder="you@example.com" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="phone" type="tel" value={form.phone} error={touched.phone ? fieldErrors.phone : ""} autoComplete="tel" placeholder="07X XXX XXXX" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="addressLine1" value={form.addressLine1} error={touched.addressLine1 ? fieldErrors.addressLine1 : ""} autoComplete="address-line1" placeholder="Street address" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="addressLine2" value={form.addressLine2} error={touched.addressLine2 ? fieldErrors.addressLine2 : ""} autoComplete="address-line2" placeholder="Apartment, suite, etc." onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="city" value={form.city} error={touched.city ? fieldErrors.city : ""} autoComplete="address-level2" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <Field name="postalCode" value={form.postalCode} error={touched.postalCode ? fieldErrors.postalCode : ""} autoComplete="postal-code" onChange={updateField} onBlur={(name) => setTouched((current) => ({ ...current, [name]: true }))} />
                <label className={`${styles.field} ${styles.fieldWide}`} htmlFor="checkout-country">
                  <span className={styles.fieldLabel}>Country</span>
                  <input id="checkout-country" className={styles.input} value="Sri Lanka" readOnly />
                  <span className={styles.fieldError} aria-hidden="true"> </span>
                </label>
              </div>

              <div className={styles.formFooter}>
                <p className={styles.secureNote}>
                  <span className={`${styles.materialSymbol} material-symbols-outlined`} aria-hidden="true">lock</span>
                  Payment details are handled securely by PayHere.
                </p>
                {requestError && <p className={styles.requestError} role="alert">{requestError}</p>}
                <button
                  type="submit"
                  className={styles.payButton}
                  disabled={!formIsValid || items.length === 0 || submitting}
                >
                  {submitting ? "Creating secure order…" : "Pay with PayHere"}
                  {!submitting && <span className={`${styles.materialSymbol} material-symbols-outlined`} aria-hidden="true">arrow_forward</span>}
                </button>
              </div>
            </form>

            <aside className={styles.summaryPanel} aria-label="Order summary">
              <div className={styles.panelHeading}>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <h2>Your order</h2>
                  <p>{items.reduce((count, item) => count + item.qty, 0)} items</p>
                </div>
              </div>
              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div className={styles.summaryItem} key={`${item.slug}-${item.size}-${item.color ?? "default"}`}>
                    <div className={styles.thumbWrap}>
                      <Image src={item.image} alt={item.product.name} width={128} height={154} unoptimized className={styles.thumb} />
                      <span className={styles.quantityBadge}>{item.qty}</span>
                    </div>
                    <div className={styles.summaryItemInfo}>
                      <h3>{item.product.name}</h3>
                      <p>{item.color ? `${item.color} · ` : ""}Size {item.size}</p>
                      <strong>{formatLkr(item.product.price * item.qty)}</strong>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.totals}>
                <div className={styles.totalRow}><span>Subtotal</span><span>{formatLkr(subtotal)}</span></div>
                <div className={styles.totalRow}><span>Delivery</span><span>{formatLkr(deliveryFee)}</span></div>
                <div className={`${styles.totalRow} ${styles.grandTotal}`}><strong>Total</strong><strong>{formatLkr(total)}</strong></div>
                <p className={styles.currencyNote}>All amounts are in Sri Lankan rupees.</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}