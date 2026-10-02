"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import styles from "./shop.module.css";
import { type ProductColorway, shopCatalog as initialProducts, type ShopCatalogProduct } from "../lib/products";
import { addCartItem } from "../lib/cart";

const allSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const allGenders = ["Unisex", "Men", "Women"] as const;
const minimumPrice = 3500;
const maximumPrice = 5500;
const pageSize = 8;

const filterColors = [
  { name: "Black", hex: "#18181b" },
  { name: "White", hex: "#ffffff" },
  { name: "Navy", hex: "#1b2d4f" },
  { name: "Maroon", hex: "#681a2c" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Cream", hex: "#fef08a" },
  { name: "Blue", hex: "#1d4ed8" },
  { name: "Purple", hex: "#7e22ce" },
  { name: "Green", hex: "#15803d" },
  { name: "Rose", hex: "#b98282" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "newest", label: "Newest" },
  { value: "top-rated", label: "Top Rated" },
] as const;

function SwatchFill({ colors }: { colors: string[] }) {
  if (colors.length >= 2) {
    return (
      <span
        className={styles.cardSwatchFill}
        style={{
          background: `linear-gradient(135deg, ${colors[0]} 50%, ${colors[1]} 50%)`,
        }}
      />
    );
  }
  return (
    <span
      className={styles.cardSwatchFill}
      style={{ backgroundColor: colors[0] || "#111111" }}
    />
  );
}

function CatalogProductCard({
  item,
  selectedVariantIdx,
  wishlisted,
  added,
  onSelectVariant,
  onToggleWishlist,
  onAddToCart,
}: {
  item: ShopCatalogProduct;
  selectedVariantIdx: number;
  wishlisted: boolean;
  added: boolean;
  onSelectVariant: (slug: string, index: number) => void;
  onToggleWishlist: (slug: string) => void;
  onAddToCart: (item: ShopCatalogProduct, colorway?: ProductColorway) => void;
}) {
  const hasColorways = Boolean(item.colorways && item.colorways.length > 0);
  const activeColorway: ProductColorway | undefined = hasColorways
    ? item.colorways?.[selectedVariantIdx]
    : undefined;

  const primaryImage = activeColorway?.primaryImage || item.image;
  const hoverImage = activeColorway?.hoverImage || item.hoverImage || item.image;
  const colorwayName = activeColorway?.colorName || item.category;

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(item, activeColorway);
  };

  return (
    <article className={styles.productCard}>
      <div className={styles.imageFrame}>
        <Link href={`/product/${item.slug}`} aria-label={`View ${item.name}`}>
          <img
            src={primaryImage}
            alt={`${item.name} in ${colorwayName}`}
            className={styles.primaryImg}
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = `https://placehold.co/900x1200/E8E6E1/666666?text=${encodeURIComponent(item.name)}`;
              event.currentTarget.style.backgroundColor = "#e8e6e1";
            }}
          />
          <img
            src={hoverImage}
            alt={`${item.name} alternate angle`}
            className={styles.hoverImg}
            loading="lazy"
          />
        </Link>
        {item.tag && <span className={styles.productTag}>{item.tag}</span>}
        <button
          type="button"
          onClick={() => onToggleWishlist(item.slug)}
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ""}`}
          aria-label={wishlisted ? `Remove ${item.name} from wishlist` : `Add ${item.name} to wishlist`}
          aria-pressed={wishlisted}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#ffffff" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {hasColorways && item.colorways && (
        <div className={styles.cardSwatches} role="group" aria-label={`${item.name} color options`}>
          {item.colorways.map((colorway, index) => (
            <button
              key={colorway.colorName}
              type="button"
              className={`${styles.cardSwatchBtn} ${index === selectedVariantIdx ? styles.cardSwatchActive : ""}`}
              onClick={() => onSelectVariant(item.slug, index)}
              aria-label={`Select ${colorway.colorName}`}
              title={colorway.colorName}
              aria-pressed={index === selectedVariantIdx}
            >
              <SwatchFill colors={colorway.swatchColors} />
            </button>
          ))}
        </div>
      )}

      <div className={styles.cardInfo}>
        <div className={styles.cardMetaRow}>
          <span className={styles.cardColorway}>{colorwayName}</span>
          <span className={styles.cardRating} aria-label={`Rated ${item.rating.toFixed(1)} out of 5`}>★ {item.rating.toFixed(1)}</span>
        </div>
        <Link href={`/product/${item.slug}`} style={{ textDecoration: "none" }}>
          <h3 className={styles.cardTitle} title={item.name}>{item.name}</h3>
        </Link>
        <p className={styles.cardPrice}>{item.formattedPrice || `LKR ${item.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={item.inStock === false}
          className={`${styles.cardAddToCartBtn} ${added ? styles.cardAddToCartBtnAdded : ""}`}
          aria-label={`Add ${item.name} to cart`}
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              Add to Cart
            </>
          )}
        </button>
      </div>
    </article>
  );
}

