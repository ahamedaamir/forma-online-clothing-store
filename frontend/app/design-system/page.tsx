"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./design-system.module.css";

const colorPalette = [
  { name: "Canvas Cream", token: "--cream", hex: "#FAF8F5", role: "Primary Background Canvas", light: true },
  { name: "Sandstone Surface", token: "--cream-deep", hex: "#F0EDE8", role: "Product Cards & Panels", light: true },
  { name: "Luxury Noir", token: "--noir", hex: "#0D0D0D", role: "Primary Text, Footers & Accents", light: false },
  { name: "Silk Gold", token: "--gold", hex: "#C5A880", role: "Editorial Accents & Badges", light: false },
  { name: "Antique Bronze", token: "--bronze", hex: "#8C7355", role: "Sub-accent & Highlights", light: false },
  { name: "Muted Charcoal", token: "--ink-medium", hex: "#4A4A4A", role: "Body Copy & Subtitles", light: false },
  { name: "Border Bone", token: "--line", hex: "#E5E0D8", role: "Hairline Seams & Dividers", light: true },
];

const typographyScale = [
  { level: "Hero Display", font: "Cormorant Garamond", size: "72px / 4.5rem", weight: "300 Light", preview: "Cut for how you actually live." },
  { level: "Editorial Accent", font: "Cormorant Garamond", size: "38px / 2.375rem", weight: "Italic", preview: "Minimalist luxury, considered silhouette." },
  { level: "Section Title", font: "Inter / Sans-Serif", size: "26px / 1.625rem", weight: "600 SemiBold", preview: "SIGNATURE ARCHIVES" },
  { level: "Nav & Micro Label", font: "Inter / Sans-Serif", size: "11px / 0.6875rem", weight: "500 · 0.14em Track", preview: "NEW ARRIVALS · MEN · WOMEN" },
  { level: "Body Editorial", font: "Inter / Sans-Serif", size: "15px / 0.9375rem", weight: "300 · 1.75 Line", preview: "Everyday luxury crafted from premier organic cottons and Japanese selvedge denim." },
];

