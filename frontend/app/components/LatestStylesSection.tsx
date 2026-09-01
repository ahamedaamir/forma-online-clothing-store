"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./LatestStylesSection.module.css";
import type { Product, ProductColorway } from "../lib/products";
import { latestStyles as defaultStyles } from "../lib/products";
import { getApiLatestStyles } from "../lib/api";

interface LatestStylesSectionProps {
  title?: string;
  items?: Product[];
  shopAllHref?: string;
}

function SwatchIcon({ colors }: { colors: string[] }) {
  if (colors.length >= 2) {
    return (
      <span
        className={styles.swatchFill}
        style={{
          background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`,
        }}
      />
    );
  }
  return (
    <span
      className={styles.swatchFill}
      style={{ backgroundColor: colors[0] || "#111111" }}
    />
  );
}

function StyleCard({ item }: { item: Product }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);

  const hasColorways = Boolean(item.colorways && item.colorways.length > 0);
  const activeColorway: ProductColorway | undefined = hasColorways
    ? item.colorways?.[selectedVariantIdx]
    : undefined;

  const primaryImage = activeColorway?.primaryImage || item.image;
  const hoverImage = activeColorway?.hoverImage || item.hoverImage || item.image;
  const colorwayName = activeColorway?.colorName || item.category;

  return (
    <div className={styles.card}>
      <Link
        href={`/product/${item.slug}`}
        className={styles.imageWrapper}
        aria-label={`View ${item.name}`}
      >
        <img
          src={primaryImage}
          alt={item.name}
          className={styles.primaryImage}
          loading="lazy"
        />
        <img
          src={hoverImage}
          alt={`${item.name} alternate view`}
          className={styles.hoverImage}
          loading="lazy"
        />
        {item.tag && <span className={styles.tagBadge}>{item.tag}</span>}
      </Link>

      <div className={styles.cardDetails}>
        {hasColorways && item.colorways && item.colorways.length > 0 && (
          <div className={styles.swatchRow} role="radiogroup" aria-label="Color options">
            {item.colorways.map((cw, idx) => (
              <button
                key={cw.colorName}
                type="button"
                className={`${styles.swatchBtn} ${
                  idx === selectedVariantIdx ? styles.swatchActive : ""
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedVariantIdx(idx);
                }}
                onMouseEnter={() => setSelectedVariantIdx(idx)}
                aria-label={cw.colorName}
                title={cw.colorName}
              >
                <SwatchIcon colors={cw.swatchColors} />
              </button>
            ))}
          </div>
        )}

        <Link href={`/product/${item.slug}`} style={{ textDecoration: "none" }}>
          <h3 className={styles.itemTitle}>{item.name}</h3>
        </Link>
        <p className={styles.itemColorway}>{colorwayName}</p>
        <p className={styles.itemPrice}>
          {item.formattedPrice || (item.currency ? `${item.currency} ${item.price.toFixed(2)}` : `$${item.price.toFixed(2)}`)}
        </p>
      </div>
    </div>
  );
}

export default function LatestStylesSection({
  title = "SHOP THE LATEST STYLES",
  items = defaultStyles,
  shopAllHref = "/shop",
}: LatestStylesSectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [styleItems, setStyleItems] = useState<Product[]>(items);

  useEffect(() => {
    async function loadLatest() {
      try {
        const liveItems = await getApiLatestStyles();
        if (liveItems && liveItems.length > 0) {
          setStyleItems(liveItems);
        }
      } catch (err) {
        console.warn("Using default latest styles:", err);
      }
    }
    loadLatest();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const cardWidth = trackRef.current.clientWidth / 2;
    trackRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section} aria-label="Latest styles collection">
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.actions}>
          <Link href={shopAllHref} className={styles.shopAllLink}>
            SHOP ALL
          </Link>

          <div className={styles.navButtons}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => scroll("left")}
              aria-label="Previous styles"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => scroll("right")}
              aria-label="Next styles"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className={styles.trackWrapper}>
        <div className={styles.track} ref={trackRef}>
          {styleItems.map((item) => (
            <StyleCard key={item.slug} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
