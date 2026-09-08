"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import LatestStylesSection from "./components/LatestStylesSection";
import { products as catalogProducts, type Product } from "./lib/products";
import {
  fetchProducts,
  initialProducts,
  type ProductItem,
} from "./lib/productService";

const bestSellerItems = catalogProducts.filter((product) => product.tag === "Bestseller");
const loadBestSellerItems = async (): Promise<Product[]> => bestSellerItems;
const saleItems = catalogProducts
  .filter((product) => product.tag === "Bestseller" || product.inStock === false)
  .slice(0, 4);
const loadSaleItems = async (): Promise<Product[]> => saleItems;

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  const heroSlides = products.filter((product) => product.imageUrl).slice(0, 4);
  const activeHeroProduct = heroSlides[activeHeroSlide % Math.max(heroSlides.length, 1)];

  // Dynamic API Fetch Simulation (No hardcoded data inside UI components)
  useEffect(() => {
    async function loadData() {
      try {
        const prodData = await fetchProducts({ category: "All" });
        setProducts(prodData);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    setActiveHeroSlide(0);
  }, [products]);

  useEffect(() => {
    if (heroSlides.length < 2) return;

    const heroTimer = window.setInterval(() => {
      setActiveHeroSlide((currentSlide) => (currentSlide + 1) % heroSlides.length);
    }, 5500);

    return () => window.clearInterval(heroTimer);
  }, [heroSlides.length]);

  return (
    <main className={styles.main}>
      {/* ── 1. HERO BANNER ─────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.heroKicker}>NEW SEASON</span>
            <h1 className={styles.heroTitle}>FORMA</h1>
            <p className={styles.heroSubtitle}>
              Everyday silhouettes, considered details.
            </p>

            {/* Prominent High-Contrast Call-to-Action (CTA) button labeled "Shop the Sale" */}
            <div className={styles.heroCtaGroup}>
              <Link href="/shop" className={styles.heroPrimaryCta}>
                <span>Shop now</span>
                <span className={styles.heroCtaDot} aria-hidden="true">•</span>
                <span className={styles.heroCtaArrow} aria-hidden="true">↗</span>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className={styles.heroBadges}>
              <div className={styles.heroBadgeItem}>
                <span className={styles.badgeCheck}>✓</span>
                <span>Free delivery on LKR 7,500+</span>
              </div>
              <div className={styles.heroBadgeItem}>
                <span className={styles.badgeCheck}>✓</span>
                <span>30-day easy returns</span>
              </div>
              <div className={styles.heroBadgeItem}>
                <span className={styles.badgeCheck}>✓</span>
                <span>4.8/5 from 40k+ shoppers</span>
              </div>
            </div>
          </div>

          {/* Hero Image Visual */}
          <div className={styles.heroImageFrame}>
            {activeHeroProduct && (
              <img
                key={activeHeroProduct.id}
                src={activeHeroProduct.imageUrl}
                alt={activeHeroProduct.name}
                className={styles.heroImg}
              />
            )}
            <div className={styles.heroSaleTag}>
              <span className={styles.saleTagFire}>🔥</span>
              <div>
                <p className={styles.saleTagHead}>Flash Deals Live</p>
                <p className={styles.saleTagSub}>Up to 50% Off Basics</p>
              </div>
            </div>
            <div className={styles.heroDots} aria-label="Hero image slides">
              {heroSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className={`${styles.heroDot} ${index === activeHeroSlide ? styles.heroDotActive : ""}`}
                  onClick={() => setActiveHeroSlide(index)}
                  aria-label={`Show ${slide.name}`}
                  aria-current={index === activeHeroSlide ? "true" : undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <LatestStylesSection />

      <section className={styles.collectionBanner} aria-label="FORMA collection campaign">
        <div className={styles.collectionBannerImage}>
          {activeHeroProduct && (
            <img
              key={`collection-${activeHeroProduct.id}`}
              src={activeHeroProduct.imageUrl}
              alt={activeHeroProduct.name}
            />
          )}
        </div>
        <h2 className={styles.collectionBannerTitle}>FORMA</h2>
        <Link href="/shop" className={styles.collectionBannerCta}>
          <span>Shop now</span>
          <span aria-hidden="true">•</span>
        </Link>
      </section>

      <LatestStylesSection
        title="BEST SELLERS"
        items={bestSellerItems}
        loadItems={loadBestSellerItems}
      />

      <LatestStylesSection
        title="UPTO 50% OFF"
        items={saleItems}
        loadItems={loadSaleItems}
        variant="sale"
      />

      {/* ── BRAND PROMISE & SOCIAL PROOF ───────────────────── */}
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          <div className={styles.reviewsHeader}>
            <h3 className={styles.reviewsTitle}>Loved by Real Everyday Shoppers</h3>
            <p className={styles.reviewsSub}>
              Over 40,000 verified buyers trust FORMA for comfortable everyday essentials.
            </p>
          </div>

          <div className={styles.reviewsGrid}>
            <div className={styles.reviewCard}>
              <div className={styles.reviewStars}>★★★★★</div>
              <p className={styles.reviewQuote}>
                &ldquo;Finally, everyday t-shirts that don&apos;t shrink or lose shape after 10 washes! The fabric is soft, breathable, and fits true to size.&rdquo;
              </p>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewerName}>Sarah T.</span>
                <span className={styles.reviewerVerified}>Verified Buyer &bull; Dallas, TX</span>
              </div>
            </div>

            <div className={styles.reviewCard}>
              <div className={styles.reviewStars}>★★★★★</div>
              <p className={styles.reviewQuote}>
                &ldquo;The stretch jeans and fleece hoodies are insanely comfortable. Fast 2-day delivery and returning the wrong size was completely effortless.&rdquo;
              </p>
              <div className={styles.reviewerInfo}>
                <span className={styles.reviewerName}>Marcus L.</span>
                <span className={styles.reviewerVerified}>Verified Buyer &bull; Chicago, IL</span>
              </div>
            </div>

            <div className={styles.reviewCard}>
              <div className={styles.reviewStars}>★★★★★</div>
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