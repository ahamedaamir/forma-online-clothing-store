import styles from "./SiteFooter.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className="seam" />
      <div className={styles.wrap}>
        <div>
          <div className={styles.brand}>
            <span className={styles.brandMark}>F</span>
            <span className={styles.brandName}>Forma</span>
          </div>
          <p className={styles.tagline}>
            Cut, dyed, and finished for people who wear their clothes for
            years, not seasons.
          </p>
        </div>

        <div>
          <p className={styles.heading}>Shop</p>
          <ul className={styles.list}>
            <li>Women</li>
            <li>Men</li>
            <li>Kids</li>
            <li>Accessories</li>
          </ul>
        </div>

        <div>
          <p className={styles.heading}>Support</p>
          <ul className={styles.list}>
            <li>Delivery</li>
            <li>Returns</li>
            <li>Size guide</li>
            <li>Contact</li>
          </ul>
        </div>

        <div>
          <p className={styles.heading}>Company</p>
          <ul className={styles.list}>
            <li>About</li>
            <li>Journal</li>
            <li>Careers</li>
            <li>Privacy</li>
          </ul>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>&copy; {new Date().getFullYear()} Forma</span>
        <span>Made for the Week 01 practical</span>
      </div>
    </footer>
  );
}
