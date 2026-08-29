"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./shop.module.css";
import { products } from "../lib/products";

const categoryOptions = ["All", "Women", "Men", "Kids", "Accessories"] as const;
const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
] as const;

export default function ShopClient({
  initialCategory,
}: {
  initialCategory: string;
}) {
  const [category, setCategory] = useState<string>(initialCategory || "All");
  const [maxPrice, setMaxPrice] = useState(220);
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>(
    "featured"
  );

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (category !== "All") {
      list = list.filter((p) => p.category === category);
    }
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [category, maxPrice, sort]);

  return (
    <main className={styles.wrap}>
      <div className={styles.head}>
        <p className={styles.eyebrow}>Full catalog</p>
        <h1 className={styles.title}>Shop everything</h1>
        <p className={styles.subtitle}>
          {filtered.length} {filtered.length === 1 ? "piece" : "pieces"}
          {category !== "All" ? ` in ${category}` : ""}
        </p>
      </div>

      <div className={styles.layout}>
        <aside className={styles.filters}>
          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Category</p>
            <div className={styles.filterList}>
              {categoryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setCategory(option)}
                  className={`${styles.filterChip} ${
                    category === option ? styles.filterChipActive : ""
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className={`${styles.filterGroup} seam`} />

          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>
              Max price{" "}
              <span className={styles.filterValue}>${maxPrice}</span>
            </p>
            <input
              type="range"
              min={30}
              max={220}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className={styles.range}
            />
          </div>

          <div className={`${styles.filterGroup} seam`} />

          <div className={styles.filterGroup}>
            <p className={styles.filterLabel}>Sort by</p>
            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value as (typeof sortOptions)[number]["value"])
              }
              className={styles.select}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <div className={styles.grid}>
          {filtered.length === 0 && (
            <p className={styles.empty}>
              Nothing matches those filters yet &mdash; try widening the price
              range.
            </p>
          )}
          {filtered.map((product) => (
            <Link
              key={product.slug}
              href={`/product/${product.slug}`}
              className={styles.card}
            >
              <div className={styles.imageWrap}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.image}
                />
                {product.tag && <span className={styles.tag}>{product.tag}</span>}
              </div>
              <div className={styles.cardBody}>
                <div>
                  <p className={styles.cardCategory}>{product.category}</p>
                  <h3 className={styles.cardName}>{product.name}</h3>
                </div>
                <span className={styles.cardPrice}>${product.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
