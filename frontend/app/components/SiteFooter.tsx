"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className={styles.footer}>
      {/* ── VALUE PERKS STRIP ──────────────────────────────── */}
      <div className={styles.perksStrip}>
        <div className={styles.container}>
          <div className={styles.perksGrid}>
            <div className={styles.perkItem}>
              <div className={styles.perkIcon}>📦</div>
              <div>
                <h4 className={styles.perkTitle}>Free Delivery Over LKR 7,500</h4>
                <p className={styles.perkSubtitle}>Fast dispatch within 24 hours</p>
              </div>
            </div>
            <div className={styles.perkItem}>
              <div className={styles.perkIcon}>🔄</div>
              <div>
                <h4 className={styles.perkTitle}>30-Day Easy Returns</h4>
                <p className={styles.perkSubtitle}>Hassle-free return policy</p>
              </div>
            </div>
            <div className={styles.perkItem}>
              <div className={styles.perkIcon}>🛡️</div>
              <div>
                <h4 className={styles.perkTitle}>Everyday Price Match</h4>
                <p className={styles.perkSubtitle}>Guaranteed best value daily</p>
              </div>
            </div>
            <div className={styles.perkItem}>
              <div className={styles.perkIcon}>💬</div>
              <div>
                <h4 className={styles.perkTitle}>Friendly 24/7 Support</h4>
                <p className={styles.perkSubtitle}>Real humans always ready to help</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── NEWSLETTER STRIP (SUBSCRIBE BUTTON NEXT TO INPUT) ─ */}
      <div className={styles.newsletterStrip}>
        <div className={styles.container}>
          <div className={styles.newsletterBox}>
            <div className={styles.newsletterText}>
              <h3 className={styles.newsletterHeading}>Join the FORMA Everyday Club!</h3>
              <p className={styles.newsletterSub}>
                Get <strong>15% OFF</strong> your first order + early access to weekly drop sales and member specials.
              </p>
            </div>

            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
              <div className={styles.inputGroup}>
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={styles.emailInput}
                  required
                  aria-label="Email address for newsletter"
                />
                {/* A "Subscribe" button placed directly next to an email input field */}
                <button type="submit" className={styles.subscribeBtn}>
                  {subscribed ? "Subscribed! 🎉" : "Subscribe"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* ── MAIN FOOTER COLUMNS ────────────────────────────── */}
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            {/* Brand column */}
            <div className={styles.brandCol}>
              <div className={styles.brandBadge}>
                <span className={styles.brandIconF}>F</span>
                <span className={styles.brandNameText}>FORMA Everyday</span>
              </div>
              <p className={styles.brandBio}>
                Practical, comfortable, and energetic clothing designed for real life. Honest fabrics, consistent fits, and everyday affordability for the whole family.
              </p>
              <div className={styles.socialIcons}>
                <span className={styles.socialPill}>Instagram</span>
                <span className={styles.socialPill}>TikTok</span>
                <span className={styles.socialPill}>Facebook</span>
                <span className={styles.socialPill}>YouTube</span>
              </div>
            </div>

            {/* Shop Column */}
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Shop Everyday</h4>
              <ul className={styles.colList}>
                <li><Link href="/shop?category=Men">Men&apos;s Essentials</Link></li>
                <li><Link href="/shop?category=Women">Women&apos;s Daily</Link></li>
                <li><Link href="/shop?category=Kids">Kids &amp; Toddlers</Link></li>
                <li><Link href="/shop?category=Accessories">Accessories &amp; Gear</Link></li>
                <li><Link href="/shop?category=Sale" className={styles.saleColLink}>🔥 Flash Sale Deals</Link></li>
                <li><Link href="/shop">All Catalog</Link></li>
              </ul>
            </div>

            {/* Customer Care */}
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Customer Care</h4>
              <ul className={styles.colList}>
                <li><Link href="/cart">Track My Order</Link></li>
                <li><Link href="/">Shipping &amp; Delivery</Link></li>
                <li><Link href="/">Start a Return</Link></li>
                <li><Link href="/">Fit &amp; Sizing Guide</Link></li>
                <li><Link href="/">Student &amp; Hero Discount</Link></li>
                <li><Link href="/">Help &amp; FAQ</Link></li>
              </ul>
            </div>

            {/* About & Policies */}
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>About Us</h4>
              <ul className={styles.colList}>
                <li><Link href="/">Our Everyday Story</Link></li>
                <li><Link href="/">Sustainable Cotton Sourcing</Link></li>
                <li><Link href="/">Store Locations</Link></li>
                <li><Link href="/">Careers at FORMA</Link></li>
                <li><Link href="/">Privacy Policy &amp; Terms</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={styles.bottomBar}>
            <p className={styles.copyText}>
              &copy; {new Date().getFullYear()} FORMA Everyday Apparel Inc. All rights reserved. Friendly fashion for everyone.
            </p>
            <div className={styles.paymentBadges}>
              <span className={styles.payBadge}>VISA</span>
              <span className={styles.payBadge}>Mastercard</span>
              <span className={styles.payBadge}>Amex</span>
              <span className={styles.payBadge}>Apple Pay</span>
              <span className={styles.payBadge}>PayPal</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
