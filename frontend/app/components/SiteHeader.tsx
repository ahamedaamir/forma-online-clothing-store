import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.wrap}>
        <Link href="/" className={styles.brand}>
          <span className={styles.brandMark}>F</span>
          <span className={styles.brandName}>Forma</span>
        </Link>

        <nav className={styles.navLinks}>
          <Link href="/">Home</Link>
          <Link href="/shop">Shop</Link>
          <Link href="/shop?category=Women">Women</Link>
          <Link href="/shop?category=Men">Men</Link>
          <Link href="/shop?category=Kids">Kids</Link>
        </nav>

        <div className={styles.navActions}>
          <Link href="/account" className={styles.accountLink}>
            Account
          </Link>
          <Link href="/cart" className={styles.cartLink}>
            Bag
            <span className={styles.cartCount}>2</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
