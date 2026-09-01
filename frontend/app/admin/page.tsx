"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type Product } from "../lib/products";
import {
  getApiProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
} from "../lib/api";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProduct);
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("forma-admin") !== "true") {
      router.replace("/account");
      return;
    }

    loadCatalog();
  }, [router]);

  async function loadCatalog() {
    try {
      setLoading(true);
      const data = await getApiProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
      setNotice("Failed to load live catalog from backend.");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function editProduct(product: Product) {
    setSelectedSlug(product.slug);
    setForm({
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      tag: product.tag ?? "",
      image: product.image,
      hoverImage: product.hoverImage,
      description: product.description,
      sizes: product.sizes || ["S", "M", "L"],
    });
    setNotice("");
  }

  function resetForm() {
    setSelectedSlug(null);
    setForm(emptyProduct);
    setNotice("");
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setNotice("");

    const payload: Partial<Product> = {
      ...form,
      tag: form.tag ? form.tag : undefined,
      price: Number(form.price),
      sizes: form.sizes.filter(Boolean),
    };

    try {
      if (selectedSlug) {
        const updated = await apiUpdateProduct(selectedSlug, payload);
        setProducts((current) =>
          current.map((p) => (p.slug === selectedSlug ? updated : p))
        );
        setNotice(`Product "${updated.name}" updated successfully in backend.`);
      } else {
        const created = await apiCreateProduct(payload);
        setProducts((current) => [created, ...current]);
        setNotice(`Product "${created.name}" created successfully in backend.`);
      }
      resetForm();
    } catch (err) {
      setNotice(`Error: ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteProduct(slug: string) {
    if (!confirm(`Are you sure you want to delete product "${slug}"?`)) return;

    try {
      await apiDeleteProduct(slug);
      setProducts((current) => current.filter((p) => p.slug !== slug));
      if (selectedSlug === slug) resetForm();
      setNotice("Product removed successfully from backend.");
    } catch (err) {
      setNotice(`Failed to delete: ${(err as Error).message}`);
    }
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
          <Link href="/shop" className={styles.secondaryButton}>
            View shop
          </Link>
          <button
            type="button"
            onClick={signOut}
            className={styles.secondaryButton}
          >
            Sign out
          </button>
        </div>
      </div>

      <div className={styles.metrics}>
        <div>
          <span>Live products</span>
          <strong>{products.length}</strong>
        </div>
        <div>
          <span>Categories</span>
          <strong>
            {new Set(products.map((product) => product.category)).size}
          </strong>
        </div>
        <div>
          <span>Catalog value</span>
          <strong>
            ${products.reduce((total, product) => total + product.price, 0).toLocaleString()}
          </strong>
        </div>
      </div>

      <div className={styles.layout}>
        <section className={styles.tablePanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Inventory</p>
              <h2>Current collection</h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className={styles.addButton}
            >
              + Add product
            </button>
          </div>

          {loading ? (
            <p style={{ padding: "2rem", color: "#666" }}>
              Loading products from backend API...
            </p>
          ) : (
            <div className={styles.productList}>
              {products.map((product) => (
                <article key={product.slug} className={styles.productRow}>
                  <img
                    src={product.image}
                    alt=""
                    className={styles.productImage}
                  />
                  <div className={styles.productDetails}>
                    <span>{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.slug}</p>
                  </div>
                  <strong className={styles.productPrice}>
                    {product.formattedPrice || (product.currency ? `${product.currency} ${product.price.toFixed(2)}` : `$${product.price}`)}
                  </strong>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      onClick={() => editProduct(product)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteProduct(product.slug)}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.formPanel}>
          <p className={styles.eyebrow}>
            {selectedSlug ? "Edit listing" : "New listing"}
          </p>
          <h2>{selectedSlug ? "Update product" : "Add product"}</h2>
          <form className={styles.form} onSubmit={saveProduct}>
            <label>
              Name
              <input
                required
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
              />
            </label>
            <label>
              Slug
              <input
                required
                value={form.slug}
                disabled={Boolean(selectedSlug)}
                onChange={(event) => updateField("slug", event.target.value)}
              />
            </label>
            <div className={styles.formGrid}>
              <label>
                Category
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateField(
                      "category",
                      event.target.value as Product["category"]
                    )
                  }
                >
                  <option>Women</option>
                  <option>Men</option>
                  <option>Kids</option>
                  <option>Accessories</option>
                </select>
              </label>
              <label>
                Price
                <input
                  required
                  min="0"
                  type="number"
                  value={form.price}
                  onChange={(event) =>
                    updateField("price", Number(event.target.value))
                  }
                />
              </label>
            </div>
            <label>
              Image URL
              <input
                required
                type="url"
                value={form.image}
                onChange={(event) => updateField("image", event.target.value)}
              />
            </label>
            <label>
              Hover Image URL (Optional)
              <input
                type="url"
                value={form.hoverImage || ""}
                onChange={(event) => updateField("hoverImage", event.target.value)}
              />
            </label>
            <label>
              Tag
              <input
                placeholder="New, Limited, Bestseller"
                value={form.tag}
                onChange={(event) => updateField("tag", event.target.value)}
              />
            </label>
            <label>
              Description
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
              />
            </label>
            <label>
              Sizes
              <input
                required
                value={form.sizes.join(", ")}
                onChange={(event) =>
                  updateField(
                    "sizes",
                    event.target.value.split(",").map((size) => size.trim())
                  )
                }
              />
            </label>
            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : selectedSlug
                  ? "Save changes"
                  : "Add product"}
              </button>
              {selectedSlug && (
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              )}
            </div>
            {notice && (
              <p className={styles.notice} role="status">
                {notice}
              </p>
            )}
          </form>
        </section>
      </div>
    </main>
  );
}
