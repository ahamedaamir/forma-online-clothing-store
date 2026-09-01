import Link from "next/link";
import styles from "./page.module.css";
import { products, latestStyles } from "./lib/products";
import LatestStylesSection from "./components/LatestStylesSection";

const bestSellers = products.slice(4, 8);

const specSheet = [
  {
    n: "01",
    title: "Premium Quality",
    text: "Thoughtful fabrics, clean silhouettes, and durable construction for everyday wear.",
  },
  {
    n: "02",
    title: "Seamless Experience",
    text: "Quick cart updates, secure payments, and clear delivery tracking end to end.",
  },
  {
    n: "03",
    title: "Member Privileges",
    text: "Exclusive drops and member pricing for our loyal customer base.",
  },
];

const testimonials = [
  {
    name: "Aisha M.",
    text: "Forma feels premium from browsing to checkout. The sizing guide and quick delivery made it stress-free.",
  },
  {
    name: "Daniel K.",
    text: "The catalog is easy to filter and the product details are clear — built for real shoppers.",
  },
  {
    name: "Rina P.",
    text: "Clean design, careful product pages. Perfect for a growing clothing brand.",
  },
];

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.wrap}>
        {/* Hero */}
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
              fabrics, considered fit, and a checkout that gets out of your
              way.
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
                <dd>4.9 / 5</dd>
              </div>
              <div>
                <dt>Support</dt>
                <dd>24 / 7</dd>
              </div>
            </dl>
          </div>

          <div className={styles.heroImageFrame}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Forma seasonal look"
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

      {/* Shop The Latest Styles (Interactive Categories/Styles Section) */}
      <div className={styles.wrap}>
        <LatestStylesSection items={latestStyles} />
      </div>

      {/* Best sellers */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Best Sellers</p>
              <h2 className={styles.sectionTitle}>Signature Fits</h2>
            </div>
            <Link href="/shop" className={styles.viewAll}>
              View More
            </Link>
          </div>

          <div className={styles.productGrid}>
            {bestSellers.map((product) => (
              <Link
                key={product.slug}
                href={`/product/${product.slug}`}
                className={styles.productCard}
              >
                <div className={styles.productImageWrap}>
                  <img
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                  />
                  {product.hoverImage && (
                    <img
                      src={product.hoverImage}
                      alt={`${product.name} preview`}
                      className={styles.productHoverImage}
                    />
                  )}
                  {product.tag && (
                    <span className={styles.productTag}>{product.tag}</span>
                  )}
                </div>
                <div className={styles.productBody}>
                  <div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <p className={styles.productCategory}>{product.category}</p>
                  </div>
                  <span className={styles.productPrice}>${product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Value props + reviews */}
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
                <strong>On orders over $75</strong>
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

      {/* Reviews */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHeadCenter}>
            <p className={styles.eyebrow}>Testimonials</p>
            <h2 className={styles.sectionTitle}>Client Experiences</h2>
          </div>

          <div className={styles.reviewGrid}>
            {testimonials.map((item) => (
              <article key={item.name} className={styles.reviewCard}>
                <p className={styles.reviewText}>"{item.text}"</p>
                <div className={styles.reviewFooter}>
                  <span className={styles.reviewName}>{item.name}</span>
                  <span className={styles.reviewRole}>Verified Buyer</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Newsletter */}
      <div className={styles.wrap}>
        <section className={styles.newsletter}>
          <div className={styles.newsletterCopy}>
            <p className={styles.eyebrow}>Newsletter</p>
            <h2 className={styles.newsletterTitle}>
              Unlock exclusive access.
            </h2>
          </div>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Email Address"
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