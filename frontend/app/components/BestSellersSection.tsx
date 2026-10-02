"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "../lib/products";
import styles from "./BestSellersSection.module.css";

const productCopy: Record<string, { description: string; label: string }> = {
  "vanguard-oversized-tee": {
    description: "Heavyweight cotton jersey with a relaxed streetwear fit.",
    label: "Washed Black",
  },
  "leaguerun-baby-tee": {
    description: "Cropped raglan fit in soft stretch cotton.",
    label: "Maroon / White",
  },
  "luna-linen-set": {
    description: "A breathable two-piece set for warm-weather days.",
    label: "Beige Linen",
  },
  "junior-explorer-hoodie": {
    description: "A soft fleece hoodie made for everyday play.",
    label: "Brushed Fleece",
  },
};

const filters = [
  { label: "All", href: "/shop" },
  { label: "Men", href: "/shop?category=Men" },
  { label: "Women", href: "/shop?category=Women" },
  { label: "Kids", href: "/shop?category=Kids" },
];

function BestSellerCard({ item }: { item: Product }) {
  const [added, setAdded] = useState(false);
  const content = productCopy[item.slug] ?? {
    description: item.description.split(".")[0] + ".",
    label: item.colorways?.[0]?.colorName ?? item.category,
  };
  const formattedPrice = `LKR ${item.price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  function handleQuickAdd() {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <article className={styles.card}>
      <Link href={`/product/${item.slug}`} className={styles.productLink}>
        <span className={styles.imageFrame}>
          <Image
            src={item.image}
            alt={`${item.name} in ${content.label}`}
            fill
            unoptimized
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"
            className={styles.productImage}
          />
          <span className={styles.pricePill}>{formattedPrice}</span>
        </span>
        <span className={styles.productDetails}>
          <span className={styles.productCopy}>
            <span className={styles.productTitle}>{item.name}</span>
            <span className={styles.productDescription}>{content.description}</span>
          </span>
          <span className={styles.productLabel}>{content.label}</span>
        </span>
      </Link>
      <button
        className={styles.quickAdd}
        onClick={handleQuickAdd}
        type="button"
        aria-label={added ? `${item.name} added` : `Quick add ${item.name}`}
      >
        <span className={styles.materialSymbol} aria-hidden="true">
          {added ? "check" : "add_shopping_cart"}
        </span>
        {added ? "Added" : "Quick Add"}
      </button>
    </article>
  );
}

export default function BestSellersSection({ items }: { items: Product[] }) {
  return (
    <section className={styles.section} aria-labelledby="best-sellers-heading">
      <div className={styles.header}>
        <div className={styles.headingGroup}>
          <p className={styles.eyebrow}>Best Sellers</p>
          <h2 className={styles.heading} id="best-sellers-heading">
            Customer Favourites
          </h2>
        </div>
        <nav className={styles.filters} aria-label="Shop by category">
          {filters.map((filter, index) => (
            <Link
              className={index === 0 ? styles.filterActive : styles.filter}
              href={filter.href}
              key={filter.label}
            >
              {filter.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <BestSellerCard item={item} key={item.slug} />
        ))}
      </div>
    </section>
  );
}