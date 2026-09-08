"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./shop.module.css";
import { type Product, type ProductColorway, products as initialProducts } from "../lib/products";
import { getApiProducts } from "../lib/api";

const allSizes = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const allGenders = ["Men", "Women", "Unisex", "Kids", "Accessories"] as const;

const filterColors = [
  { name: "Black", hex: "#18181b" },
  { name: "White", hex: "#ffffff" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Maroon", hex: "#881337" },
  { name: "Grey", hex: "#9ca3af" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Purple", hex: "#7e22ce" },
  { name: "Green", hex: "#15803d" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Yellow", hex: "#eab308" },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "bestselling", label: "Best Selling" },
  { value: "alpha-asc", label: "Alphabetically, A-Z" },
  { value: "alpha-desc", label: "Alphabetically, Z-A" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
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

function CatalogProductCard({ item }: { item: Product }) {
  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number>(0);
  const [added, setAdded] = useState<boolean>(false);
  const [wishlisted, setWishlisted] = useState<boolean>(false);

  const hasColorways = Boolean(item.colorways && item.colorways.length > 0);
  const activeColorway: ProductColorway | undefined = hasColorways
    ? item.colorways?.[selectedVariantIdx]
    : undefined;

  const primaryImage = activeColorway?.primaryImage || item.image;
  const hoverImage = activeColorway?.hoverImage || item.hoverImage || item.image;
  const colorwayName = activeColorway?.colorName || item.category;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted((prev) => !prev);
  };

  return (
    <article className={styles.productCard}>
      <div className={styles.imageFrame}>
        <Link
          href={`/product/${item.slug}`}
          aria-label={`View ${item.name}`}
        >
          <img
            src={primaryImage}
            alt={item.name}
            className={styles.primaryImg}
            loading="lazy"
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
          onClick={handleToggleWishlist}
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlistBtnActive : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill={wishlisted ? "#e52e2e" : "none"} stroke="currentColor" strokeWidth="2">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
        </button>
      </div>

      {hasColorways && item.colorways && item.colorways.length > 0 && (
        <div className={styles.cardSwatches} role="radiogroup" aria-label="Colorways">
          {item.colorways.map((cw, idx) => (
            <button
              key={cw.colorName}
              type="button"
              className={`${styles.cardSwatchBtn} ${
                idx === selectedVariantIdx ? styles.cardSwatchActive : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                setSelectedVariantIdx(idx);
              }}
              onMouseEnter={() => setSelectedVariantIdx(idx)}
              aria-label={cw.colorName}
              title={cw.colorName}
            >
              <SwatchFill colors={cw.swatchColors} />
            </button>
          ))}
        </div>
      )}

      <div className={styles.cardInfo}>
        <div className={styles.cardMetaRow}>
          <span className={styles.cardColorway}>{colorwayName}</span>
          <span className={styles.cardRating}>★ 4.8</span>
        </div>
        <Link href={`/product/${item.slug}`} style={{ textDecoration: "none" }}>
          <h3 className={styles.cardTitle}>{item.name}</h3>
        </Link>
        <p className={styles.cardPrice}>
          LKR {item.price.toLocaleString()}.00
        </p>

        <button
          type="button"
          onClick={handleAddToCart}
          className={`${styles.cardAddToCartBtn} ${added ? styles.cardAddToCartBtnAdded : ""}`}
          aria-label={`Add ${item.name} to cart`}
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Added to Cart!
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
  const [catalog, setCatalog] = useState<Product[]>(initialProducts);
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>("featured");

  // Accordion open/collapse states
  const [openAvailability, setOpenAvailability] = useState(true);
  const [openPrice, setOpenPrice] = useState(true);
  const [openSize, setOpenSize] = useState(true);
  const [openColor, setOpenColor] = useState(true);
  const [openGender, setOpenGender] = useState(true);

  // Filters
  const [selectedStock, setSelectedStock] = useState<string[]>([]); // 'inStock' | 'outOfStock'
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedGenders, setSelectedGenders] = useState<string[]>(
    initialCategory && initialCategory !== "All" ? [initialCategory] : []
  );

  const highestPrice = useMemo(
    () => Math.max(...catalog.map((p) => p.price), 6950),
    [catalog]
  );
  const [maxPrice, setMaxPrice] = useState<number>(highestPrice);

  // Live chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsg, setChatMsg] = useState("");
  const [chatSent, setChatSent] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const data = await getApiProducts();
      if (data && data.length > 0) {
        setCatalog(data);
        setMaxPrice(Math.max(...data.map((p) => p.price), 6950));
      }
    }
    loadProducts();
  }, []);

  // Compute item counts for filters
  const filterCounts = useMemo(() => {
    const counts = {
      inStock: catalog.filter((p) => p.inStock !== false).length,
      outOfStock: catalog.filter((p) => p.inStock === false).length,
      sizes: {} as Record<string, number>,
      genders: {} as Record<string, number>,
    };

    allSizes.forEach((s) => {
      counts.sizes[s] = catalog.filter((p) => p.sizes?.includes(s)).length;
    });

    allGenders.forEach((g) => {
      counts.genders[g] = catalog.filter(
        (p) =>
          p.category.toLowerCase() === g.toLowerCase() ||
          p.gender?.toLowerCase() === g.toLowerCase()
      ).length;
    });

    return counts;
  }, [catalog]);

  // Filter and sort catalog
  const filtered = useMemo(() => {
    let list = [...catalog];

    // Price
    list = list.filter((p) => p.price <= maxPrice);

    // Availability
    if (selectedStock.length > 0) {
      list = list.filter((p) => {
        const inStock = p.inStock !== false;
        if (selectedStock.includes("inStock") && inStock) return true;
        if (selectedStock.includes("outOfStock") && !inStock) return true;
        return false;
      });
    }

    // Sizes
    if (selectedSizes.length > 0) {
      list = list.filter((p) =>
        p.sizes?.some((s) => selectedSizes.includes(s))
      );
    }

    // Gender / Category
    if (selectedGenders.length > 0) {
      list = list.filter(
        (p) =>
          selectedGenders.some((g) => g.toLowerCase() === p.category.toLowerCase()) ||
          (p.gender && selectedGenders.some((g) => g.toLowerCase() === p.gender!.toLowerCase()))
      );
    }

    // Color filter
    if (selectedColor) {
      list = list.filter((p) =>
        p.colorways?.some((cw) =>
          cw.colorName.toLowerCase().includes(selectedColor.toLowerCase())
        )
      );
    }

    // Sorting
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "alpha-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "alpha-desc") list.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "bestselling") list.sort((a, b) => (b.tag === "Bestseller" ? 1 : 0) - (a.tag === "Bestseller" ? 1 : 0));

    return list;
  }, [catalog, maxPrice, selectedStock, selectedSizes, selectedGenders, selectedColor, sort]);

  function toggleStock(val: string) {
    setSelectedStock((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function toggleSize(val: string) {
    setSelectedSizes((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function toggleGender(val: string) {
    setSelectedGenders((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  }

  function clearAllFilters() {
    setSelectedStock([]);
    setSelectedSizes([]);
    setSelectedColor(null);
    setSelectedGenders([]);
    setMaxPrice(highestPrice);
    setSort("featured");
  }

  const hasActiveFilters =
    selectedStock.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColor !== null ||
    selectedGenders.length > 0 ||
    maxPrice < highestPrice;

  // Dynamic header title
  const pageTitle = selectedGenders.includes("Men")
    ? "MEN'S CLOTHING & ESSENTIALS"
    : selectedGenders.includes("Women")
    ? "WOMEN'S DAILY WEAR"
    : selectedGenders.includes("Kids")
    ? "KIDS & TEENS WEAR"
    : selectedGenders.includes("Accessories")
    ? "ACCESSORIES & GEAR"
    : "SHOP THE EVERYDAY CATALOG";

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
        <span className={styles.productCount}>
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </span>

        <div className={styles.sortWrapper}>
          <label htmlFor="catalog-sort" className={styles.sortLabel}>
            Sort by
          </label>
          <select
            id="catalog-sort"
            value={sort}
            onChange={(e) =>
              setSort(e.target.value as (typeof sortOptions)[number]["value"])
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

      {/* Main Layout: Accordion Sidebar + 4-Column Grid */}
      <div className={styles.layout}>
        {/* Accordion Sidebar */}
        <aside className={styles.sidebar} aria-label="Catalog filters">
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
                      checked={selectedStock.includes("inStock")}
                      onChange={() => toggleStock("inStock")}
                      className={styles.checkboxInput}
                    />
                    <span>In stock</span>
                  </div>
                  <span className={styles.itemCount}>({filterCounts.inStock})</span>
                </label>
                <label className={styles.checkboxLabel}>
                  <div className={styles.checkboxLeft}>
                    <input
                      type="checkbox"
                      checked={selectedStock.includes("outOfStock")}
                      onChange={() => toggleStock("outOfStock")}
                      className={styles.checkboxInput}
                    />
                    <span>Out of stock</span>
                  </div>
                  <span className={styles.itemCount}>({filterCounts.outOfStock})</span>
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
                  <span>From: LKR 0.00</span>
                  <span>To: LKR {maxPrice.toLocaleString()}.00</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={highestPrice}
                  step={100}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className={styles.rangeSlider}
                  aria-label="Filter maximum price"
                />
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
                {allSizes.map((s) => (
                  <label key={s} className={styles.checkboxLabel}>
                    <div className={styles.checkboxLeft}>
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(s)}
                        onChange={() => toggleSize(s)}
                        className={styles.checkboxInput}
                      />
                      <span>{s}</span>
                    </div>
                    <span className={styles.itemCount}>
                      ({filterCounts.sizes[s] || 0})
                    </span>
                  </label>
                ))}
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
                        selectedColor === c.name ? styles.filterColorActive : ""
                      }`}
                      onClick={() =>
                        setSelectedColor((prev) => (prev === c.name ? null : c.name))
                      }
                      title={c.name}
                      aria-label={`Filter by ${c.name}`}
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

          {hasActiveFilters && (
            <button
              type="button"
              className={styles.clearFiltersBtn}
              onClick={clearAllFilters}
            >
              Reset All Filters
            </button>
          )}
        </aside>

        {/* 4-Column Product Grid */}
        <section className={styles.productGrid} aria-label="Products">
          {filtered.length === 0 ? (
            <div className={styles.emptyNotice}>
              <p>No pieces found matching the selected filters.</p>
              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={clearAllFilters}
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filtered.map((product) => (
              <CatalogProductCard key={product.slug} item={product} />
            ))
          )}
        </section>
      </div>

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
