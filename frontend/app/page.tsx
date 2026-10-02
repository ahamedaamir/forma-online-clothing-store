"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./page.module.css";
import ShopByCategorySection from "./components/ShopByCategorySection";
import BestSellersSection from "./components/BestSellersSection";
import { products as catalogProducts, type Product } from "./lib/products";
import {
  fetchSpringSummerBanner,
  initialSpringSummerBanner,
  type SpringSummerBannerData,
} from "./lib/productService";

const bestSellerItems = [
  ...catalogProducts.filter((product) => product.tag === "Bestseller"),
  catalogProducts.find((product) => product.slug === "vanguard-oversized-tee"),
].filter((product): product is Product => product !== undefined);
const saleItems = catalogProducts
  .filter((product) => product.tag === "Bestseller" || product.inStock === false)
  .slice(0, 4);

export default function HomePage() {
  const [ssBanner, setSsBanner] = useState<SpringSummerBannerData>(initialSpringSummerBanner);
  const [activeSsSlide, setActiveSsSlide] = useState(0);

  useEffect(() => {
    async function loadBanner() {
      try {
        setSsBanner(await fetchSpringSummerBanner());
      } catch (err) {
        console.error("Failed to fetch spring/summer banner:", err);
      }
    }
    loadBanner();
  }, []);

  return (
    <main className={styles.main}>
      {/* ── 1. HERO BANNER ─────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroImageFrame}>
            <Image
              src="https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&crop=faces&w=2400&h=1500&q=90"
              alt="Model in a blue coat beneath the ornate towers of a city cathedral"
              fill
              priority
              unoptimized
              sizes="100vw"
              className={styles.heroImg}
            />
            <div className={styles.heroGradient} aria-hidden="true" />
            <div className={styles.heroInner}>
              <div className={styles.heroContent}>
                <span className={styles.heroKicker}>
                  <span className={styles.heroKickerDot} aria-hidden="true" />
                  New Season / Drop 02
                </span>
                <h1 className={styles.heroTitle}>Made to Move</h1>
                <p className={styles.heroSubtitle}>
                  Performance-ready streetwear and gym wear, designed and made in
                  Sri Lanka for training and everyday life.
                </p>
                <div className={styles.heroCtaGroup}>
                  <Link href="/shop" className={styles.heroPrimaryCta}>
                    Shop Collection
                  </Link>
                  <Link href="#best-sellers-heading" className={styles.heroSecondaryCta}>
                    Customer Favourites
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShopByCategorySection />

      {/* ── SPRING / SUMMER 2026 BANNER (LIMITED SALE) ─────────────── */}
      <section className={styles.springSummerBanner} aria-label="Spring Summer 2026 Campaign">
        <div className={styles.ssBgDecor} aria-hidden="true">
          <div className={styles.ssDecOrb1} />
          <div className={styles.ssDecOrb2} />
          <div className={styles.ssVignette} />
          <svg className={`${styles.ssLeafShadow} ${styles.ssLeafLeft}`} viewBox="0 0 512 512">
            <path d="M256 18C135 70 69 157 55 294c-8 77 30 137 91 142 47 4 82-30 110-81 28 51 63 85 110 81 61-5 99-65 91-142C443 157 377 70 256 18Z" fill="currentColor" />
            <path d="M256 31v397M249 152l-112-65m112 150-145-25m152 25 145-25M249 294l-121 38m135-38 121 38M248 405l-83 41m99-41 83 41" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <svg className={`${styles.ssLeafShadow} ${styles.ssLeafRight}`} viewBox="0 0 512 512">
            <path d="M256 18C135 70 69 157 55 294c-8 77 30 137 91 142 47 4 82-30 110-81 28 51 63 85 110 81 61-5 99-65 91-142C443 157 377 70 256 18Z" fill="currentColor" />
            <path d="M256 31v397M249 152l-112-65m112 150-145-25m152 25 145-25M249 294l-121 38m135-38 121 38M248 405l-83 41m99-41 83 41" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.springSummerInner}>
          <div
            className={styles.ssGlassPanel}
            style={{ backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)" }}
          >
            <div className={styles.ssContent} key={activeSsSlide}>
              <span className={styles.ssKicker}>
                <span className={styles.ssKickerDot} aria-hidden="true" />
                {ssBanner.kicker}
              </span>
              <h2 className={styles.ssTitle}>
                <span className={styles.ssTitleMain}>SPRING / SUMMER</span>
                <span className={styles.ssTitleYear}>2026</span>
              </h2>
              <p className={styles.ssDescription}>
                All the Spring 2026 Ready-to-Wear fashion show coverage in one place.
              </p>

              <div className={styles.ssButtonGroup}>
                <Link href={ssBanner.ctaTops.href} className={styles.ssBtnOutline}>
                  {ssBanner.ctaTops.label}
                </Link>
                <Link href={ssBanner.ctaDenim.href} className={styles.ssBtnSolid}>
                  {ssBanner.ctaDenim.label}
                </Link>
              </div>

              <div className={styles.ssDots} role="tablist" aria-label="Spring Summer slides">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.ssDot} ${idx === activeSsSlide ? styles.ssDotActive : ""}`}
                    onClick={() => setActiveSsSlide(idx)}
                    aria-label={`Show slide ${idx + 1}`}
                    aria-current={idx === activeSsSlide ? "true" : undefined}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>



      <BestSellersSection items={bestSellerItems} />

      <BestSellersSection
        items={saleItems}
        eyebrow="Seasonal Sale"
        heading="UPTO 50% OFF"
        headingId="sale-heading"
        sale
      />

      {/* ── BRAND PROMISE & SOCIAL PROOF ───────────────────── */}
      <section className={styles.reviewsSection}>
        <div className={styles.reviewsAtmosphere} aria-hidden="true">
          <span className={`${styles.emeraldOrb} ${styles.emeraldOrbLeft}`} />
          <span className={`${styles.emeraldOrb} ${styles.emeraldOrbRight}`} />
          <svg className={`${styles.leafShadow} ${styles.leafShadowLeft}`} viewBox="0 0 512 512">
            <path d="M256 18C135 70 69 157 55 294c-8 77 30 137 91 142 47 4 82-30 110-81 28 51 63 85 110 81 61-5 99-65 91-142C443 157 377 70 256 18Z" fill="currentColor" />
            <path d="M256 31v397M249 152l-112-65m112 150-145-25m152 25 145-25M249 294l-121 38m135-38 121 38M248 405l-83 41m99-41 83 41" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
          <svg className={`${styles.leafShadow} ${styles.leafShadowRight}`} viewBox="0 0 512 512">
            <path d="M256 18C135 70 69 157 55 294c-8 77 30 137 91 142 47 4 82-30 110-81 28 51 63 85 110 81 61-5 99-65 91-142C443 157 377 70 256 18Z" fill="currentColor" />
            <path d="M256 31v397M249 152l-112-65m112 150-145-25m152 25 145-25M249 294l-121 38m135-38 121 38M248 405l-83 41m99-41 83 41" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          </svg>
        </div>
        <div className={styles.reviewsContainer}>
          <div className={styles.reviewsHeader}>
            <p className={styles.reviewsEyebrow}>Customer Reviews</p>
            <h3 className={styles.reviewsTitle}>Loved by Real Everyday Shoppers</h3>
            <p className={styles.reviewsSub}>
              Over 40,000 verified buyers trust FORMA for comfortable everyday essentials.
            </p>
          </div>

          <div className={styles.reviewsGrid}>
            <div
              className={styles.reviewCard}
              style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <span className={styles.starIcon} aria-hidden="true" key={index}>star</span>
                ))}
              </div>
              <p className={styles.reviewQuote}>
                &ldquo;Finally, everyday t-shirts that don&apos;t shrink or lose shape after 10 washes! The fabric is soft, breathable, and fits true to size.&rdquo;
              </p>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewerName}>Sarah T.</span>
                <span className={styles.reviewerVerified}>Verified Buyer &bull; Dallas, TX</span>
              </div>
            </div>

            <div
              className={styles.reviewCard}
              style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <span className={styles.starIcon} aria-hidden="true" key={index}>star</span>
                ))}
              </div>
              <p className={styles.reviewQuote}>
                &ldquo;The stretch jeans and fleece hoodies are insanely comfortable. Fast 2-day delivery and returning the wrong size was completely effortless.&rdquo;
              </p>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewerName}>Marcus L.</span>
                <span className={styles.reviewerVerified}>Verified Buyer &bull; Chicago, IL</span>
              </div>
            </div>

            <div
              className={styles.reviewCard}
              style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
            >
              <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                {Array.from({ length: 5 }, (_, index) => (
                  <span className={styles.starIcon} aria-hidden="true" key={index}>star</span>
                ))}
              </div>
              <p className={styles.reviewQuote}>
                &ldquo;Great prices for kids&apos; school clothes. The multi-pack basics saved me a ton of money without sacrificing durability.&rdquo;
              </p>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewerName}>Jessica R.</span>
                <span className={styles.reviewerVerified}>Verified Buyer &bull; Seattle, WA</span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}