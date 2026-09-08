import Link from "next/link";
import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.wrap}>
        {/* Brand block */}
        <div>
          <div className={styles.brand}>
            <span className={styles.brandMark}>F</span>
            <span className={styles.brandName}>FORMA</span>
          </div>
          <p className={styles.tagline}>
            Cut, dyed, and finished for people who wear their clothes for years,
            not seasons. Quality you can feel from the very first wear.
          </p>
          <div className={styles.socialRow}>
            <a href="#" className={styles.socialLink} aria-label="Instagram">IG</a>
            <a href="#" className={styles.socialLink} aria-label="Pinterest">PT</a>
            <a href="#" className={styles.socialLink} aria-label="TikTok">TK</a>
            <a href="#" className={styles.socialLink} aria-label="Facebook">FB</a>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <p className={styles.heading}>Shop</p>
          <ul className={styles.list}>
            <li><Link href="/shop?category=Women">Women</Link></li>
            <li><Link href="/shop?category=Men">Men</Link></li>
            <li><Link href="/shop?category=Kids">Kids</Link></li>
            <li><Link href="/shop?category=Accessories">Accessories</Link></li>
            <li><Link href="/shop">New Arrivals</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <p className={styles.heading}>Support</p>
          <ul className={styles.list}>
            <li>Delivery Info</li>
            <li>Returns & Exchanges</li>
            <li>Size Guide</li>
            <li>Contact Us</li>
            <li>Track Order</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <p className={styles.heading}>Company</p>
          <ul className={styles.list}>
            <li>About Forma</li>
            <li><Link href="/design-system" style={{ color: "var(--gold-light, #dfca9d)" }}>UI/UX Design System</Link></li>
            <li>Sustainability</li>
            <li>Journal</li>
            <li>Careers</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <span>&copy; {new Date().getFullYear()} Forma. All rights reserved.</span>
        <span>Crafted with care — Season 04 Collection</span>
      </div>
    </footer>
  );
}
