"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent as ReactKeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "./SiteHeader.module.css";
import { products } from "../lib/products";
import { getStaggerDelay } from "../lib/motion";
import { cartAddedEventName, type CartAddedDetail } from "../lib/motionEvents";
import { useReducedMotion } from "./Motion";
import {
  getCartLines,
  removeCartItem,
  subscribeToCart,
  updateCartItem,
  type CartLine,
} from "../lib/cart";

type DropdownKey = "women" | "men" | "brands";
type CartFlight = {
  id: number;
  image: string;
  startX: number;
  startY: number;
  middleX: number;
  middleY: number;
  endX: number;
  endY: number;
};
type CartFlightStyle = CSSProperties & Record<`--flight-${string}`, string>;

const dropdownContent: Record<DropdownKey, {
  featured: string;
  featuredHref: string;
  category: string;
  categoryHref: string;
  viewAll: string;
}> = {
  women: {
    featured: "Women's Clothing",
    featuredHref: "/shop?category=Women",
    category: "Women's Daily",
    categoryHref: "/shop?category=Women",
    viewAll: "View All Women's →",
  },
  men: {
    featured: "Men's Clothing",
    featuredHref: "/shop?category=Men",
    category: "Men",
    categoryHref: "/shop?category=Men",
    viewAll: "View All Men's →",
  },
  brands: {
    featured: "All Catalog",
    featuredHref: "/shop",
    category: "Brands",
    categoryHref: "/shop",
    viewAll: "View All Brands →",
  },
};

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [cartLines, setCartLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState<{ id: number; name: string } | null>(null);
  const [cartFlight, setCartFlight] = useState<CartFlight | null>(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<DropdownKey | null>(null);
  const [mobileAccordionOpen, setMobileAccordionOpen] = useState<DropdownKey | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const closeDropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartFlightTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartPulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cartEventId = useRef(0);
  const reducedMotion = useReducedMotion();
  const isHome = pathname === "/";
  const navState = !isHome || isScrolled ? "light" : "dark";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const searchResults = (normalizedSearchQuery
    ? products.filter((product) =>
        [product.name, product.category, product.slug, product.description]
          .some((value) => value.toLowerCase().includes(normalizedSearchQuery))
      )
    : products.slice(0, 4)
  ).slice(0, 6);
  const cartItems = cartLines.flatMap((line) => {
    const product = products.find((item) => item.slug === line.slug);
    if (!product) return [];
    const colorway = product.colorways?.find(
      (variant) => variant.colorName === line.color
    );
    return [{
      ...line,
      product,
      image: colorway?.primaryImage ?? product.image,
    }];
  });
  const cartCount = cartItems.reduce((count, line) => count + line.qty, 0);
  const cartSubtotal = cartItems.reduce(
    (sum, line) => sum + line.product.price * line.qty,
    0
  );

  useEffect(() => {
    const syncCart = () => setCartLines(getCartLines());
    const refreshFrame = window.requestAnimationFrame(syncCart);
    const unsubscribe = subscribeToCart(syncCart);
    return () => {
      window.cancelAnimationFrame(refreshFrame);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleCartAdded = (event: Event) => {
      const { name, image, source } = (event as CustomEvent<CartAddedDetail>).detail;
      const id = ++cartEventId.current;
      setCartToast({ id, name });
      setCartPulse(true);
      if (cartToastTimer.current) clearTimeout(cartToastTimer.current);
      if (cartPulseTimer.current) clearTimeout(cartPulseTimer.current);
      cartToastTimer.current = setTimeout(() => setCartToast(null), 3000);
      cartPulseTimer.current = setTimeout(() => setCartPulse(false), 520);

      const target = cartButtonRef.current?.getBoundingClientRect();
      if (!target || reducedMotion) return;
      const startX = source.left + source.width / 2 - 21;
      const startY = source.top + source.height / 2 - 27;
      const endX = target.left + target.width / 2 - 21;
      const endY = target.top + target.height / 2 - 27;
      setCartFlight({
        id,
        image,
        startX,
        startY,
        middleX: (startX + endX) / 2,
        middleY: (startY + endY) / 2 - 72,
        endX,
        endY,
      });
      if (cartFlightTimer.current) clearTimeout(cartFlightTimer.current);
      cartFlightTimer.current = setTimeout(() => setCartFlight(null), 640);
    };
    window.addEventListener(cartAddedEventName, handleCartAdded);
    return () => {
      window.removeEventListener(cartAddedEventName, handleCartAdded);
      if (cartToastTimer.current) clearTimeout(cartToastTimer.current);
      if (cartFlightTimer.current) clearTimeout(cartFlightTimer.current);
      if (cartPulseTimer.current) clearTimeout(cartPulseTimer.current);
    };
  }, [reducedMotion]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 24);
      if (isHome && headerRef.current) {
        headerRef.current.style.top = `${scrollTop + 16}px`;
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) {
        setActiveDropdown(null);
        setSearchOpen(false);
      }
    };
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (searchOpen) {
        setSearchOpen(false);
        return;
      }
      if (!activeDropdown) return;
      const trigger = navRef.current?.querySelector<HTMLElement>(`[data-dropdown-trigger="${activeDropdown}"]`);
      setActiveDropdown(null);
      trigger?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      if (closeDropdownTimer.current) clearTimeout(closeDropdownTimer.current);
    };
  }, [activeDropdown, searchOpen]);

  useEffect(() => {
    if (!activeDropdown) return;
    const positionPanel = () => {
      const group = navRef.current?.querySelector<HTMLElement>(`[data-dropdown-group="${activeDropdown}"]`);
      const trigger = navRef.current?.querySelector<HTMLElement>(`[data-dropdown-trigger="${activeDropdown}"]`);
      const panel = navRef.current?.querySelector<HTMLElement>(`[data-dropdown-panel="${activeDropdown}"]`);
      if (!group || !trigger || !panel) return;
      const width = Math.min(560, window.innerWidth - 32);
      const triggerRect = trigger.getBoundingClientRect();
      const groupRect = group.getBoundingClientRect();
      const center = Math.max(width / 2 + 16, Math.min(triggerRect.left + triggerRect.width / 2, window.innerWidth - width / 2 - 16));
      panel.style.left = `${center - groupRect.left}px`;
    };
    const frame = window.requestAnimationFrame(positionPanel);
    window.addEventListener("resize", positionPanel);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", positionPanel);
    };
  }, [activeDropdown]);

  function openDropdown(name: DropdownKey) {
    if (closeDropdownTimer.current) clearTimeout(closeDropdownTimer.current);
    setActiveDropdown(name);
  }

  function handleDropdownClick(event: React.MouseEvent<HTMLAnchorElement>, name: DropdownKey) {
    event.preventDefault();
    if (activeDropdown === name) {
      setActiveDropdown(null);
    } else {
      openDropdown(name);
    }
  }

  function handleDropdownKeyDown(event: ReactKeyboardEvent<HTMLAnchorElement>, name: DropdownKey) {
    if (event.key !== " " && event.key !== "ArrowDown") return;
    event.preventDefault();
    openDropdown(name);
    window.requestAnimationFrame(() => {
      navRef.current?.querySelector<HTMLElement>(`[data-dropdown-panel="${name}"] [role="menuitem"]`)?.focus();
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!normalizedSearchQuery || searchResults.length === 0) return;
    const selectedProduct = searchResults[activeSearchIndex] || searchResults[0];
    setSearchOpen(false);
    router.push(`/product/${selectedProduct.slug}`);
  }

  function handleSearchKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && searchResults.length > 0) {
      event.preventDefault();
      setActiveSearchIndex((index) => (index + 1) % searchResults.length);
    } else if (event.key === "ArrowUp" && searchResults.length > 0) {
      event.preventDefault();
      setActiveSearchIndex((index) => (index - 1 + searchResults.length) % searchResults.length);
    }
  }

  function renderDropdownPanel(name: DropdownKey) {
    const content = dropdownContent[name];
    return (
      <div
        className={`${styles.dropdownPanel} ${activeDropdown === name ? styles.dropdownPanelOpen : ""} ${navState === "dark" ? styles.glassDropdownDark : styles.glassDropdownLight}`}
        style={{ backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)" }}
        data-dropdown-panel={name}
        role="menu"
        aria-label={`${name} navigation`}
        onMouseEnter={() => {
          if (closeDropdownTimer.current) clearTimeout(closeDropdownTimer.current);
          setActiveDropdown(name);
        }}
        onMouseLeave={() => {
          closeDropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
        }}
      >
        <div className={styles.dropdownColumns}>
          <div className={styles.dropdownColumn}>
            <p className={styles.dropdownLabel}><span aria-hidden="true" />Featured</p>
            <Link href={content.featuredHref} role="menuitem" className={styles.dropdownLink} onClick={() => setActiveDropdown(null)}>{content.featured}</Link>
          </div>
          <div className={styles.dropdownColumn}>
            <p className={styles.dropdownLabel}><span aria-hidden="true" />Categories</p>
            <Link href={content.categoryHref} role="menuitem" className={styles.dropdownLink} onClick={() => setActiveDropdown(null)}>{content.category}</Link>
            <Link href={content.categoryHref} role="menuitem" className={styles.viewAllLink} onClick={() => setActiveDropdown(null)}>{content.viewAll}</Link>
          </div>
        </div>
        <div className={styles.dropdownFooter}>
          <span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6" /></svg>Free delivery over LKR 7,500, island-wide</span>
          <span>FORMA Atelier</span>
        </div>
        <svg className={styles.dropdownWatermark} viewBox="0 0 100 100" aria-hidden="true"><path d="M50 90C20 70 16 43 50 10c34 33 30 60 0 80Zm0-1V20m0 22L33 31m17 24 18-16m-18 31L34 54" /></svg>
      </div>
    );
  }

  return (
    <>
      {/* ── MAIN NAVBAR ────────────────────────────────────── */}
      <header ref={headerRef} className={`${styles.navbar} ${isHome ? styles.homeNavbar : ""} ${isHome && isScrolled ? styles.homeNavbarScrolled : ""}`}>
        <nav
          ref={navRef}
          className={`${styles.container} ${navState === "dark" ? styles.glassDark : styles.glassLight}`}
          aria-label="Primary navigation"
          data-state={navState}
          data-nav-force={isHome ? undefined : "light"}
          style={{ backdropFilter: navState === "dark" ? "blur(28px)" : "blur(26px)", WebkitBackdropFilter: navState === "dark" ? "blur(28px)" : "blur(26px)" }}
        >
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
          <Link href="/" className={styles.brandLogo} onClick={() => setActiveDropdown(null)}>
            <div className={styles.brandNames}>
              <span className={styles.brandTitle}>FORMA</span>
            </div>
            <span className={styles.brandDivider} aria-hidden="true" />
            <svg className={styles.brandLeaf} viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M19.5 4.5C11 4.8 5.5 7.6 5.5 13.3c0 3.3 2.2 5.2 4.8 5.2 5.1 0 7.7-6.2 9.2-14Z" />
              <path d="M3.5 20.5c3.5-5.2 7.5-8.4 13-11" />
            </svg>
          </Link>

          <div className={styles.navMenu} data-state={navState}>
            <Link href="/shop" className={styles.navBtn} onClick={() => setActiveDropdown(null)}>
              New Arrivals
            </Link>
            {(["women", "men"] as const).map((name) => {
              const isWomen = name === "women";
              const label = isWomen ? "Women" : "Men";
              const href = isWomen ? "/shop?category=Women" : "/shop?category=Men";
              const open = activeDropdown === name;
              return (
                <div
                  key={name}
                  className={styles.dropdownGroup}
                  data-dropdown-group={name}
                  onMouseEnter={() => {
                    if (closeDropdownTimer.current) clearTimeout(closeDropdownTimer.current);
                    setActiveDropdown(name);
                  }}
                  onMouseLeave={() => {
                    closeDropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
                  }}
                >
                  <Link
                    href={href}
                    className={`${styles.navBtn} ${styles.dropdownTrigger} ${open ? styles.dropdownTriggerOpen : ""}`}
                    data-dropdown-trigger={name}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={(event) => handleDropdownClick(event, name)}
                    onKeyDown={(event) => handleDropdownKeyDown(event, name)}
                  >
                    {label}<svg className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.5 3.5 3 3.5-3" /></svg>
                  </Link>
                  {activeDropdown === name && renderDropdownPanel(name)}
                </div>
              );
            })}
            <Link href="/shop?category=Accessories" className={styles.navBtn} onClick={() => setActiveDropdown(null)}>
              Accessories
            </Link>
            <div
              className={styles.dropdownGroup}
              data-dropdown-group="brands"
              onMouseEnter={() => {
                if (closeDropdownTimer.current) clearTimeout(closeDropdownTimer.current);
                setActiveDropdown("brands");
              }}
              onMouseLeave={() => {
                closeDropdownTimer.current = setTimeout(() => setActiveDropdown(null), 120);
              }}
            >
              <Link
                href="/shop"
                className={`${styles.navBtn} ${styles.dropdownTrigger} ${activeDropdown === "brands" ? styles.dropdownTriggerOpen : ""}`}
                data-dropdown-trigger="brands"
                aria-haspopup="menu"
                aria-expanded={activeDropdown === "brands"}
                onClick={(event) => handleDropdownClick(event, "brands")}
                onKeyDown={(event) => handleDropdownKeyDown(event, "brands")}
              >
                Brands<svg className={`${styles.chevron} ${activeDropdown === "brands" ? styles.chevronOpen : ""}`} viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.5 3.5 3 3.5-3" /></svg>
              </Link>
              {activeDropdown === "brands" && renderDropdownPanel("brands")}
            </div>
            <Link href="/shop" className={styles.navBtn} onClick={() => setActiveDropdown(null)}>
              Track Order
            </Link>
          </div>

          {/* Right Action Icons: Search, User Profile, Cart with Red Pill */}
          <div className={styles.actionGroup}>
            {/* Search Button / Input */}
            <div className={styles.searchContainer}>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => { setActiveDropdown(null); setSearchOpen((prev) => !prev); }}
                aria-label="Search clothing catalog"
                aria-expanded={searchOpen}
                aria-controls="catalog-search-results"
              >
                <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </button>
              {searchOpen && (
                <div className={styles.searchDropdown} role="dialog" aria-label="Search the catalog">
                  <form className={styles.searchForm} role="search" onSubmit={handleSearchSubmit}>
                    <div className={styles.searchInputRow}>
                      <svg className={styles.searchFieldIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                      <input
                        type="search"
                        placeholder="Search tees, jeans, hoodies..."
                        className={styles.searchInput}
                        value={searchQuery}
                        onChange={(event) => { setSearchQuery(event.target.value); setActiveSearchIndex(0); }}
                        onKeyDown={handleSearchKeyDown}
                        aria-label="Search products"
                        aria-autocomplete="list"
                        aria-controls="catalog-search-results"
                        aria-activedescendant={searchResults[activeSearchIndex] ? `search-option-${searchResults[activeSearchIndex].slug}` : undefined}
                        autoFocus
                      />
                      {searchQuery && <button type="button" className={styles.searchClear} aria-label="Clear search" onClick={() => { setSearchQuery(""); setActiveSearchIndex(0); }}>×</button>}
                    </div>
                  </form>
                  <div className={styles.searchResults} id="catalog-search-results" role="listbox" aria-label="Product results">
                    <p className={styles.searchResultHeading} aria-live="polite">
                      {normalizedSearchQuery ? `${searchResults.length} ${searchResults.length === 1 ? "result" : "results"}` : "Quick picks"}
                    </p>
                    {searchResults.length > 0 ? searchResults.map((product, index) => (
                      <Link
                        key={product.slug}
                        id={`search-option-${product.slug}`}
                        href={`/product/${product.slug}`}
                        role="option"
                        aria-selected={index === activeSearchIndex}
                        className={`${styles.searchResult} ${index === activeSearchIndex ? styles.searchResultActive : ""}`}
                        onMouseEnter={() => setActiveSearchIndex(index)}
                        onClick={() => setSearchOpen(false)}
                      >
                        <Image src={product.image} alt="" width={44} height={54} unoptimized className={styles.searchResultImage} />
                        <span className={styles.searchResultInfo}>
                          <strong>{product.name}</strong>
                          <span>{product.category} · {product.formattedPrice || `LKR ${product.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}</span>
                        </span>
                        <svg className={styles.searchResultArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14m-6-6 6 6-6 6"/></svg>
                      </Link>
                    )) : (
                      <p className={styles.searchEmpty}>No products match “{searchQuery.trim()}”.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Button */}
            <Link href="/account" className={styles.iconBtn} aria-label="User Profile" onClick={() => setActiveDropdown(null)}>
              <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </Link>

            {/* Cart Button with Red Notification Pill */}
            <button
              type="button"
              ref={cartButtonRef}
              className={`${styles.cartBtn} ${cartPulse ? styles.cartBtnPulse : ""}`}
              onClick={() => { setActiveDropdown(null); setCartOpen(true); }}
              aria-label={`Shopping Cart with ${cartCount} items`}
              data-cart-trigger
            >
              <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {/* Red Notification Pill */}
              {cartCount > 0 && <span className={styles.redNotificationPill}>{cartCount}</span>}
            </button>
          </div>
        </nav>

        {/* ── MOBILE NAV DRAWER ────────────────────────────── */}
        {mobileMenuOpen && (
          <div className={`${styles.mobileDrawer} ${navState === "dark" ? styles.glassDark : styles.glassLight}`} style={{ backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)" }}>
            <div className={styles.mobileLinks}>
              {(["women", "men", "brands"] as const).map((name) => {
                const labels = { women: "Women", men: "Men", brands: "Brands" };
                const hrefs = { women: "/shop?category=Women", men: "/shop?category=Men", brands: "/shop" };
                const itemLabels = { women: "Women&apos;s Daily", men: "Men&apos;s Clothing", brands: "All Catalog" };
                const open = mobileAccordionOpen === name;
                return (
                  <div className={styles.mobileGroup} key={name}>
                    <button
                      type="button"
                      className={styles.mobileAccordionButton}
                      aria-expanded={open}
                      onClick={() => setMobileAccordionOpen(open ? null : name)}
                    >
                      {labels[name]}<svg className={open ? styles.mobileChevronOpen : ""} viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="m2.5 4.5 3.5 3 3.5-3" /></svg>
                    </button>
                    {open && (
                      <Link href={hrefs[name]} className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                        {itemLabels[name].replace("&apos;", "'")}
                      </Link>
                    )}
                  </div>
                );
              })}
              <Link href="/shop?category=Kids" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Kids &amp; Teens
              </Link>
              <Link href="/shop?category=Accessories" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
                Accessories &amp; Gear
              </Link>
              <Link href="/shop?category=Sale" className={styles.mobileLink} onClick={() => setMobileMenuOpen(false)}>
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

      {cartFlight && (
        <img
          key={cartFlight.id}
          src={cartFlight.image}
          alt=""
          aria-hidden="true"
          className={styles.cartFlyImage}
          style={{
            "--flight-start-x": `${cartFlight.startX}px`,
            "--flight-start-y": `${cartFlight.startY}px`,
            "--flight-middle-x": `${cartFlight.middleX}px`,
            "--flight-middle-y": `${cartFlight.middleY}px`,
            "--flight-end-x": `${cartFlight.endX}px`,
            "--flight-end-y": `${cartFlight.endY}px`,
          } as CartFlightStyle}
        />
      )}

      {cartToast && (
        <div key={cartToast.id} className={styles.cartToast} role="status" aria-live="polite">
          <span className={styles.cartToastCheck} aria-hidden="true">✓</span>
          <span><strong>Added to cart</strong><small>{cartToast.name}</small></span>
          <span className={styles.cartToastProgress} aria-hidden="true" />
        </div>
      )}

      {cartOpen && (
        <div className={styles.cartOverlay} role="presentation" onClick={() => setCartOpen(false)}>
          <aside
            className={styles.cartDrawer}
            role="dialog"
            aria-modal="true"
            aria-label="Your cart"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.cartDrawerHeader}>
              <h2>Your cart</h2>
              <button type="button" className={styles.cartClose} onClick={() => setCartOpen(false)} aria-label="Close cart">
                ×
              </button>
            </div>

            <div className={styles.cartDrawerBody}>
              {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
              ) : (
                  cartItems.map((line, index) => (
                  <div
                    className={styles.drawerItem}
                    key={`${line.slug}-${line.size}-${line.color ?? "default"}`}
                      style={{ "--motion-delay": `${getStaggerDelay(index, "list")}ms` } as CSSProperties}
                  >
                    <Image
                      src={line.image}
                      alt={line.product.name}
                      width={83}
                      height={123}
                      unoptimized
                    />
                    <div className={styles.drawerItemInfo}>
                      <strong>{line.product.name}</strong>
                      <span>
                        {line.color ? `${line.color} / ` : ""}Size {line.size}
                      </span>
                      <div className={styles.drawerItemBottom}>
                        <div className={styles.drawerQty}>
                          <button
                            type="button"
                            aria-label={`Decrease ${line.product.name} quantity`}
                            onClick={() =>
                              updateCartItem(line.slug, line.size, line.color, line.qty - 1)
                            }
                          >
                            −
                          </button>
                          <span className={styles.drawerQtyValue} key={line.qty}>{line.qty}</span>
                          <button
                            type="button"
                            aria-label={`Increase ${line.product.name} quantity`}
                            onClick={() =>
                              updateCartItem(line.slug, line.size, line.color, line.qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                        <strong>
                          LKR {(line.product.price * line.qty).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.drawerRemove}
                      aria-label={`Remove ${line.product.name}`}
                      onClick={() => removeCartItem(line.slug, line.size, line.color)}
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className={styles.cartDrawerFooter}>
              <div className={styles.drawerTotal}>
                <strong>Total</strong>
                <strong className={styles.drawerSubtotal} key={cartSubtotal}>
                  LKR {cartSubtotal.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
              <div className={styles.freeShippingProgress} aria-label={`${Math.min(100, Math.round((cartSubtotal / 7500) * 100))}% toward free delivery`}>
                <div className={styles.freeShippingMeta}>
                  <span>{cartSubtotal >= 7500 ? "Free delivery unlocked" : "Free delivery at LKR 7,500"}</span>
                  <span>{Math.min(100, Math.round((cartSubtotal / 7500) * 100))}%</span>
                </div>
                <div className={styles.freeShippingTrack}><span style={{ transform: `scaleX(${Math.min(1, cartSubtotal / 7500)})` }} /></div>
              </div>
              <p>Taxes and shipping calculated at checkout</p>
              <Link
                href="/checkout"
                className={styles.drawerCheckout}
                onClick={() => setCartOpen(false)}
              >
                <span aria-hidden="true">▢</span> Checkout <span aria-hidden="true">•</span>
              </Link>
              <Link href="/cart" className={styles.viewCartLink} onClick={() => setCartOpen(false)}>
                VIEW CART
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
