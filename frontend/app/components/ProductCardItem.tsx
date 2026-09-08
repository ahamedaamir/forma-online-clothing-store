"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProductCardItem.module.css";
import { Product } from "../lib/products";

export default function ProductCardItem({ product }: { product: Product }) {
  const [added, setAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <article className={styles.productCard}>
      <Link href={`/product/${product.slug}`} className={styles.imageLink}>
        <div className={styles.productImageWrap}>
          <img
            src={product.image}
            alt={product.name}
            className={styles.productImage}
            loading="lazy"
          />
          {product.hoverImage && (
            <img
              src={product.hoverImage}
              alt={`${product.name} – alternate view`}
              className={styles.productHoverImage}
              loading="lazy"
            />
          )}
          {product.tag && (
            <span className={styles.productTag} data-tag={product.tag}>
              {product.tag}
            </span>
          )}
        </div>
      </Link>

      <div className={styles.productBody}>
        <div className={styles.productMeta}>
          <Link href={`/product/${product.slug}`} className={styles.titleLink}>
            <h3 className={styles.productName}>{product.name}</h3>
          </Link>
          <p className={styles.productCategory}>{product.category}</p>
        </div>

        <div className={styles.priceRow}>
          <span className={styles.productPrice}>
            {product.formattedPrice ||
              `${product.currency || "LKR"} ${product.price.toLocaleString()}`}
          </span>
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          className={`${styles.addToCartBtn} ${added ? styles.addToCartBtnAdded : ""}`}
          aria-label={`Add ${product.name} to cart`}
        >
          {added ? (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Added to Bag</span>
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
