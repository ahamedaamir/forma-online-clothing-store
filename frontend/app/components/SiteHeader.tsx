"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount] = useState(3); // Simulating active cart items
  const isHome = pathname === "/";

  return (
    <>
      {/* ── TOP PROMO TICKER ───────────────────────────────── */}
      <div className={`${styles.topPromo} ${isHome ? styles.homeOnlyHidden : ""}`}>
        <div className={styles.topPromoInner}>
          <span>⚡ <strong>FLASH SALE:</strong> Extra 20% off all daily basics with code <u>EVERYDAY20</u></span>
          <span className={styles.promoDivider}>•</span>
          <span>Free delivery island-wide on orders over LKR 7,500</span>
          <span className={styles.promoDivider}>•</span>
          <span>30-Day Easy Returns</span>
        </div>
      </div>

      {/* ── MAIN NAVBAR ────────────────────────────────────── */}
      <header className={`${styles.navbar} ${isHome ? styles.homeNavbar : ""}`}>
        <div className={styles.container}>
          {/* Mobile hamburger */}
          <button
            type="button"
            className={styles.hamburgerBtn}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`${styles.bar} ${mobileMenuOpen ? styles.barOpen1 : ""}`} />
            <span className={`${styles.bar} ${mobileMenuOpen ? styles.barOpen2 : ""}`} />
            <span className={`${styles.bar} ${mobileMenuOpen ? styles.barOpen3 : ""}`} />
          </button>

          {/* Brand Logo */}
          <Link href="/" className={styles.brandLogo}>
            <div className={styles.brandNames}>
              <span className={styles.brandTitle}>FORMA</span>
            </div>
          </Link>

          {/* Primary Nav Text Buttons: Men, Women, Kids, Accessories, Highlighted Sale */}
          <nav className={styles.navMenu} aria-label="Main navigation">
            <Link href="/shop" className={styles.navBtn}>
              New Arrivals
            </Link>
            <Link href="/shop?category=Women" className={styles.navBtn}>
              Women⌄
            </Link>
            <Link href="/shop?category=Men" className={styles.navBtn}>
              Men⌄
            </Link>
            <Link href="/shop?category=Accessories" className={styles.navBtn}>
              Accessories
            </Link>
            <Link href="/shop" className={styles.navBtn}>
              Brands⌄
            </Link>
            <Link href="/shop" className={styles.navBtn}>
              Track Order
            </Link>
          </nav>

          {/* Right Action Icons: Search, User Profile, Cart with Red Pill */}
          <div className={styles.actionGroup}>
            {/* Search Button / Input */}
            <div className={styles.searchContainer}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setSearchOpen((prev) => !prev)}
                aria-label="Search clothing catalog"
              >
                <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              {searchOpen && (
                <div className={styles.searchDropdown}>
                  <input
                    type="search"
                    placeholder="Search tees, jeans, hoodies..."
                    className={styles.searchInput}
                    autoFocus
                  />
                </div>
              )}
            </div>

            {/* User Profile Button */}
            <Link href="/account" className={styles.iconBtn} aria-label="User Profile">
              <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart Button with Red Notification Pill */}
            <Link href="/cart" className={styles.cartBtn} aria-label={`Shopping Cart with ${cartCount} items`}>
              <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Red Notification Pill */}
              <span className={styles.redNotificationPill}>{cartCount}</span>
            </Link>
          </div>
        </div>

        {/* ── MOBILE NAV DRAWER ────────────────────────────── */}
        {mobileMenuOpen && (
          <div className={styles.mobileDrawer}>
            <div className={styles.mobileLinks}>
              <Link href="/shop?category=Men" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Men&apos;s Clothing
              </Link>
              <Link href="/shop?category=Women" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Women&apos;s Daily
              </Link>
              <Link href="/shop?category=Kids" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Kids &amp; Teens
              </Link>
              <Link href="/shop?category=Accessories" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Accessories &amp; Gear
              </Link>
              <Link href="/shop" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                All Catalog
              </Link>
              <Link href="/shop?category=Sale" className={styles.mobileSaleLink} onClick={() => setMobileMenuOpen(false)}>
                🔥 Sale &amp; Clearance (Up to 50% Off)
              </Link>
              <hr className={styles.mobileDivider} />
              <Link href="/account" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                My Account
              </Link>
              <Link href="/cart" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Shopping Cart ({cartCount})
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
