"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { products as catalog, type Product } from "../lib/products";
import styles from "./admin.module.css";

type ProductForm = Omit<Product, "tag"> & { tag: string };

const emptyProduct: ProductForm = {
  slug: "",
  name: "",
  category: "Women",
  price: 0,
  tag: "",
  image: "",
  description: "",
  sizes: ["S", "M", "L"],
};

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(catalog);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("forma-admin") !== "true") {
      router.replace("/account");
    }
  }, [router]);

  function updateField<K extends keyof ProductForm>(field: K, value: ProductForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editProduct(product: Product) {
    setSelectedSlug(product.slug);
    setForm({ ...product, tag: product.tag ?? "" });
    setNotice("");
  }

  function resetForm() {
    setSelectedSlug(null);
    setForm(emptyProduct);
    setNotice("");
  }

  function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextProduct: Product = {
      ...form,
      tag: form.tag || undefined,
      price: Number(form.price),
      sizes: form.sizes.filter(Boolean),
    };

    if (selectedSlug) {
      setProducts((current) =>
        current.map((product) =>
          product.slug === selectedSlug ? nextProduct : product
        )
      );
      setNotice("Product updated in this session.");
    } else {
      setProducts((current) => [nextProduct, ...current]);
      setNotice("Product added to this session.");
    }
    resetForm();
  }

  function deleteProduct(slug: string) {
    setProducts((current) => current.filter((product) => product.slug !== slug));
    if (selectedSlug === slug) resetForm();
    setNotice("Product removed from this session.");
  }

  function signOut() {
    sessionStorage.removeItem("forma-admin");
    router.push("/account");
  }

  return (
    <main className={styles.page}>
      <div className={styles.topbar}>
        <div>
          <p className={styles.eyebrow}>Forma operations / 04</p>
          <h1 className={styles.title}>Manage products</h1>
        </div>
        <div className={styles.actions}>
          <Link href="/shop" className={styles.secondaryButton}>View shop</Link>
          <button type="button" onClick={signOut} className={styles.secondaryButton}>Sign out</button>
        </div>
      </div>

      <div className={styles.metrics}>
        <div><span>Live products</span><strong>{products.length}</strong></div>
        <div><span>Categories</span><strong>{new Set(products.map((product) => product.category)).size}</strong></div>
        <div><span>Catalog value</span><strong>${products.reduce((total, product) => total + product.price, 0)}</strong></div>
      </div>

      <div className={styles.layout}>
        <section className={styles.tablePanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Inventory</p>
              <h2>Current collection</h2>
            </div>
            <button type="button" onClick={resetForm} className={styles.addButton}>+ Add product</button>
          </div>
          <div className={styles.productList}>
            {products.map((product) => (
              <article key={product.slug} className={styles.productRow}>
                <img src={product.image} alt="" className={styles.productImage} />
                <div className={styles.productDetails}>
                  <span>{product.category}</span>
                  <h3>{product.name}</h3>
                  <p>{product.slug}</p>
                </div>
                <strong className={styles.productPrice}>${product.price}</strong>
                <div className={styles.rowActions}>
                  <button type="button" onClick={() => editProduct(product)}>Edit</button>
                  <button type="button" onClick={() => deleteProduct(product.slug)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.formPanel}>
          <p className={styles.eyebrow}>{selectedSlug ? "Edit listing" : "New listing"}</p>
          <h2>{selectedSlug ? "Update product" : "Add product"}</h2>
          <form className={styles.form} onSubmit={saveProduct}>
            <label>Name<input required value={form.name} onChange={(event) => updateField("name", event.target.value)} /></label>
            <label>Slug<input required value={form.slug} onChange={(event) => updateField("slug", event.target.value)} /></label>
            <div className={styles.formGrid}>
              <label>Category<select value={form.category} onChange={(event) => updateField("category", event.target.value as Product["category"])}><option>Women</option><option>Men</option><option>Kids</option><option>Accessories</option></select></label>
              <label>Price<input required min="0" type="number" value={form.price} onChange={(event) => updateField("price", Number(event.target.value))} /></label>
            </div>
            <label>Image URL<input required type="url" value={form.image} onChange={(event) => updateField("image", event.target.value)} /></label>
            <label>Tag<input placeholder="New, Limited, Bestseller" value={form.tag} onChange={(event) => updateField("tag", event.target.value)} /></label>
            <label>Description<textarea required rows={4} value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
            <label>Sizes<input required value={form.sizes.join(", ")} onChange={(event) => updateField("sizes", event.target.value.split(",").map((size) => size.trim()))} /></label>
            <div className={styles.formActions}><button type="submit" className={styles.primaryButton}>{selectedSlug ? "Save changes" : "Add product"}</button>{selectedSlug && <button type="button" onClick={resetForm} className={styles.cancelButton}>Cancel</button>}</div>
            {notice && <p className={styles.notice} role="status">{notice}</p>}
          </form>
        </section>
      </div>
    </main>
  );
}