export default function ShopClient({
  initialCategory,
}: {
  initialCategory: string;
}) {
  const [catalog] = useState<ShopCatalogProduct[]>(initialProducts);
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>("featured");
  const [minPrice, setMinPrice] = useState(minimumPrice);
  const [maxPrice, setMaxPrice] = useState(maximumPrice);
  const [visibleLimit, setVisibleLimit] = useState(pageSize);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(() => new Set());
  const [selectedVariants, setSelectedVariants] = useState<Record<string, number>>({});
  const [addedProducts, setAddedProducts] = useState<Set<string>>(() => new Set());
  const [cartCount, setCartCount] = useState(0);
  const addedTimers = useRef<Map<string, number>>(new Map());

  // Accordion open/collapse states
  const [openAvailability, setOpenAvailability] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openSize, setOpenSize] = useState(true);
  const [openColor, setOpenColor] = useState(true);
  const [openGender, setOpenGender] = useState(true);

  // Filters
  const [selectedStock, setSelectedStock] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    allGenders.includes(initialCategory as (typeof allGenders)[number])
      ? [initialCategory]
      : []
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    initialCategory === "Accessories" ? "Accessories" : null
  );

  // Live chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatSent, setChatSent] = useState(false);

  // Compute item counts for filters
  const filterCounts = useMemo(() => {
    const counts = {
      inStock: catalog.filter((p) => p.availability === "in-stock").length,
      preOrder: catalog.filter((p) => p.availability === "pre-order").length,
      sizes: {} as Record<string, number>,
      genders: {} as Record<string, number>,
    };

    allSizes.forEach((s) => {
      counts.sizes[s] = catalog.filter((p) => p.sizes?.includes(s)).length;
    });

    allGenders.forEach((g) => {
      counts.genders[g] = catalog.filter((p) => p.gender === g).length;
    });

    return counts;
  }, [catalog]);

  // Filter and sort catalog
  const filtered = useMemo(() => {
    let list = [...catalog];

    list = list.filter((p) => p.price >= minPrice && p.price <= maxPrice);

    if (selectedStock.length > 0) {
      list = list.filter((p) => selectedStock.includes(p.availability));
    }

    if (selectedSizes.length > 0) {
      list = list.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    }

    if (selectedGenders.length > 0) {
      list = list.filter((p) => selectedGenders.includes(p.gender || ""));
    }

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (selectedColor) {
      list = list.filter((p) => p.colorways?.some((cw) =>
        cw.swatchColors.some((color) => color.toLowerCase() === selectedColor.toLowerCase())
      ));
    }

    if (sort === "price-low") list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort === "newest") list.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    if (sort === "top-rated") list.sort((a, b) => b.rating - a.rating);

    return list;
  }, [catalog, minPrice, maxPrice, selectedStock, selectedSizes, selectedGenders, selectedCategory, selectedColor, sort]);

  const visibleProducts = filtered.slice(0, visibleLimit);

  function toggleStock(val: string) {
    setSelectedStock((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setVisibleLimit(pageSize);
  }

  function toggleSize(val: string) {
    setSelectedSizes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setVisibleLimit(pageSize);
  }

  function toggleGender(val: string) {
    setSelectedGenders((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
    setVisibleLimit(pageSize);
  }

  function toggleColor(val: string) {
    setSelectedColor((prev) => (prev === val ? null : val));
    setVisibleLimit(pageSize);
  }

  function clearAllFilters() {
    setSelectedStock([]);
    setSelectedSizes([]);
    setSelectedColor(null);
    setSelectedGenders([]);
    setSelectedCategory(null);
    setMinPrice(minimumPrice);
    setMaxPrice(maximumPrice);
    setSort("featured");
    setVisibleLimit(pageSize);
  }

  function addProductToCart(item: ShopCatalogProduct, colorway?: ProductColorway) {
    const wasAdded = addCartItem(item.slug, item.sizes[0] || "One Size", colorway?.colorName);
    if (!wasAdded) return;
    setCartCount((count) => count + 1);
    setAddedProducts((previous) => new Set(previous).add(item.slug));
    const existingTimer = addedTimers.current.get(item.slug);
    if (existingTimer) window.clearTimeout(existingTimer);
    const timer = window.setTimeout(() => {
      setAddedProducts((previous) => {
        const next = new Set(previous);
        next.delete(item.slug);
        return next;
      });
      addedTimers.current.delete(item.slug);
    }, 1500);
    addedTimers.current.set(item.slug, timer);
  }

  function toggleWishlist(slug: string) {
    setWishlisted((previous) => {
      const next = new Set(previous);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  }

  function selectVariant(slug: string, index: number) {
    setSelectedVariants((previous) => ({ ...previous, [slug]: index }));
  }

  const hasActiveFilters =
    selectedStock.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColor !== null ||
    selectedGenders.length > 0 ||
    selectedCategory !== null ||
    minPrice > minimumPrice ||
    maxPrice < maximumPrice;

  // Dynamic header title
  const pageTitle = "SHOP THE EVERYDAY CATALOG";

  return (
    <main className={styles.container}>
      {/* Header section with description */}
      <section className={styles.headerSection}>
        <h1 className={styles.catalogTitle}>{pageTitle}</h1>
        <p className={styles.catalogDescription}>
          Practical, comfortable, and energetic everyday essentials crafted for real life.
          Breathable combed cottons, durable stretch denim, and easy silhouettes at honest,
          unbeatable LKR prices for the entire family.
        </p>
      </section>

      {/* Top Bar: Count & Sort */}
      <div className={styles.topBar}>
        <span className={styles.productCount} aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </span>

        <div className={styles.sortWrapper}>
          <button
            type="button"
            className={styles.mobileFilterTrigger}
            onClick={() => setMobileFilterOpen(true)}
            aria-label="Open product filters"
          >
            Filter
          </button>
          <label htmlFor="catalog-sort" className={styles.sortLabel}>
            Sort by
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) =>
              {
                setSort(e.target.value as (typeof sortOptions)[number]["value"]);
                setVisibleLimit(pageSize);
              }
            }
            className={styles.sortSelect}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mobileFilterOpen && (
        <button
          type="button"
          className={styles.filterDrawerBackdrop}
          onClick={() => setMobileFilterOpen(false)}
          aria-label="Close product filters"
        />
      )}

      {/* Main Layout: Accordion Sidebar + 4-Column Grid */}
      <div className={styles.layout}>
        {/* Accordion Sidebar */}
        <aside
          className={`${styles.sidebar} ${mobileFilterOpen ? styles.sidebarMobileOpen : ""}`}
          aria-label="Catalog filters"
          role={mobileFilterOpen ? "dialog" : undefined}
          aria-modal={mobileFilterOpen ? true : undefined}
        >
          <div className={styles.mobileFilterHeader}>
            <span>Filter By</span>
            <button type="button" onClick={() => setMobileFilterOpen(false)} aria-label="Close filters">
              ×
            </button>
          </div>
          {/* 1. AVAILABILITY */}
          <div className={`${styles.accordionGroup} ${openAvailability ? styles.accordionOpen : ""}`}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => setOpenAvailability((v) => !v)}
              aria-expanded={openAvailability}
            >
              <span className={styles.accordionTitle}>Availability</span>
              <svg
                className={styles.accordionChevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            {openAvailability && (
              <div className={styles.accordionContent}>
                <label className={styles.checkboxLabel}>
                  <div className={styles.checkboxLeft}>
                    <input
                      type="checkbox"
                      checked={selectedStock.includes("in-stock")}
                      onChange={() => toggleStock("in-stock")}
                      className={styles.checkboxInput}
                    />
                    <span>In Stock</span>
                  </div>
                  <span className={styles.itemCount}>({filterCounts.inStock})</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <div className={styles.checkboxLeft}>
                    <input
                      type="checkbox"
                      checked={selectedStock.includes("pre-order")}
                      onChange={() => toggleStock("pre-order")}
                      className={styles.checkboxInput}
                    />
                    <span>Pre-Order</span>
                  </div>
                  <span className={styles.itemCount}>({filterCounts.preOrder})</span>
                </label>
              </div>
            )}
          </div>

          {/* 2. PRICE */}
          <div className={`${styles.accordionGroup} ${openPrice ? styles.accordionOpen : ""}`}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => setOpenPrice((v) => !v)}
              aria-expanded={openPrice}
            >
              <span className={styles.accordionTitle}>Price</span>
              <svg
                className={styles.accordionChevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            {openPrice && (
              <div className={styles.accordionContent}>
                <div className={styles.priceValues}>
                  <span>LKR {minPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  <span>LKR {maxPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className={styles.dualRange}>
                  <input type="range" min={minimumPrice} max={maximumPrice} step={50} value={minPrice} aria-label="Minimum price" onChange={(event) => { setMinPrice(Math.min(Number(event.target.value), maxPrice)); setVisibleLimit(pageSize); }} />
                  <input type="range" min={minimumPrice} max={maximumPrice} step={50} value={maxPrice} aria-label="Maximum price" onChange={(event) => { setMaxPrice(Math.max(Number(event.target.value), minPrice)); setVisibleLimit(pageSize); }} />
                </div>
                <div className={styles.priceQuickFilters}>
                  <button type="button" className={styles.priceQuickChip} onClick={() => { setMinPrice(minimumPrice); setMaxPrice(maxPrice === 4000 && minPrice === minimumPrice ? maximumPrice : 4000); setVisibleLimit(pageSize); }}>Under 4,000</button>
                  <button type="button" className={styles.priceQuickChip} onClick={() => { const active = minPrice === 4000 && maxPrice === 5000; setMinPrice(active ? minimumPrice : 4000); setMaxPrice(active ? maximumPrice : 5000); setVisibleLimit(pageSize); }}>4,000 - 5,000</button>
                </div>
              </div>
            )}
          </div>

          {/* 3. SIZE */}
          <div className={`${styles.accordionGroup} ${openSize ? styles.accordionOpen : ""}`}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => setOpenSize((v) => !v)}
              aria-expanded={openSize}
            >
              <span className={styles.accordionTitle}>Size</span>
              <svg
                className={styles.accordionChevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            {openSize && (
              <div className={styles.accordionContent}>
                <div className={styles.sizeToggleGrid}>
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`${styles.sizeToggleButton} ${selectedSizes.includes(size) ? styles.sizeToggleButtonActive : ""}`}
                      aria-pressed={selectedSizes.includes(size)}
                      onClick={() => toggleSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. COLOR */}
          <div className={`${styles.accordionGroup} ${openColor ? styles.accordionOpen : ""}`}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => setOpenColor((v) => !v)}
              aria-expanded={openColor}
            >
              <span className={styles.accordionTitle}>Color</span>
              <svg
                className={styles.accordionChevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            {openColor && (
              <div className={styles.accordionContent}>
                <div className={styles.colorSwatchesGrid}>
                  {filterColors.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      className={`${styles.filterColorBtn} ${
                        selectedColor === c.hex ? styles.filterColorActive : ""
                      }`}
                      onClick={() => toggleColor(c.hex)}
                      title={c.name}
                      aria-label={`Filter by ${c.name}`}
                      aria-pressed={selectedColor === c.hex}
                    >
                      <span
                        className={styles.filterColorFill}
                        style={{ backgroundColor: c.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 5. GENDER */}
          <div className={`${styles.accordionGroup} ${openGender ? styles.accordionOpen : ""}`}>
            <button
              type="button"
              className={styles.accordionHeader}
              onClick={() => setOpenGender((v) => !v)}
              aria-expanded={openGender}
            >
              <span className={styles.accordionTitle}>Gender</span>
              <svg
                className={styles.accordionChevron}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </button>
            {openGender && (
              <div className={styles.accordionContent}>
                {allGenders.map((g) => (
                  <label key={g} className={styles.checkboxLabel}>
                    <div className={styles.checkboxLeft}>
                      <input
                        type="checkbox"
                        checked={selectedGenders.includes(g)}
                        onChange={() => toggleGender(g)}
                        className={styles.checkboxInput}
                      />
                      <span>{g}</span>
                    </div>
                    <span className={styles.itemCount}>
                      ({filterCounts.genders[g] || 0})
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button type="button" className={styles.clearFiltersBtn} onClick={clearAllFilters}>
            Reset All
          </button>
          <button
            type="button"
            className={styles.mobileDrawerView}
            onClick={() => setMobileFilterOpen(false)}
          >
            View {filtered.length} {filtered.length === 1 ? "Product" : "Products"}
          </button>
        </aside>

        {/* 4-Column Product Grid */}
        <section className={styles.productGrid} aria-label="Products">
          {filtered.length === 0 ? (
            <div className={styles.emptyNotice}>
              <p>No products match your filters</p>
              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={clearAllFilters}
              >
                Reset filters
              </button>
            </div>
          ) : (
            visibleProducts.map((product) => (
              <CatalogProductCard
                key={product.slug}
                item={product}
                selectedVariantIdx={selectedVariants[product.slug] ?? 0}
                wishlisted={wishlisted.has(product.slug)}
                added={addedProducts.has(product.slug)}
                onSelectVariant={selectVariant}
                onToggleWishlist={toggleWishlist}
                onAddToCart={addProductToCart}
              />
            ))
          )}
        </section>
      </div>

      {filtered.length > visibleProducts.length && (
        <div className={styles.loadMoreArea}>
          <span className={styles.showingCount}>Showing {visibleProducts.length} of {filtered.length}</span>
          <button
            type="button"
            className={styles.loadMoreButton}
            onClick={() => setVisibleLimit((count) => Math.min(count + 4, filtered.length))}
          >
            Load More
          </button>
        </div>
      )}
      <span className={styles.visuallyHidden} aria-live="polite">{cartCount} items added to cart</span>

      {/* Floating Live Chat Widget */}
      {chatOpen && (
        <div className={styles.chatModal}>
          <div className={styles.chatModalHeader}>
            <h4 className={styles.chatModalTitle}>Forma Concierge</h4>
            <button
              type="button"
              className={styles.chatCloseBtn}
              onClick={() => setChatOpen(false)}
            >
              &times;
            </button>
          </div>
          <div className={styles.chatModalBody}>
            {chatSent ? (
              <p>Thanks for messaging us! Our styling advisor will respond shortly.</p>
            ) : (
              <>
                <p>Welcome to Forma. How may our styling team assist you today?</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatMsg.trim()) setChatSent(true);
                  }}
                  className={styles.chatInputRow}
                >
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    className={styles.chatInput}
                    required
                  />
                  <button type="submit" className={styles.chatSendBtn}>
                    Send
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        className={styles.liveChatBtn}
        onClick={() => {
          setChatOpen((v) => !v);
          setChatSent(false);
        }}
        aria-label="Open live chat"
      >
        <svg
          className={styles.liveChatIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span>Live chat</span>
      </button>
    </main>
  );
}
