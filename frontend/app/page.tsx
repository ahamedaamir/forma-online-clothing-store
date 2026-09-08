import Link from "next/link";
import styles from "./page.module.css";
import { products, latestStyles } from "./lib/products";
import LatestStylesSection from "./components/LatestStylesSection";
import ProductCardItem from "./components/ProductCardItem";

const bestSellers = products.slice(4, 8);

const specSheet = [
  {
    n: "01",
    title: "Premium Quality",
    text: "Thoughtful fabrics, clean silhouettes, and durable construction for everyday wear that earns its place in your wardrobe.",
  },
  {
    n: "02",
    title: "Seamless Experience",
    text: "Quick cart updates, secure payments, and clear delivery tracking from first click to final drop.",
  },
  {
    n: "03",
    title: "Member Privileges",
    text: "Exclusive seasonal drops, early access, and member pricing for our loyal Forma community.",
  },
];

const testimonials = [
  {
    name: "Aisha M.",
    role: "Verified Buyer · Colombo",
    text: "Forma feels premium from browsing to checkout. The sizing guide and swift delivery made it completely stress-free.",
  },
  {
    name: "Daniel K.",
    role: "Verified Buyer · Kandy",
    text: "The catalog is easy to navigate and the product details are spot-on — clearly built for real shoppers, not just browsers.",
  },
  {
    name: "Rina P.",
    role: "Verified Buyer · Galle",
    text: "Clean design, thoughtful product pages, and the quality exceeded my expectations. Perfect for a growing brand.",
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      {/* ── HERO ──────────────────────────────────────────── */}
      <div className={styles.wrap}>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Season 04 &mdash; Now Shipping</p>
            <h1 className={styles.heroTitle}>
              Cut for how
              <br />
              <span className={styles.textAccent}>you actually live.</span>
            </h1>
            <p className={styles.heroText}>
              Forma builds everyday fashion for men, women, and kids: honest
              fabrics, considered fit, and a checkout that gets out of your way.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.primaryBtn}>
                Shop Collection
              </Link>
              <Link href="/shop?category=Women" className={styles.secondaryBtn}>
                New Arrivals
              </Link>
            </div>

            <dl className={styles.heroStats}>
              <div>
                <dt>Shoppers</dt>
                <dd>45k+</dd>
              </div>
              <div>
                <dt>Rating</dt>
                <dd>4.9/5</dd>
              </div>
              <div>
                <dt>Support</dt>
                <dd>24/7</dd>
              </div>
            </dl>
          </div>

          <div className={`${styles.heroImageFrame} registration`}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=90"
              alt="Forma Season 04 editorial look"
              className={styles.heroImage}
            />
            <div className={styles.swingTag}>
              <p className={styles.swingTagLabel}>Weekly Feature</p>
              <p className={styles.swingTagValue}>Up to 50% Off</p>
              <p className={styles.swingTagText}>Select styles, while stock lasts</p>
            </div>
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* ── LATEST STYLES ─────────────────────────────────── */}
      <div className={styles.wrap}>
        <LatestStylesSection items={latestStyles} />
      </div>

      <div className="seam" />

      {/* ── BEST SELLERS ──────────────────────────────────── */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Best Sellers</p>
              <h2 className={styles.sectionTitle}>Signature Fits</h2>
            </div>
            <Link href="/shop" className={styles.viewAll}>
              View More →
            </Link>
          </div>

          <div className={styles.productGrid}>
            {bestSellers.map((product) => (
              <ProductCardItem key={product.slug} product={product} />
            ))}
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* ── VALUE PROPS ──────────────────────────────────── */}
      <div className={styles.wrap}>
        <section className={styles.valueSection}>
          <div className={styles.specSheet}>
            <p className={styles.eyebrow}>The Standard</p>
            <ol className={styles.specList}>
              {specSheet.map((item) => (
                <li key={item.n} className={styles.specItem}>
                  <span className={styles.specNumber}>{item.n}</span>
                  <div>
                    <h3 className={styles.specTitle}>{item.title}</h3>
                    <p className={styles.specText}>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.perkPanel}>
            <p className={styles.perkEyebrow}>Client Privileges</p>
            <div className={styles.perkList}>
              <div className={styles.perk}>
                <span>Complimentary Shipping</span>
                <strong>On orders over LKR 7,500</strong>
              </div>
              <div className={styles.perk}>
                <span>Seamless Returns</span>
                <strong>Within 30 days</strong>
              </div>
              <div className={styles.perk}>
                <span>Secure Checkout</span>
                <strong>100% Encrypted</strong>
              </div>
            </div>
            <Link href="/shop" className={styles.invertedBtn}>
              Begin Shopping
            </Link>
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* ── DESIGN SYSTEM & PRESENTATION BOARD FEATURE ───────── */}
      <div className={styles.wrap}>
        <section className={styles.designSystemBanner}>
          <div className={styles.designBannerCopy}>
            <div className={styles.designBadgeRow}>
              <span className={styles.designBadgeGold}>Behance Winner</span>
              <span className={styles.designBadgeOutline}>Figma High-Fidelity UI Kit</span>
              <span className={styles.designBadgeOutline}>8K Resolution Spec</span>
            </div>
            <h2 className={styles.designBannerTitle}>
              Minimalist Luxury UI/UX Presentation Board.
            </h2>
            <p className={styles.designBannerText}>
              Explore the complete design system behind FORMA: curated neutral color palettes,
              architectural typography hierarchy, atomic UI kit elements, and responsive desktop
              and mobile app device screens.
            </p>
            <Link href="/design-system" className={styles.designBannerLink}>
              View Design System Board →
            </Link>
          </div>

          <div className={styles.designBannerVisual}>
            <div className={styles.visualHeader}>
              <span>Mini Design System</span>
              <span>v4.2 UI Kit</span>
            </div>
            <div className={styles.visualPaletteRow}>
              <div className={styles.visualColorDot} style={{ background: "#FAF8F5", color: "#111" }}>Cream</div>
              <div className={styles.visualColorDot} style={{ background: "#F0EDE8", color: "#111" }}>Sand</div>
              <div className={styles.visualColorDot} style={{ background: "#0D0D0D", color: "#FAF8F5" }}>Noir</div>
              <div className={styles.visualColorDot} style={{ background: "#C5A880", color: "#111" }}>Gold</div>
              <div className={styles.visualColorDot} style={{ background: "#8C7355", color: "#FAF8F5" }}>Bronze</div>
            </div>
            <div className={styles.visualTypeSample}>
              Aa · Cormorant Garamond & Inter
            </div>
            <div className={styles.visualTagsRow}>
              <span className={styles.visualTagChip}>Desktop 1440px Viewport</span>
              <span className={styles.visualTagChip}>Mobile iOS App</span>
              <span className={styles.visualTagChip}>Crisp Cart Flow</span>
            </div>
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHeadCenter}>
            <p className={styles.eyebrow}>Testimonials</p>
            <h2 className={styles.sectionTitle}>Client Experiences</h2>
          </div>

          <div className={styles.reviewGrid}>
            {testimonials.map((item) => (
              <article key={item.name} className={styles.reviewCard}>
                <div>
                  <p className={styles.reviewStars}>★★★★★</p>
                  <p className={styles.reviewText}>"{item.text}"</p>
                </div>
                <div className={styles.reviewFooter}>
                  <span className={styles.reviewName}>{item.name}</span>
                  <span className={styles.reviewRole}>{item.role}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* ── NEWSLETTER ───────────────────────────────────── */}
      <div className={styles.wrap}>
        <section className={styles.newsletter}>
          <div className={styles.newsletterCopy}>
            <p className={styles.eyebrow} style={{ color: "var(--gold-light)" }}>
              Newsletter
            </p>
            <h2 className={styles.newsletterTitle}>
              Unlock exclusive access.
            </h2>
          </div>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.newsletterInput}
              required
            />
            <button type="submit" className={styles.primaryBtn}>
              Subscribe
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}