export default function DesignSystemPage() {
  const [activeTab, setActiveTab] = useState<"all" | "tokens" | "desktop" | "mobile">("all");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [testAdded, setTestAdded] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");

  const copyColor = (hex: string) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className={styles.container}>
      {/* ── HEADER BOARD HERO ────────────────────────────────── */}
      <header className={styles.boardHeader}>
        <div className={styles.boardMeta}>
          <span className={styles.badgeGold}>Behance Winner · 8K High-Fidelity Design</span>
          <span className={styles.badgeDark}>Figma UI Kit v4.2</span>
          <span className={styles.badgeOutline}>E-Commerce Case Study</span>
        </div>
        <h1 className={styles.boardTitle}>FORMA UI/UX DESIGN SYSTEM</h1>
        <p className={styles.boardSubtitle}>
          Complete design presentation board for a modern minimalist luxury fashion store.
          Engineered with an off-white foundation, editorial serif hierarchy, sleek sans-serif
          micro-typography, and crisp transactional interactions across desktop and mobile app screens.
        </p>

        {/* View Switcher Bar */}
        <div className={styles.viewSwitcher}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("all")}
          >
            Full Presentation Board
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "tokens" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("tokens")}
          >
            Design System & UI Kit
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "desktop" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("desktop")}
          >
            Desktop Homepage View
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "mobile" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("mobile")}
          >
            Mobile App View
          </button>
        </div>
      </header>

      {/* ── SECTION 1: MINI DESIGN SYSTEM & UI KIT ───────────── */}
      {(activeTab === "all" || activeTab === "tokens") && (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className={styles.sectionKicker}>Foundation System</span>
              <h2 className={styles.sectionHeading}>Color Palette & Typography Kit</h2>
            </div>
            <p className={styles.sectionNote}>
              Click any swatch to copy its hexadecimal color token directly to clipboard.
            </p>
          </div>

          {/* Color Swatch Matrix */}
          <div className={styles.swatchGrid}>
            {colorPalette.map((color) => (
              <div
                key={color.token}
                className={styles.swatchCard}
                onClick={() => copyColor(color.hex)}
                role="button"
                tabIndex={0}
              >
                <div
                  className={styles.swatchPill}
                  style={{ backgroundColor: color.hex, border: color.light ? "1px solid rgba(0,0,0,0.08)" : "none" }}
                >
                  <span className={color.light ? styles.swatchLightText : styles.swatchDarkText}>
                    {copiedHex === color.hex ? "COPIED ✓" : color.hex}
                  </span>
                </div>
                <div className={styles.swatchInfo}>
                  <p className={styles.swatchName}>{color.name}</p>
                  <p className={styles.swatchToken}>{color.token}</p>
                  <p className={styles.swatchRole}>{color.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Typography Scale */}
          <div className={styles.typographyBox}>
            <div className={styles.subHeadingBox}>
              <h3 className={styles.boxTitle}>Typographic Architecture</h3>
              <span className={styles.boxTag}>Cormorant Garamond + Inter</span>
            </div>
            <div className={styles.typeList}>
              {typographyScale.map((t) => (
                <div key={t.level} className={styles.typeRow}>
                  <div className={styles.typeMeta}>
                    <span className={styles.typeLevel}>{t.level}</span>
                    <span className={styles.typeSpecs}>{t.font} · {t.size} · {t.weight}</span>
                  </div>
                  <div
                    className={styles.typePreview}
                    style={{
                      fontFamily: t.font.includes("Cormorant") ? "var(--font-display, 'Cormorant Garamond', serif)" : "var(--font-geist-sans, 'Inter', sans-serif)",
                      fontStyle: t.weight.includes("Italic") ? "italic" : "normal",
                    }}
                  >
                    {t.preview}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UI Kit Elements Playground */}
          <div className={styles.uiKitGrid}>
            <div className={styles.uiKitCard}>
              <h4 className={styles.uiKitTitle}>Button & Interaction States</h4>
              <p className={styles.uiKitDesc}>High-contrast CTA elements with tactile hover transitions</p>
              <div className={styles.buttonShowcase}>
                <button type="button" className={styles.btnPrimaryDemo}>
                  Shop Collection
                </button>
                <button type="button" className={styles.btnSecondaryDemo}>
                  New Arrivals
                </button>
                <button
                  type="button"
                  className={`${styles.btnAddToCartDemo} ${testAdded ? styles.btnAddedDemo : ""}`}
                  onClick={() => {
                    setTestAdded(true);
                    setTimeout(() => setTestAdded(false), 2000);
                  }}
                >
                  {testAdded ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                      Added to Bag ✓
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                      Add to Cart
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={styles.uiKitCard}>
              <h4 className={styles.uiKitTitle}>Size Selector & Tags</h4>
              <p className={styles.uiKitDesc}>Precision atomic sizing selectors and status pills</p>
              <div className={styles.sizeShowcase}>
                {["XS", "S", "M", "L", "XL"].map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    className={`${styles.sizeBtn} ${selectedSize === sz ? styles.sizeBtnActive : ""}`}
                    onClick={() => setSelectedSize(sz)}
                  >
                    {sz}
                  </button>
                ))}
              </div>
              <div className={styles.badgeRow}>
                <span className={styles.badgeTagDark}>Bestseller</span>
                <span className={styles.badgeTagGold}>New Season</span>
                <span className={styles.badgeTagOutline}>Organic Japanese Cotton</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 2: DESKTOP HOMEPAGE SCREEN SHOWCASE ────── */}
      {(activeTab === "all" || activeTab === "desktop") && (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className={styles.sectionKicker}>Desktop Screen Presentation</span>
              <h2 className={styles.sectionHeading}>Editorial Storefront (1440px Viewport)</h2>
            </div>
            <Link href="/" className={styles.livePreviewLink}>
              View Live Storefront →
            </Link>
          </div>

          {/* Realistic Desktop Mockup Frame */}
          <div className={styles.desktopMockup}>
            {/* Browser chrome header */}
            <div className={styles.browserHeader}>
              <div className={styles.browserControls}>
                <span className={`${styles.browserDot} ${styles.dotRed}`} />
                <span className={`${styles.browserDot} ${styles.dotYellow}`} />
                <span className={`${styles.browserDot} ${styles.dotGreen}`} />
              </div>
              <div className={styles.addressBar}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <span>https://forma-clothing.com/season-04</span>
              </div>
              <div className={styles.browserDummy} />
            </div>

            {/* Desktop Mockup Content */}
            <div className={styles.desktopContent}>
              {/* Mini Announcement bar */}
              <div className={styles.miniBar}>
                Complimentary worldwide shipping on orders over LKR 7,500 — Season 04 Now Live
              </div>

              {/* Mini Nav Bar */}
              <nav className={styles.miniNav}>
                <div className={styles.miniLogo}>FORMA</div>
                <div className={styles.miniNavLinks}>
                  <span className={styles.miniActiveLink}>New Arrivals</span>
                  <span>Men</span>
                  <span>Women</span>
                  <span>Tailored</span>
                  <span>Accessories</span>
                </div>
                <div className={styles.miniNavRight}>
                  <span>Search</span>
                  <span>Bag (2)</span>
                </div>
              </nav>

              {/* Mini Hero Banner */}
              <div className={styles.miniHero}>
                <div className={styles.miniHeroText}>
                  <span className={styles.miniHeroKicker}>SEASON 04 ARCHIVE</span>
                  <h3 className={styles.miniHeroTitle}>Cut for how you actually live.</h3>
                  <p className={styles.miniHeroDesc}>
                    Everyday luxury tailored for timeless movement. Minimal silhouettes,
                    organic textures, and effortless proportion.
                  </p>
                  <div className={styles.miniHeroBtns}>
                    <span className={styles.miniBtnBlack}>Shop Collection</span>
                    <span className={styles.miniBtnOutline}>View Lookbook</span>
                  </div>
                </div>
                <div className={styles.miniHeroMedia}>
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=85"
                    alt="Desktop Hero Lookbook"
                    className={styles.miniHeroImg}
                  />
                  <div className={styles.miniTagOver}>Editorial Feature · 50% Off Selects</div>
                </div>
              </div>

              {/* Mini Product Grid with Crisp Add to Cart */}
              <div className={styles.miniGridSection}>
                <div className={styles.miniGridHead}>
                  <h4>Signature Fits · Season 04</h4>
                  <span>View All 32 Pieces →</span>
                </div>
                <div className={styles.miniGrid}>
                  {[
                    {
                      name: "Heavyweight Box Tee",
                      cat: "Men's Collection",
                      price: "LKR 4,950",
                      img: "https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8490_7c13b2df-fc3f-41c2-a898-42103aac93ae.jpg?v=1787734609",
                    },
                    {
                      name: "Aero Mesh Oversized Tee",
                      cat: "Men's Collection",
                      price: "LKR 5,250",
                      img: "https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8461.jpg?v=1787734730",
                    },
                    {
                      name: "Ribbed Sculpt Crop Tee",
                      cat: "Women's Collection",
                      price: "LKR 4,450",
                      img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=85",
                    },
                    {
                      name: "Selvedge Minimal Overshirt",
                      cat: "Unisex Atelier",
                      price: "LKR 6,950",
                      img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&q=85",
                    },
                  ].map((p, i) => (
                    <div key={i} className={styles.miniProductCard}>
                      <div className={styles.miniCardMedia}>
                        <img src={p.img} alt={p.name} />
                        <span className={styles.miniCardTag}>New Arrival</span>
                      </div>
                      <div className={styles.miniCardMeta}>
                        <div className={styles.miniCardTitle}>{p.name}</div>
                        <div className={styles.miniCardCat}>{p.cat}</div>
                        <div className={styles.miniCardPrice}>{p.price}</div>
                        <div className={styles.miniCardBtn}>+ Add to Cart</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── SECTION 3: MOBILE APP SCREENS SHOWCASE ───────────── */}
      {(activeTab === "all" || activeTab === "mobile") && (
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeaderRow}>
            <div>
              <span className={styles.sectionKicker}>Mobile Experience</span>
              <h2 className={styles.sectionHeading}>Photorealistic Mobile App Screens (iOS)</h2>
            </div>
            <p className={styles.sectionNote}>
              Adaptive gesture-driven layout, micro-interactions, and floating navigation bar.
            </p>
          </div>

          <div className={styles.mobileShowcaseRow}>
            {/* Mobile Screen 1: Home Discovery */}
            <div className={styles.phoneDevice}>
              <div className={styles.phoneDynamicIsland} />
              <div className={styles.phoneStatusBar}>
                <span>9:41</span>
                <div className={styles.phoneStatusIcons}>
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mobile Screen Content */}
              <div className={styles.phoneBody}>
                <div className={styles.phoneHeader}>
                  <span className={styles.phoneLogo}>FORMA</span>
                  <div className={styles.phoneHeaderIcons}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                  </div>
                </div>

                {/* Filter Pills */}
                <div className={styles.phonePills}>
                  <span className={styles.phonePillActive}>New In</span>
                  <span className={styles.phonePill}>Women</span>
                  <span className={styles.phonePill}>Men</span>
                  <span className={styles.phonePill}>Archival</span>
                </div>

                {/* Mobile Hero */}
                <div className={styles.phoneHero}>
                  <img
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=500&q=80"
                    alt="Mobile Hero"
                  />
                  <div className={styles.phoneHeroText}>
                    <span>SEASON 04</span>
                    <h4>Tailored for Life</h4>
                    <p>Shop Now →</p>
                  </div>
                </div>

                {/* Mobile Product Feed */}
                <div className={styles.phoneFeedTitle}>Trending Pieces</div>
                <div className={styles.phoneFeedGrid}>
                  <div className={styles.phoneCard}>
                    <img src="https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8490_7c13b2df-fc3f-41c2-a898-42103aac93ae.jpg?v=1787734609" alt="Box Tee" />
                    <div className={styles.phoneCardInfo}>
                      <span className={styles.phoneCardName}>Box Tee</span>
                      <span className={styles.phoneCardPrice}>LKR 4,950</span>
                      <button type="button" className={styles.phoneAddBtn}>+ Add</button>
                    </div>
                  </div>
                  <div className={styles.phoneCard}>
                    <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80" alt="Sculpt Crop" />
                    <div className={styles.phoneCardInfo}>
                      <span className={styles.phoneCardName}>Sculpt Crop</span>
                      <span className={styles.phoneCardPrice}>LKR 4,450</span>
                      <button type="button" className={styles.phoneAddBtn}>+ Add</button>
                    </div>
                  </div>
                </div>

                {/* Mobile Bottom Tab Bar */}
                <div className={styles.phoneBottomNav}>
                  <div className={styles.phoneTabActive}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Shop</span>
                  </div>
                  <div className={styles.phoneTab}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Saved</span>
                  </div>
                  <div className={styles.phoneTab}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <span>Bag (2)</span>
                  </div>
                  <div className={styles.phoneTab}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Profile</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Screen 2: Product Detail & Bag */}
            <div className={styles.phoneDevice}>
              <div className={styles.phoneDynamicIsland} />
              <div className={styles.phoneStatusBar}>
                <span>9:41</span>
                <div className={styles.phoneStatusIcons}>
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Mobile Screen Content */}
              <div className={styles.phoneBody}>
                <div className={styles.phoneHeader}>
                  <span className={styles.phoneBackIcon}>← Back</span>
                  <span className={styles.phoneBagCount}>Shopping Bag (1)</span>
                </div>

                {/* Mobile Product Spotlight */}
                <div className={styles.phoneDetailMedia}>
                  <img
                    src="https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8490_7c13b2df-fc3f-41c2-a898-42103aac93ae.jpg?v=1787734609"
                    alt="Detail view"
                  />
                  <div className={styles.phoneStockChip}>In Stock · Ready to Ship</div>
                </div>

                <div className={styles.phoneDetailMeta}>
                  <div className={styles.phoneDetailTitle}>Vanguard Oversized Tee</div>
                  <div className={styles.phoneDetailPrice}>LKR 4,950.00</div>
                  <p className={styles.phoneDetailDescription}>
                    260GSM pure combed cotton with seamless collar construction.
                  </p>

                  <div className={styles.phoneDetailSizes}>
                    <span>Select Size</span>
                    <div className={styles.phoneSizeRow}>
                      <span className={styles.phoneSizeChip}>S</span>
                      <span className={`${styles.phoneSizeChip} ${styles.phoneSizeActive}`}>M</span>
                      <span className={styles.phoneSizeChip}>L</span>
                      <span className={styles.phoneSizeChip}>XL</span>
                    </div>
                  </div>

                  <button type="button" className={styles.phonePrimaryAction}>
                    Add to Cart · LKR 4,950
                  </button>
                </div>

                {/* Mobile Bottom Bar */}
                <div className={styles.phoneBottomNav}>
                  <div className={styles.phoneTab}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    <span>Shop</span>
                  </div>
                  <div className={styles.phoneTab}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Saved</span>
                  </div>
                  <div className={styles.phoneTabActive}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                    <span>Bag (1)</span>
                  </div>
                  <div className={styles.phoneTab}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    <span>Profile</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ACTIONS ───────────────────────────────────── */}
      <footer className={styles.boardFooter}>
        <div className={styles.footerInner}>
          <div>
            <h3 className={styles.footerTitle}>Experience the Complete FORMA Experience</h3>
            <p className={styles.footerText}>
              All components, design tokens, and product flows are fully functional and responsive.
            </p>
          </div>
          <div className={styles.footerBtns}>
            <Link href="/" className={styles.footerPrimaryBtn}>
              Back to Storefront
            </Link>
            <Link href="/shop" className={styles.footerSecondaryBtn}>
              Browse Full Catalog
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
