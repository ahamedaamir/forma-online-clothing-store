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
      <div className={styles.mainFooter}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Shop By Category</h4>
              <ul className={styles.colList}>
                <li><Link href="/shop">New Arrivals</Link></li>
                <li><Link href="/shop?category=Men">Workwear</Link></li>
                <li><Link href="/shop?category=Women">Dresses</Link></li>
                <li><Link href="/shop?category=Women">Evening Wear</Link></li>
                <li><Link href="/shop?category=Accessories">Accessories</Link></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Information</h4>
              <ul className={styles.colList}>
                <li><Link href="/">Careers</Link></li>
                <li><Link href="/">About Us</Link></li>
                <li><Link href="/">Contact Us</Link></li>
                <li><Link href="/">Angel Club</Link></li>
                <li><Link href="/">Events</Link></li>
                <li><Link href="/">Size Guide</Link></li>
                <li><Link href="/">Blogs</Link></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Term of Use</h4>
              <ul className={styles.colList}>
                <li><Link href="/">Terms &amp; Conditions</Link></li>
                <li><Link href="/">Privacy Policy</Link></li>
                <li><Link href="/">Shipping &amp; Returns</Link></li>
                <li><Link href="/cart">Track Orders</Link></li>
              </ul>
            </div>

            <div className={styles.footerCol}>
              <h4 className={styles.colTitle}>Shop By Brand</h4>
              <ul className={styles.colList}>
                <li><Link href="/shop">FORMA</Link></li>
                <li><Link href="/shop">Scylla Zelus</Link></li>
                <li><Link href="/shop">Redvers Buller</Link></li>
                <li><Link href="/shop">EIGHTY %</Link></li>
                <li><Link href="/shop">Lost Kids</Link></li>
              </ul>
            </div>

            <div className={`${styles.footerCol} ${styles.newsletterColumn}`}>
              <h4 className={styles.colTitle}>Join our Newsletter</h4>
              <p className={styles.newsletterSub}>Be the First to Discover New Collections &amp; Exclusive Offers</p>
              <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
                <div className={styles.inputGroup}>
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.emailInput}
                    required
                    aria-label="Email address for newsletter"
                  />
                  <button type="submit" className={styles.subscribeBtn}>
                    {subscribed ? "SUBSCRIBED" : "SUBSCRIBE"} <span aria-hidden="true">•</span>
                  </button>
                </div>
              </form>
              <div className={styles.socialIcons} aria-label="Social media links">
                <span className={styles.socialPill}>f</span>
                <span className={styles.socialPill}>◎</span>
                <span className={styles.socialPill}>♪</span>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className={styles.bottomBar}>
            <p className={styles.copyText}>
              Copyright&copy; {new Date().getFullYear()} FORMA
            </p>
            <div className={styles.localeControls}>
              <button type="button">EN⌄</button>
              <button type="button">LKR⌄</button>
            </div>
            <div className={styles.paymentBadges}>
              <span className={styles.payBadge}>AMEX</span>
              <span className={styles.payBadge}>Pay</span>
              <span className={styles.payBadge}>D</span>
              <span className={styles.payBadge}>DISC</span>
              <span className={styles.payBadge}>G Pay</span>
              <span className={styles.payBadge}>JCB</span>
              <span className={styles.payBadge}>MC</span>
              <span className={styles.payBadge}>VISA</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
