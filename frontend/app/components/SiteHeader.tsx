"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Announcement Bar */}
      <div className={styles.announcementBar}>
        <p className={styles.announcementText}>
          <span className={styles.announcementDot} />
          Free shipping on orders over LKR 7,500 — Season 04 now available
          <span className={styles.announcementDot} />
        </p>
      </div>

      <header className={`${styles.header} ${scrolled ? styles.headerScrolled : ""}`}>
        <div className={styles.wrap}>
          {/* Mobile hamburger */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen1 : ""}`} />
            <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen2 : ""}`} />
            <span className={`${styles.hamburgerLine} ${mobileOpen ? styles.hamburgerOpen3 : ""}`} />
          </button>

          {/* Brand */}
          <Link href="/" className={styles.brand}>
            <span className={styles.brandMark}>
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.brandIcon}>
                <rect width="32" height="32" fill="currentColor"/>
                <text x="16" y="23" textAnchor="middle" fontSize="18" fontWeight="600" fill="var(--cream)" fontFamily="Georgia, serif">F</text>
              </svg>
            </span>
            <span className={styles.brandName}>FORMA</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.navLinks} aria-label="Primary navigation">
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/shop?category=Women" className={styles.navLink}>New Arrivals</Link>
            <Link href="/shop?category=Men" className={styles.navLink}>Men</Link>
            <Link href="/shop?category=Women" className={styles.navLink}>Women</Link>
            <Link href="/shop" className={styles.navLink}>All Collection</Link>
            <Link href="/design-system" className={styles.navLink} title="Design System & Presentation Board">UI System</Link>
          </nav>

          {/* Nav Actions */}
          <div className={styles.navActions}>
            <Link href="/shop?category=Women" className={styles.newArrivalsChip}>
              Season 04
            </Link>
            <Link href="/account" className={styles.iconLink} aria-label="Account">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>
            <Link href="/cart" className={styles.cartLink} aria-label="Shopping bag">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={styles.navIcon}>
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <span className={styles.cartBadge}>2</span>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <nav className={styles.mobileNav}>
              <Link href="/" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Home</Link>
              <Link href="/shop?category=Women" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>New Arrivals</Link>
              <Link href="/shop?category=Men" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Men</Link>
              <Link href="/shop?category=Women" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Women</Link>
              <Link href="/shop" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>All Collections</Link>
              <Link href="/design-system" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Design System & UI Kit</Link>
              <Link href="/account" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Account</Link>
              <Link href="/cart" className={styles.mobileNavLink} onClick={() => setMobileOpen(false)}>Shopping Bag</Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
