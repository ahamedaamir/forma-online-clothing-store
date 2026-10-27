"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Product } from "../../lib/products";
import { addCartItem } from "../../lib/cart";
import { notifyCartAdded } from "../../lib/motionEvents";
import { apiCreateReview, getApiReviews, type CustomerReview } from "../../lib/api";
import { useReducedMotion } from "../../components/Motion";
import styles from "./product-detail.module.css";

const sizeChart = [
  ["XS", "78", "43"],
  ["S", "82", "44"],
  ["M", "88", "45"],
  ["L", "94", "46"],
  ["XL", "100", "47"],
  ["XXL", "106", "48"],
];
const themeChangeEvent = "forma-product-theme-change";

function subscribeToTheme(callback: () => void) {
  window.addEventListener(themeChangeEvent, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(themeChangeEvent, callback);
    window.removeEventListener("storage", callback);
  };
}

function getDarkModeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function formatPrice(price: number) {
  return `LKR ${price.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function isSizeInStock(product: Product, size: string) {
  return product.sizeStock?.[size] ?? product.inStock !== false;
}

export default function ProductDetail({ product }: { product: Product }) {
  const colorways = (product.colorways?.length
    ? product.colorways
    : [{
        colorName: product.category,
        swatchColors: ["#181818"],
        primaryImage: product.image,
        hoverImage: product.hoverImage || product.image,
      }]).map((cw, idx) => (idx === 0 ? {
        ...cw,
        primaryImage: product.image || cw.primaryImage,
        hoverImage: product.hoverImage || cw.hoverImage,
      } : cw));
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const activeColorway = colorways[selectedColorIdx];
  const galleryImages = Array.from(new Set([
    activeColorway.primaryImage,
    activeColorway.hoverImage,
    ...(product.slug === "leaguerun-baby-tee"
      ? [
          selectedColorIdx === 0
            ? "https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9033.jpg?v=1787736560"
            : "https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9055_121bc314-44b5-4ea5-8c58-3064f63ed344.jpg?v=1787736500",
          "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
        ]
      : []),
  ].filter(Boolean)));
  const [imageIdx, setImageIdx] = useState(0);
  const [size, setSize] = useState(
    product.sizes.find((candidate) => isSizeInStock(product, candidate)) || ""
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const darkMode = useSyncExternalStore(subscribeToTheme, getDarkModeSnapshot, () => false);
  const reducedMotion = useReducedMotion();
  const [feedback, setFeedback] = useState("");
  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewStatus, setReviewStatus] = useState("");
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const galleryFrameRef = useRef<HTMLDivElement>(null);
  const sizeGuideCloseRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentImage = galleryImages[imageIdx] || product.image;
  const totalPrice = formatPrice(product.price * qty);
  const categoryHref = `/shop?category=${encodeURIComponent(product.category)}`;
  const isSoldOut = product.inStock === false || !product.sizes.some((candidate) => isSizeInStock(product, candidate));

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("forma-product-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const useDarkMode = savedTheme ? savedTheme === "dark" : prefersDark;
    document.documentElement.classList.toggle("dark", useDarkMode);
    window.dispatchEvent(new Event(themeChangeEvent));
  }, []);

  useEffect(() => {
    let active = true;
    getApiReviews(product.slug)
      .then((productReviews) => {
        if (active) setReviews(productReviews);
      })
      .catch((error: unknown) => {
        console.error("Could not load product reviews:", error);
        if (active) setReviewStatus("Reviews could not be loaded. Please try again later.");
      })
      .finally(() => {
        if (active) setReviewsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [product.slug]);

  useEffect(() => {
    const target = addButtonRef.current;
    if (!target || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowMobileCart(!entry.isIntersecting);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (sizeGuideOpen) {
        if (event.key === "Escape") setSizeGuideOpen(false);
        return;
      }
      if (event.key === "ArrowLeft") {
        setImageIdx((index) => (index - 1 + galleryImages.length) % galleryImages.length);
      } else if (event.key === "ArrowRight") {
        setImageIdx((index) => (index + 1) % galleryImages.length);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [galleryImages.length, sizeGuideOpen]);

  useEffect(() => {
    if (sizeGuideOpen) sizeGuideCloseRef.current?.focus();
  }, [sizeGuideOpen]);

  useEffect(() => () => {
    if (addedTimer.current) clearTimeout(addedTimer.current);
  }, []);

  function selectColor(index: number) {
    setSelectedColorIdx(index);
    setImageIdx(0);
  }

  function addToCart() {
    if (!size) {
      setSizeError(true);
      setFeedback("Please select a size");
      return;
    }
    const wasAdded = addCartItem(product.slug, size, activeColorway.colorName, qty);
    if (!wasAdded) {
      setFeedback("This item could not be added to your cart.");
      return;
    }
    notifyCartAdded(product.name, currentImage, addButtonRef.current);
    setAdded(true);
    setFeedback("Added to your cart");
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => {
      setAdded(false);
      setFeedback("");
    }, 1500);
  }

  function toggleDarkMode() {
    const nextMode = !darkMode;
    document.documentElement.classList.toggle("dark", nextMode);
    window.localStorage.setItem("forma-product-theme", nextMode ? "dark" : "light");
    window.dispatchEvent(new Event(themeChangeEvent));
  }

  function swipeEnd(clientX: number) {
    if (touchStartX.current === null) return;
    const delta = clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      setImageIdx((index) => (index + (delta < 0 ? 1 : -1) + galleryImages.length) % galleryImages.length);
    }
    touchStartX.current = null;
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewStatus("");
    setReviewSubmitting(true);
    try {
      const review = await apiCreateReview(product.slug, {
        productName: product.name,
        reviewerName,
        rating: reviewRating,
        reviewText,
      });
      setReviews((currentReviews) => [review, ...currentReviews]);
      setReviewerName("");
      setReviewRating(5);
      setReviewText("");
      setReviewStatus("Thank you! Your review has been added.");
    } catch (error) {
      console.error("Could not submit product review:", error);
      setReviewStatus(error instanceof Error ? error.message : "Your review could not be submitted. Please try again.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <main className={styles.wrap}>
      <div className={styles.leafShadow} aria-hidden="true" />
      <div className={styles.leafShadowAlt} aria-hidden="true" />
      <div className={styles.crumbRow}>
        <nav className={styles.crumbs} aria-label="Breadcrumb">
          <Link href="/shop">Shop</Link><span>/</span>
          <Link href={categoryHref}>{product.category}</Link><span>/</span>
          <span className={styles.crumbCurrent}>{product.name}</span>
        </nav>
        <button
          type="button"
          className={styles.themeToggle}
          onClick={toggleDarkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20.9 13A8.5 8.5 0 0 1 11 3.1 8.5 8.5 0 1 0 20.9 13Z" /></svg>
          )}
        </button>
      </div>

      <div className={styles.layout}>
        <section className={styles.galleryColumn} aria-label={`${product.name} photos`}>
          <div
            ref={galleryFrameRef}
            className={styles.galleryFrame}
            onMouseMove={(event) => {
              if (reducedMotion || window.innerWidth < 768 || window.matchMedia("(hover: none)").matches) return;
              const bounds = event.currentTarget.getBoundingClientRect();
              event.currentTarget.style.setProperty("--zoom-x", `${((event.clientX - bounds.left) / bounds.width) * 100}%`);
              event.currentTarget.style.setProperty("--zoom-y", `${((event.clientY - bounds.top) / bounds.height) * 100}%`);
            }}
            onMouseLeave={() => {
              galleryFrameRef.current?.style.removeProperty("--zoom-x");
              galleryFrameRef.current?.style.removeProperty("--zoom-y");
            }}
            onTouchStart={(event) => { touchStartX.current = event.touches[0]?.clientX ?? null; }}
            onTouchEnd={(event) => swipeEnd(event.changedTouches[0]?.clientX ?? 0)}
          >
            <img
              key={currentImage}
              src={currentImage}
              alt={`${product.name} in ${activeColorway.colorName}, image ${imageIdx + 1}`}
              className={styles.mainImage}
              draggable={false}
            />
            {product.tag && <span className={styles.badge}>{product.tag}</span>}
            <span className={styles.imageCounter} aria-live="polite">
              {String(imageIdx + 1).padStart(2, "0")} / {String(galleryImages.length).padStart(2, "0")}
            </span>
          </div>
          <div className={styles.thumbnails} aria-label="Choose product image">
            {galleryImages.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                className={`${styles.thumbnail} ${imageIdx === index ? styles.thumbnailActive : ""}`}
                onClick={() => setImageIdx(index)}
                aria-label={`Show image ${index + 1} of ${galleryImages.length}`}
                aria-pressed={imageIdx === index}
              >
                <img src={image} alt={`${product.name} thumbnail ${index + 1}`} />
              </button>
            ))}
          </div>
        </section>

        <section className={styles.infoPanel} aria-label="Product information">
          <p className={styles.category}>{(product.gender || product.category).toUpperCase()}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>{formatPrice(product.price)}</p>
          <p className={styles.description}>{product.description}</p>

          <div className={styles.field}>
            <div className={styles.fieldHeading}>
              <span>Color</span><strong>{activeColorway.colorName.toUpperCase()}</strong>
            </div>
            <div className={styles.swatches} role="group" aria-label="Color options">
              {colorways.map((colorway, index) => (
                <button
                  key={colorway.colorName}
                  type="button"
                  className={`${styles.swatch} ${index === selectedColorIdx ? styles.swatchActive : ""}`}
                  onClick={() => selectColor(index)}
                  aria-label={`Select ${colorway.colorName}`}
                  aria-pressed={index === selectedColorIdx}
                  title={colorway.colorName}
                >
                  <span style={{ background: colorway.swatchColors.length > 1
                    ? `linear-gradient(135deg, ${colorway.swatchColors[0]} 50%, ${colorway.swatchColors[1]} 50%)`
                    : colorway.swatchColors[0] }} />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.fieldHeading}>
              <span>Size</span>
              <button type="button" className={styles.sizeGuideLink} onClick={() => setSizeGuideOpen(true)}>Size guide</button>
            </div>
            <div className={`${styles.sizeGrid} ${sizeError ? styles.sizeGridError : ""}`}>
              {product.sizes.map((candidate) => {
                const available = isSizeInStock(product, candidate);
                return (
                  <button
                    key={candidate}
                    type="button"
                    className={`${styles.sizeButton} ${size === candidate ? styles.sizeButtonActive : ""}`}
                    onClick={() => { setSize(candidate); setSizeError(false); setFeedback(""); }}
                    disabled={!available}
                    aria-label={`${candidate}${available ? "" : ", out of stock"}`}
                    aria-pressed={size === candidate}
                  >
                    {candidate}
                  </button>
                );
              })}
            </div>
            {sizeError && <p className={styles.errorMessage} aria-live="polite">Please select a size</p>}
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Quantity</span>
            <div className={styles.quantityControl}>
              <button type="button" onClick={() => setQty((value) => Math.max(1, value - 1))} disabled={qty <= 1} aria-label="Decrease quantity">−</button>
              <span key={qty} className={styles.quantityValue} aria-live="polite">{qty}</span>
              <button type="button" onClick={() => setQty((value) => Math.min(10, value + 1))} disabled={qty >= 10} aria-label="Increase quantity">+</button>
            </div>
          </div>

          <button
            ref={addButtonRef}
            type="button"
            className={styles.addButton}
            onClick={addToCart}
            disabled={isSoldOut}
            aria-live="polite"
          >
            {isSoldOut ? "Sold Out" : added ? "Added to Cart ✓" : <span key={totalPrice} className={styles.priceChange}>{`Add to Cart — ${totalPrice}`}</span>}
          </button>
          <p className={styles.cartFeedback} aria-live="polite">{feedback}</p>

          <dl className={styles.specs}>
            <div><dt>Fabric</dt><dd>{product.fabric || "Premium cotton blend"}</dd></div>
            <div><dt>Care</dt><dd>{product.care || "Machine wash cold, easy care"}</dd></div>
            <div><dt>Shipping</dt><dd>{product.shipping || "Free delivery over LKR 7,500, 2-3 days island-wide"}</dd></div>
          </dl>
          <div className={styles.trustBadges}>
            <span><span aria-hidden="true">◉</span> Original Activewear</span>
            <span><span aria-hidden="true">⇄</span> 14-Day Seamless Exchange</span>
          </div>
        </section>
      </div>

      <section className={styles.reviewsSection} aria-labelledby="product-reviews-title">
        <div className={styles.reviewsHeading}>
          <div>
            <p className={styles.reviewsEyebrow}>Customer feedback</p>
            <h2 id="product-reviews-title">Reviews for {product.name}</h2>
          </div>
          <span>{reviews.length} {reviews.length === 1 ? "review" : "reviews"}</span>
        </div>

        <div className={styles.reviewsLayout}>
          <form className={styles.reviewForm} onSubmit={submitReview}>
            <h3>Share your feedback</h3>
            <label htmlFor="reviewer-name">Your name</label>
            <input
              id="reviewer-name"
              type="text"
              value={reviewerName}
              onChange={(event) => setReviewerName(event.target.value)}
              minLength={2}
              maxLength={60}
              autoComplete="name"
              required
            />
            <fieldset className={styles.ratingField}>
              <legend>Your rating</legend>
              <div className={styles.ratingButtons}>
                {Array.from({ length: 5 }, (_, index) => {
                  const rating = index + 1;
                  return (
                    <button
                      key={rating}
                      type="button"
                      className={rating <= reviewRating ? styles.ratingActive : ""}
                      onClick={() => setReviewRating(rating)}
                      aria-label={`${rating} ${rating === 1 ? "star" : "stars"}`}
                      aria-pressed={reviewRating === rating}
                    >
                      ★
                    </button>
                  );
                })}
              </div>
            </fieldset>
            <label htmlFor="review-text">Your review</label>
            <textarea
              id="review-text"
              value={reviewText}
              onChange={(event) => setReviewText(event.target.value)}
              minLength={5}
              maxLength={1000}
              rows={4}
              required
            />
            <button type="submit" className={styles.reviewSubmit} disabled={reviewSubmitting}>
              {reviewSubmitting ? "Submitting…" : "Submit review"}
            </button>
            <p className={styles.reviewStatus} aria-live="polite">{reviewStatus}</p>
          </form>

          <div className={styles.reviewList} aria-live="polite">
            {reviewsLoading ? (
              <p className={styles.noReviews}>Loading reviews…</p>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <article className={styles.productReview} key={review.id}>
                  <div className={styles.productReviewMeta}>
                    <strong>{review.reviewerName}</strong>
                    <span className={styles.productReviewStars} aria-label={`${review.rating} out of 5 stars`}>
                      {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p>{review.reviewText}</p>
                  <time dateTime={review.createdAt}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </time>
                </article>
              ))
            ) : (
              <p className={styles.noReviews}>No reviews yet. Be the first to share your feedback.</p>
            )}
          </div>
        </div>
      </section>

      <div className={`${styles.mobileCartBar} ${showMobileCart ? styles.mobileCartBarVisible : ""}`} aria-hidden={!showMobileCart}>
        <button type="button" onClick={addToCart} disabled={isSoldOut || !showMobileCart} tabIndex={showMobileCart ? 0 : -1} aria-live="polite">
          {isSoldOut ? "Sold Out" : added ? "Added to Cart ✓" : <span key={totalPrice} className={styles.priceChange}>{`Add to Cart — ${totalPrice}`}</span>}
        </button>
      </div>

      {sizeGuideOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSizeGuideOpen(false); }}>
          <section className={styles.sizeModal} role="dialog" aria-modal="true" aria-labelledby="size-modal-title">
            <div className={styles.modalHeading}>
              <h2 id="size-modal-title">Size guide</h2>
              <button ref={sizeGuideCloseRef} type="button" onClick={() => setSizeGuideOpen(false)} aria-label="Close size guide">
                <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m18 6-12 12M6 6l12 12" /></svg>
              </button>
            </div>
            <p>Measurements are garment measurements in centimetres.</p>
            <table><thead><tr><th>Size</th><th>Chest</th><th>Length</th></tr></thead><tbody>
              {sizeChart.map(([label, chest, length]) => <tr key={label}><td>{label}</td><td>{chest}</td><td>{length}</td></tr>)}
            </tbody></table>
          </section>
        </div>
      )}
    </main>
  );
}
