import Link from "next/link";
import styles from "./page.module.css";
import { products } from "./lib/products";

const categories = [
  {
    name: "Women",
    ref: "No. 01",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Men",
    ref: "No. 02",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Kids",
    ref: "No. 03",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accessories",
    ref: "No. 04",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
  },
];

const bestSellers = products.slice(0, 4);

const specSheet = [
  {
    n: "01",
    title: "Premium quality",
    text: "Thoughtful fabrics, clean silhouettes, durable construction for everyday wear.",
  },
  {
    n: "02",
    title: "Smooth checkout",
    text: "Quick cart updates, secure payments, and clear delivery tracking end to end.",
  },
  {
    n: "03",
    title: "Loyalty rewards",
    text: "Exclusive drops and member pricing for repeat customers.",
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
    <main>
      <div className={styles.wrap}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>Season 04 &mdash; Now shipping</p>
            <h1 className={styles.heroTitle}>
              Cut for how
              <br />
              <em>you actually live.</em>
            </h1>
            <p className={styles.heroText}>
              Forma builds everyday fashion for men, women, and kids: honest
              fabrics, considered fit, and a checkout that gets out of your
              way.
            </p>
            <div className={styles.heroActions}>
              <Link href="/shop" className={styles.primaryBtn}>
                Shop the collection
              </Link>
              <Link href="/shop?category=Women" className={styles.secondaryBtn}>
                New arrivals
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

          <div className={`${styles.heroImageFrame} registration`}>
            <img
              src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
              alt="Forma seasonal look"
              className={styles.heroImage}
            />
            <div className={styles.swingTag}>
              <p className={styles.swingTagLabel}>This week</p>
              <p className={styles.swingTagValue}>Up to 50% off</p>
              <p className={styles.swingTagText}>Select styles, while stock lasts</p>
            </div>
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* Collections */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Shop by category</p>
              <h2 className={styles.sectionTitle}>Trending collections</h2>
            </div>
            <Link href="/shop" className={styles.viewAll}>
              View all &rarr;
            </Link>
          </div>

          <div className={styles.categoryGrid}>
            {categories.map((category) => (
              <Link
                key={category.name}
                href={`/shop?category=${category.name}`}
                className={styles.categoryCard}
              >
                <div className={styles.categoryImageWrap}>
                  <img
                    src={category.image}
                    alt={category.name}
                    className={styles.categoryImage}
                  />
                </div>
                <div className={styles.categoryBody}>
                  <span className={styles.categoryRef}>{category.ref}</span>
                  <h3 className={styles.categoryName}>{category.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* Best sellers */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Best sellers</p>
              <h2 className={styles.sectionTitle}>Fresh fits for every day</h2>
            </div>
            <Link href="/shop" className={styles.viewAll}>
              View more &rarr;
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
                  {product.tag && (
                    <span className={styles.productTag}>{product.tag}</span>
                  )}
                </div>
                <div className={styles.productBody}>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <span className={styles.productPrice}>${product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* Value props + reviews */}
      <div className={styles.wrap}>
        <section className={styles.valueSection}>
          <div className={styles.specSheet}>
            <p className={styles.eyebrow}>Why shoppers choose us</p>
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
            <p className={styles.eyebrow}>Fine print</p>
            <div className={styles.perkList}>
              <div className={styles.perk}>
                <span>Free shipping</span>
                <strong>On orders $75+</strong>
              </div>
              <div className={styles.perk}>
                <span>Easy returns</span>
                <strong>Within 30 days</strong>
              </div>
              <div className={styles.perk}>
                <span>Secure checkout</span>
                <strong>100% protected</strong>
              </div>
            </div>
            <Link href="/shop" className={styles.primaryBtn}>
              Start shopping
            </Link>
          </div>
        </section>
      </div>

      <div className="seam" />

      {/* Reviews */}
      <div className={styles.wrap}>
        <section className={styles.section}>
          <div className={styles.sectionHeadCenter}>
            <p className={styles.eyebrow}>Customer love</p>
            <h2 className={styles.sectionTitle}>What people are saying</h2>
          </div>

          <div className={styles.reviewGrid}>
            {testimonials.map((item) => (
              <article key={item.name} className={styles.reviewCard}>
                <p className={styles.reviewText}>&ldquo;{item.text}&rdquo;</p>
                <div className={styles.reviewFooter}>
                  <span className={styles.reviewName}>{item.name}</span>
                  <span className={styles.reviewRole}>Verified shopper</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* Newsletter */}
      <div className={styles.wrap}>
        <section className={styles.newsletter}>
          <div>
            <p className={styles.newsletterEyebrow}>Stay in the loop</p>
            <h2 className={styles.newsletterTitle}>
              Get exclusive drops and offers.
            </h2>
          </div>
          <form className={styles.newsletterForm}>
            <input
              type="email"
              placeholder="Enter your email"
              className={styles.newsletterInput}
            />
            <button type="submit" className={styles.primaryBtn}>
              Join now
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
