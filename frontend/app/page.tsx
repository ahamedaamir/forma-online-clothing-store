"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import ProductCard from "./components/ProductCard";
import {
  fetchProducts,
  fetchCategories,
  fetchPromoDeal,
  initialProducts,
  initialCategories,
  initialPromoDeal,
  type ProductItem,
  type CategorySummary,
  type PromoDeal,
} from "./lib/productService";

export default function HomePage() {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [categories, setCategories] = useState<CategorySummary[]>(initialCategories);
  const [promo, setPromo] = useState<PromoDeal | null>(initialPromoDeal);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [loading, setLoading] = useState<boolean>(false);

  // Dynamic API Fetch Simulation (No hardcoded data inside UI components)
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [prodData, catData, promoData] = await Promise.all([
          fetchProducts({ category: selectedCategory }),
          fetchCategories(),
          fetchPromoDeal(),
        ]);
        setProducts(prodData);
        setCategories(catData);
        setPromo(promoData);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCategory]);

  // Dynamic sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "reviews") return b.reviewCount - a.reviewCount;
    return 0; // featured default
  });

  return (
    <main className={styles.main}>
      {/* ── 1. HERO BANNER ─────────────────────────────────── */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <span className={styles.heroKicker}>☀️ SUMMER ESSENTIALS &bull; SEASON SALE</span>
            <h1 className={styles.heroTitle}>
              Everyday Clothes For <span className={styles.coralHighlight}>Real Life.</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Super-comfy cotton tees, durable stretch denim, and easy loungewear built for the whole family.
              Honest prices, consistent fits, and zero guesswork.
            </p>

            {/* Prominent High-Contrast Call-to-Action (CTA) button labeled "Shop the Sale" */}
            <div className={styles.heroCtaGroup}>
              <Link
                href="/shop?category=Sale"
                className={styles.heroPrimaryCta}
              >
                Shop the Sale &rarr;
              </Link>
              <Link
                href="/shop?category=Men"
                className={styles.heroSecondaryCta}
              >
                Men&apos;s
              </Link>
              <Link
                href="/shop?category=Women"
                className={styles.heroSecondaryCta}
              >
                Women&apos;s
              </Link>
              <Link
                href="/shop?category=Kids"
                className={styles.heroSecondaryCta}
              >
                Kids
              </Link>
              <Link
                href="/shop?category=Accessories"
                className={styles.heroSecondaryCta}
              >
                Accessories
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
            <img
              src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85"
              alt="Everyday casual wear collection"
              className={styles.heroImg}
            />
            <div className={styles.heroSaleTag}>
              <span className={styles.saleTagFire}>🔥</span>
              <div>
                <p className={styles.saleTagHead}>Flash Deals Live</p>
                <p className={styles.saleTagSub}>Up to 50% Off Basics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. QUICK CATEGORY SHORTCUTS ────────────────────── */}
      <section className={styles.categoryBarSection}>
        <div className={styles.container}>
          <div className={styles.categoryBubbles}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`${styles.catBubble} ${
                  selectedCategory === cat.slug ? styles.catBubbleActive : ""
                }`}
                onClick={() => setSelectedCategory(cat.slug)}
              >
                <div className={styles.catImgFrame}>
                  <img src={cat.imageUrl} alt={cat.name} className={styles.catImg} />
                </div>
                <div className={styles.catTextInfo}>
                  <span className={styles.catName}>{cat.name}</span>
                  <span className={styles.catCount}>{cat.itemCount}+ items</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. FLASH PROMO STRIP ───────────────────────────── */}
      {promo && (
        <section className={styles.promoBanner}>
          <div className={styles.container}>
            <div className={styles.promoContent}>
              <div className={styles.promoLeft}>
                <span className={styles.promoPill}>LIMITED DEAL</span>
                <span className={styles.promoText}>{promo.headline} &bull; {promo.discountText}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory("Sale")}
                className={styles.promoCtaBtn}
              >
                Shop Deals Now &rarr;
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── 4. DYNAMIC PRODUCT GRID ────────────────────────── */}
      <section className={styles.catalogSection}>
        <div className={styles.container}>
          {/* Section Header with Tabs & Controls */}
          <div className={styles.catalogHeader}>
            <div>
              <h2 className={styles.sectionHeading}>
                {selectedCategory === "All"
                  ? "Everyday Favorites & Best Values"
                  : `${selectedCategory}'s Collection`}
              </h2>
              <p className={styles.sectionSub}>
                Honest staples crafted from breathable combed cottons and flex-stretch blends.
              </p>
            </div>

            {/* Filter Tabs & Sort Selection */}
            <div className={styles.catalogControls}>
              <div className={styles.filterPills}>
                {["All", "Men", "Women", "Kids", "Accessories", "Sale"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.pillBtn} ${
                      selectedCategory === cat ? styles.pillBtnActive : ""
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat === "Sale" ? "🔥 Sale Specials" : cat}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className={styles.sortBox}>
                <label htmlFor="sortSelect" className={styles.sortLabel}>
                  Sort:
                </label>
                <select
                  id="sortSelect"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={styles.sortSelect}
                >
                  <option value="featured">Featured Deals</option>
                  <option value="rating">Top Rated (★)</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="reviews">Most Reviewed</option>
                </select>
              </div>
            </div>
          </div>

          {/* High-Density Responsive Grid */}
          {loading ? (
            <div className={styles.loadingGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className={styles.skeletonCard} />
              ))}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No products found in this category right now.</p>
              <button
                type="button"
                className={styles.resetBtn}
                onClick={() => setSelectedCategory("All")}
              >
                View All Products
              </button>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {sortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 5. BRAND PROMISE & SOCIAL PROOF ────────────────── */}
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