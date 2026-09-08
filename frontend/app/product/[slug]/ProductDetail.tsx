"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./product.module.css";
import type { Product } from "../../lib/products";

export default function ProductDetail({ product }: { product: Product }) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [size, setSize] = useState(product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const activeColorway = product.colorways?.[selectedColorIdx];
  const currentImage = activeColorway?.primaryImage || product.image;
  const currentHoverImage = activeColorway?.hoverImage || product.hoverImage;

  const displayPrice = `LKR ${(product.price * qty).toLocaleString()}.00`;

  return (
    <main className={styles.wrap}>
      <div className={styles.crumbs}>
        <Link href="/shop">Shop</Link>
        <span>/</span>
        <Link href={`/shop?category=${product.category}`}>
          {product.category}
        </Link>
        <span>/</span>
        <span className={styles.crumbCurrent}>{product.name}</span>
      </div>

      <div className={styles.layout}>
        <div className={`${styles.imageFrame} registration`}>
          <img
            src={currentImage}
            alt={product.name}
            className={styles.image}
          />
          {product.tag && <span className={styles.tag}>{product.tag}</span>}
        </div>

        <div className={styles.info}>
          <p className={styles.category}>{product.category}</p>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>
            LKR {product.price.toLocaleString()}.00
          </p>

          <p className={styles.description}>{product.description}</p>

          {product.colorways && product.colorways.length > 0 && (
            <div className={styles.field}>
              <p className={styles.fieldLabel}>
                Color: <strong>{product.colorways[selectedColorIdx].colorName}</strong>
              </p>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                {product.colorways.map((cw, idx) => (
                  <button
                    key={cw.colorName}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "2px",
                      border: idx === selectedColorIdx ? "2px solid #000" : "1px solid #ccc",
                      padding: "2px",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                    title={cw.colorName}
                  >
                    <span
                      style={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        background:
                          cw.swatchColors.length >= 2
                            ? `linear-gradient(135deg, ${cw.swatchColors[0]} 50%, ${cw.swatchColors[1]} 50%)`
                            : cw.swatchColors[0],
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="seam" />

          <div className={styles.field}>
            <p className={styles.fieldLabel}>
              Size <span className={styles.sizeGuide}>Size guide</span>
            </p>
            <div className={styles.sizeGrid}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`${styles.sizeBtn} ${
                    size === s ? styles.sizeBtnActive : ""
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.field}>
            <p className={styles.fieldLabel}>Quantity</p>
            <div className={styles.qtyRow}>
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className={styles.qtyBtn}
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <span className={styles.qtyValue}>{qty}</span>
              <button
                onClick={() => setQty((q) => Math.min(9, q + 1))}
                className={styles.qtyBtn}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          <button
            className={styles.addBtn}
            onClick={() => setAdded(true)}
          >
            {added ? "Added to Cart ✓" : `Add to Cart — ${displayPrice}`}
          </button>

          {added && (
            <p className={styles.addedNote}>
              <Link href="/cart">View Shopping Cart &rarr;</Link>
            </p>
          )}

          <dl className={styles.specs}>
            <div>
              <dt>Fabric</dt>
              <dd>Premium breathable cotton, pre-shrunk</dd>
            </div>
            <div>
              <dt>Care</dt>
              <dd>Machine wash cold, easy care</dd>
            </div>
            <div>
              <dt>Shipping</dt>
              <dd>Free delivery over LKR 7,500, 2–3 days island-wide</dd>
            </div>
          </dl>
        </div>
      </div>
    </main>
  );
}
