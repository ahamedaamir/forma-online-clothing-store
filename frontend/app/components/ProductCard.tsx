"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./ProductCard.module.css";
import { ProductItem } from "../lib/productService";

interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((prev) => !prev);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdded(true);
    if (onAddToCart) {
      onAddToCart(product);
    }
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Calculate discount percentage if originalPrice exists
  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className={styles.card}>
      {/* ── IMAGE WRAPPER ──────────────────────────────────── */}
      <div className={styles.imageFrame}>
        <Link href={`/product/${product.id}`} className={styles.imageLink} aria-label={product.name}>
          <img
            src={product.imageUrl}
            alt={product.name}
            className={styles.mainImage}
            loading="lazy"
          />
          {product.hoverImageUrl && (
            <img
              src={product.hoverImageUrl}
              alt={`${product.name} alternate view`}
              className={styles.hoverImage}
              loading="lazy"
            />
          )}
        </Link>

        {/* Top-Left Sale / Bestseller Badge */}
        {product.badge && (
          <span
            className={`${styles.badge} ${
              product.badge.toLowerCase().includes("sale") || product.badge.includes("%")
                ? styles.badgeSale
                : product.badge.toLowerCase().includes("bestseller")
                ? styles.badgeBestseller
                : styles.badgeDefault
            }`}
          >
            {product.badge}
          </span>
        )}

        {/* Top-Right Heart / Wishlist Icon Button */}
        <button
          type="button"
          onClick={toggleWishlist}
          className={`${styles.wishlistBtn} ${isWishlisted ? styles.wishlistBtnActive : ""}`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          title={isWishlisted ? "Wishlisted" : "Save to wishlist"}
        >
          <svg
            className={styles.heartIcon}
            viewBox="0 0 24 24"
            fill={isWishlisted ? "#e52e2e" : "none"}
            stroke={isWishlisted ? "#e52e2e" : "currentColor"}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>

        {/* Quick discount chip */}
        {discountPercent && (
          <span className={styles.discountChip}>-{discountPercent}%</span>
        )}
      </div>

      {/* ── CARD BODY ──────────────────────────────────────── */}
      <div className={styles.cardBody}>
        {/* Category & Rating Row */}
        <div className={styles.metaRow}>
          <span className={styles.categoryName}>{product.category}</span>
          <div className={styles.ratingBox}>
            <span className={styles.starIcon}>★</span>
            <span className={styles.ratingNumber}>{product.rating.toFixed(1)}</span>
            <span className={styles.reviewCount}>({product.reviewCount})</span>
          </div>
        </div>

        {/* Product Title */}
        <Link href={`/product/${product.id}`} className={styles.titleLink}>
          <h3 className={styles.productTitle} title={product.name}>
            {product.name}
          </h3>
        </Link>

        {/* Color Swatch Dots */}
        {product.colors && product.colors.length > 0 && (
          <div className={styles.swatchesRow} aria-label="Available colors">
            {product.colors.map((c, idx) => (
              <span
                key={idx}
                className={styles.colorDot}
                style={{ backgroundColor: c }}
                title={`Color option ${idx + 1}`}
              />
            ))}
            <span className={styles.moreColors}>+{product.colors.length} colors</span>
          </div>
        )}

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.currentPrice}>LKR {product.price.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>
              LKR {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Highly Visible Bottom "Add to Cart" Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`${styles.addToCartBtn} ${isAdded ? styles.addToCartBtnSuccess : ""}`}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAdded ? (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Added to Cart!</span>
            </>
          ) : (
            <>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
