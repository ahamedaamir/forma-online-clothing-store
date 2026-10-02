"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import ShopByCategorySection from "./components/ShopByCategorySection";
import LatestStylesSection from "./components/LatestStylesSection";
import { products as catalogProducts, type Product } from "./lib/products";
import {
  fetchProducts,
  fetchSpringSummerBanner,
  initialProducts,
  initialSpringSummerBanner,
  type ProductItem,
  type SpringSummerBannerData,
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
  const [ssBanner, setSsBanner] = useState<SpringSummerBannerData>(initialSpringSummerBanner);
  const [activeSsSlide, setActiveSsSlide] = useState(0);

  const heroSlides = products.filter((product) => product.imageUrl).slice(0, 4);
  const activeHeroProduct = heroSlides[activeHeroSlide % Math.max(heroSlides.length, 1)];

  // Dynamic API Fetch Simulation (No hardcoded data inside UI components)
  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, bannerData] = await Promise.all([
          fetchProducts({ category: "All" }),
          fetchSpringSummerBanner(),
        ]);
        setProducts(prodData);
        setSsBanner(bannerData);
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
        {/* Decorative background visuals */}
        <div className={styles.heroBgDecor} aria-hidden="true">
          <div className={styles.decOrb1} />
          <div className={styles.decOrb2} />
          <div className={styles.decOrb3} />
          <div className={styles.decLine1} />
          <div className={styles.decLine2} />
          <div className={styles.decDot1} />
          <div className={styles.decDot2} />
          <div className={styles.decDot3} />
          <div className={styles.decCircleOutline1} />
          <div className={styles.decCircleOutline2} />
          <div className={styles.decNoise} />
        </div>

        <div className={styles.heroContainer}>
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
            <Link href="/shop" className={styles.heroPrimaryCta}>
              Shop now
              <span aria-hidden="true">&rarr;</span>
            </Link>
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

      <ShopByCategorySection />

      {/* ── SPRING / SUMMER 2024 BANNER (LIMITED SALE) ─────────────── */}
      <section className={styles.springSummerBanner} aria-label="Spring Summer 2024 Campaign">
        {/* Decorative visuals for the banner section */}
        <div className={styles.ssBgDecor} aria-hidden="true">
          <div className={styles.ssDecOrb1} />
          <div className={styles.ssDecOrb2} />
          <div className={styles.ssDecGrid} />
        </div>
        <div className={styles.springSummerInner}>
          <span className={styles.ssKicker}>{ssBanner.kicker}</span>
          <h2 className={styles.ssTitle}>
            <span className={styles.ssTitleMain}>{ssBanner.title}</span>
            <span className={styles.ssTitleYear}>{ssBanner.year}</span>
          </h2>
          <p className={styles.ssDescription}>{ssBanner.description}</p>

          <div className={styles.ssButtonGroup}>
            <Link href={ssBanner.ctaTops.href} className={styles.ssBtnOutline}>
              {ssBanner.ctaTops.label}
            </Link>
            <Link href={ssBanner.ctaDenim.href} className={styles.ssBtnSolid}>
              {ssBanner.ctaDenim.label}
            </Link>
          </div>

          <div className={styles.ssDots} role="tablist" aria-label="Spring Summer slides">
            {Array.from({ length: ssBanner.totalSlides }).map((_, idx) => (
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