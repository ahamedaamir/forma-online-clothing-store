"use client";

import { useEffect, useState, useRef, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  getApiProducts,
  apiCreateProduct,
  apiUpdateProduct,
  apiDeleteProduct,
  apiGetOrders,
  apiUpdateOrderStatus,
  type SiteOrder,
} from "../lib/api";
import { type Product } from "../lib/products";
import styles from "./admin.module.css";

type TabKey = "overview" | "analytics" | "inventory" | "orders";

type ProductForm = {
  slug: string;
  name: string;
  category: Product["category"];
  price: number | string;
  tag: string;
  image: string;
  hoverImage: string;
  description: string;
  sizes: string[];
};

const emptyProductForm: ProductForm = {
  slug: "",
  name: "",
  category: "Men",
  price: "",
  tag: "",
  image: "",
  hoverImage: "",
  description: "",
  sizes: ["S", "M", "L"],
};

export default function AdminSuitePage() {
  const router = useRouter();

  // Authentication & session
  const [adminUser, setAdminUser] = useState<{ name?: string; email?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SiteOrder[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [globalSearch, setGlobalSearch] = useState("");
  const [inventoryCategory, setInventoryCategory] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");

  // Product Form (Add / Edit)
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyProductForm);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Cloudinary Image Upload
  const [cloudName, setCloudName] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("forma-cloudinary-name") || "" : ""
  );
  const [uploadPreset, setUploadPreset] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("forma-cloudinary-preset") || "" : ""
  );
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showCloudinarySettings, setShowCloudinarySettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = useCallback(
    async (file: File) => {
      if (!cloudName || !uploadPreset) {
        setShowCloudinarySettings(true);
        setUploadError("Please enter your Cloudinary Cloud Name and Upload Preset first.");
        return;
      }
      setUploadError(null);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("folder", "forma-products");

      return new Promise<void>((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            setForm((prev) => ({ ...prev, image: data.secure_url }));
            setUploadProgress(null);
            showToast("Image uploaded to Cloudinary ✓");
          } else {
            const err = JSON.parse(xhr.responseText);
            setUploadError(err?.error?.message || "Upload failed — check your Cloud Name & Preset.");
            setUploadProgress(null);
          }
          resolve();
        };
        xhr.onerror = () => {
          setUploadError("Network error during upload.");
          setUploadProgress(null);
          resolve();
        };
        xhr.send(formData);
      });
    },
    [cloudName, uploadPreset]
  );

  // Order Slide-Over Drawer
  const [selectedOrder, setSelectedOrder] = useState<SiteOrder | null>(null);
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false);
  const [newOrderStatus, setNewOrderStatus] = useState<string>("processing");

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3200);
  }

  // Load Initial Data
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isAdmin = sessionStorage.getItem("forma-admin");
      if (isAdmin !== "true") {
        router.replace("/account");
        return;
      }
      try {
        const storedUser = sessionStorage.getItem("forma-user");
        if (storedUser) setAdminUser(JSON.parse(storedUser));
      } catch {
        // fallback
      }
    }

    async function fetchData() {
      try {
        setLoading(true);
        const [loadedProducts, loadedOrders] = await Promise.all([
          getApiProducts(),
          apiGetOrders(),
        ]);
        setProducts(loadedProducts);
        setOrders(loadedOrders);
      } catch (err) {
        console.error("Failed to load admin data:", err);
        showToast("Error connecting to backend");
      } finally {
        setLoading(false);
      }
    }

    void fetchData();
  }, [router]);

  function handleSignOut() {
    sessionStorage.removeItem("forma-admin");
    sessionStorage.removeItem("forma-user");
    showToast("Signed out of FORMA Admin");
    router.push("/account");
  }

  // Inventory Handlers
  function handleEditProduct(product: Product) {
    setEditingSlug(product.slug);
    setForm({
      slug: product.slug,
      name: product.name,
      category: product.category,
      price: product.price,
      tag: product.tag || "",
      image: product.image,
      hoverImage: product.hoverImage || "",
      description: product.description || "",
      sizes: product.sizes || ["S", "M", "L"],
    });
    setActiveTab("inventory");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingSlug(null);
    setForm(emptyProductForm);
  }

  async function handleDeleteProduct(slug: string, name: string) {
    if (!confirm(`Are you sure you want to remove "${name}" from the catalog?`)) return;
    try {
      await apiDeleteProduct(slug);
      setProducts((current) => current.filter((p) => p.slug !== slug));
      if (editingSlug === slug) handleCancelEdit();
      showToast(`Product "${name}" deleted`);
    } catch (err) {
      showToast(`Delete failed: ${(err as Error).message}`);
    }
  }

  async function handleProductFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!form.name || !form.price) return;

    setSubmittingProduct(true);
    const slug = form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const payload: Partial<Product> = {
      name: form.name.trim(),
      slug,
      category: form.category,
      price: Number(form.price),
      tag: form.tag.trim() || undefined,
      image: form.image.trim() || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
      hoverImage: form.hoverImage.trim() || undefined,
      description: form.description.trim(),
      sizes: form.sizes.length ? form.sizes : ["S", "M", "L"],
    };

    try {
      if (editingSlug) {
        const updated = await apiUpdateProduct(editingSlug, payload);
        setProducts((current) => current.map((p) => (p.slug === editingSlug ? updated : p)));
        showToast(`Product "${updated.name}" updated successfully`);
      } else {
        const created = await apiCreateProduct(payload);
        setProducts((current) => [created, ...current]);
        showToast(`Product "${created.name}" listed successfully`);
      }
      handleCancelEdit();
    } catch (err) {
      showToast(`Save error: ${(err as Error).message}`);
    } finally {
      setSubmittingProduct(false);
    }
  }

  // Order Handlers
  async function handleUpdateOrderStatus(orderId: string, status: string) {
    setUpdatingOrderStatus(true);
    try {
      await apiUpdateOrderStatus(orderId, status);
      setOrders((current) => current.map((o) => (o.orderId === orderId ? { ...o, status } : o)));
      if (selectedOrder && selectedOrder.orderId === orderId) {
        setSelectedOrder((current) => (current ? { ...current, status } : null));
      }
      showToast(`Order #${orderId} marked as ${status}`);
    } catch (err) {
      showToast(`Could not update order: ${(err as Error).message}`);
    } finally {
      setUpdatingOrderStatus(false);
    }
  }

  // Calculations for Overview & Analytics
  const liveCount = products.length;
  const categoriesList = Array.from(new Set(products.map((p) => p.category)));
  const totalCatalogValue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  // Revenue calculation from real orders
  const paidOrders = orders.filter((o) => o.status === "paid" || o.status === "processing" || o.status === "shipped" || o.status === "delivered");
  const realOrdersRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);
  const displayRevenue = realOrdersRevenue > 0 ? realOrdersRevenue : 96200;

  // Category distributions
  const menCount = products.filter((p) => p.category.toLowerCase() === "men").length;
  const womenCount = products.filter((p) => p.category.toLowerCase() === "women").length;
  const setsCount = products.filter((p) => p.category.toLowerCase() === "sets" || p.category.toLowerCase() === "unisex").length;
  const accCount = products.filter((p) => p.category.toLowerCase() === "accessories" || p.category.toLowerCase() === "kids").length;
  const menPct = liveCount ? Math.round((menCount / liveCount) * 100) : 45;
  const womenPct = liveCount ? Math.round((womenCount / liveCount) * 100) : 35;
  const setsPct = liveCount ? Math.round((setsCount / liveCount) * 100) : 15;
  const accPct = liveCount ? Math.max(0, 100 - (menPct + womenPct + setsPct)) : 5;

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      inventoryCategory === "all" ||
      p.category.toLowerCase() === inventoryCategory.toLowerCase();
    const matchesSearch =
      !globalSearch ||
      p.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      p.slug.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === "all" ||
      o.status.toLowerCase() === orderStatusFilter.toLowerCase();
    const matchesSearch =
      !globalSearch ||
      o.orderId.toLowerCase().includes(globalSearch.toLowerCase()) ||
      (o.customer?.firstName && o.customer.firstName.toLowerCase().includes(globalSearch.toLowerCase())) ||
      (o.customer?.city && o.customer.city.toLowerCase().includes(globalSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className={styles.adminRoot}>
      {/* Ambient Botanical Background Silhouettes */}
      <div className={styles.botanicalBg}>
        <svg className={styles.botanicalFrond} fill="currentColor" viewBox="0 0 500 500">
          <path d="M250,50 C290,120 380,180 470,200 C390,220 320,280 300,380 C270,300 210,230 110,220 C190,190 230,120 250,50 Z M220,160 C260,200 320,230 380,240 C320,260 270,300 250,370 C230,310 190,260 120,250 C180,230 210,180 220,160 Z" />
        </svg>
        <svg className={styles.botanicalMonstera} fill="currentColor" viewBox="0 0 600 600">
          <path d="M300,100 C420,100 500,200 500,330 C500,430 420,510 310,510 C180,510 100,410 100,290 C100,180 190,100 300,100 Z M270,160 C230,190 210,240 200,300 C230,280 260,270 300,270 C300,220 290,180 270,160 Z M380,210 C350,240 340,280 340,320 C380,320 410,300 430,270 C420,240 400,220 380,210 Z M230,340 C220,380 225,420 240,450 C270,420 280,380 280,340 Z" />
        </svg>
        <svg className={styles.botanicalFern} fill="currentColor" viewBox="0 0 400 400">
          <path d="M200,20 Q240,120 350,180 Q250,220 230,350 Q180,250 50,220 Q160,150 200,20 Z" />
        </svg>
      </div>

      {/* Left Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={`${styles.glassPanel} ${styles.sidebarInner}`}>
          <div>
            {/* Brand Logo & Wordmark */}
            <div className={styles.brandWrap}>
              <div className={styles.brandIcon}>N'</div>
              <div className={styles.brandText}>
                <div className={styles.brandTitle}>
                  FORMA <span className={styles.brandBadge}>OPS</span>
                </div>
                <div className={styles.brandSubtitle}>Operations / v2.4</div>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className={styles.navLinks}>
              <button
                type="button"
                className={`${styles.navBtn} ${activeTab === "overview" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("overview")}
              >
                <div className={styles.navBtnLeft}>
                  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Overview</span>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.navBtn} ${activeTab === "analytics" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("analytics")}
              >
                <div className={styles.navBtnLeft}>
                  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Analytics</span>
                </div>
              </button>

              <button
                type="button"
                className={`${styles.navBtn} ${activeTab === "inventory" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("inventory")}
              >
                <div className={styles.navBtnLeft}>
                  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Inventory</span>
                </div>
                <span className={styles.navBadge}>{liveCount}</span>
              </button>

              <button
                type="button"
                className={`${styles.navBtn} ${activeTab === "orders" ? styles.navBtnActive : ""}`}
                onClick={() => setActiveTab("orders")}
              >
                <div className={styles.navBtnLeft}>
                  <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Orders</span>
                </div>
                <span className={styles.navDot} />
              </button>

              <div className={styles.navSectionHeading}>Management</div>

              <button
                type="button"
                className={styles.navBtn}
                onClick={() => showToast("Customers cohort: 1,842 total shoppers")}
              >
                <div className={styles.navBtnLeft}>
                  <svg style={{ width: 16, height: 16, opacity: 0.7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Customers</span>
                </div>
              </button>

              <button
                type="button"
                className={styles.navBtn}
                onClick={() => showToast("Settings configured for Colombo HQ")}
              >
                <div className={styles.navBtnLeft}>
                  <svg style={{ width: 16, height: 16, opacity: 0.7 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>Settings</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Profile & Sign Out */}
          <div className={styles.sidebarProfile}>
            <div className={styles.profileRow}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                <div className={styles.profileAvatar}>AD</div>
                <div className={styles.profileInfo}>
                  <div className={styles.profileName}>{adminUser?.name || "Admin User"}</div>
                  <div className={styles.profileEmail}>{adminUser?.email || "admin@forma.lk"}</div>
                </div>
              </div>
            </div>
            <button type="button" className={styles.signOutBtn} onClick={handleSignOut}>
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Top Floating Header Bar */}
        <header className={`${styles.glassPanel} ${styles.topbar}`}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: 1 }}>
            <div className={styles.breadcrumbs}>
              <span>FORMA Operations</span>
              <span>/</span>
              <span className={styles.breadcrumbCurrent}>{activeTab}</span>
            </div>
            <div className={styles.searchBox}>
              <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                className={`${styles.glassInput} ${styles.searchInput}`}
                placeholder="Search catalog, orders, SKUs..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.headerActions}>
            <Link href="/shop" className={styles.viewShopLink}>
              <span>VIEW SHOP</span>
              <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <button
              type="button"
              className={styles.bellButton}
              onClick={() => showToast("All notifications up to date")}
              aria-label="Notifications"
            >
              <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className={styles.bellDot} />
            </button>

            {/* Quick Switcher Pills */}
            <div className={styles.tabPills}>
              {(["overview", "analytics", "inventory", "orders"] as TabKey[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`${styles.tabPill} ${activeTab === tab ? styles.tabPillActive : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* =========================================================
            SECTION 1: OVERVIEW
            ========================================================= */}
        {activeTab === "overview" && (
          <div className={styles.pageSection} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header Greeting */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>
                  FORMA OPERATIONS / HQ
                </div>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111", margin: "0.125rem 0 0" }}>
                  Good morning, Admin
                </h1>
                <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.6)", margin: "0.25rem 0 0" }}>
                  Live store sync is active • {orders.length} order{orders.length === 1 ? "" : "s"} logged
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  className={styles.btnPrimary}
                  style={{ padding: "0.5rem 1.125rem", borderRadius: "9999px", backgroundColor: "#111111", color: "#ffffff", fontSize: "0.75rem", fontWeight: 700, border: "none", cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.12)" }}
                  onClick={() => setActiveTab("inventory")}
                >
                  + Add Product
                </button>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  style={{ padding: "0.5rem 1.125rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.7)", color: "#111111", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer", backdropFilter: "blur(12px)" }}
                  onClick={() => showToast("Exporting metrics report as CSV...")}
                >
                  Export Report
                </button>
              </div>
            </div>

            {/* 4 Stat Cards */}
            <div className={styles.statGrid4}>
              {/* Charcoal Anchor Card */}
              <div className={`${styles.glassCharcoal} ${styles.statCard}`}>
                <svg style={{ position: "absolute", right: "-1.75rem", bottom: "-1.75rem", width: 140, height: 140, color: "rgba(255,255,255,0.1)", pointerEvents: "none", transform: "rotate(12deg)" }} fill="currentColor" viewBox="0 0 200 200">
                  <path d="M100,10 C140,50 190,90 190,150 C190,170 170,190 150,190 C90,190 50,140 10,100 C50,100 90,60 100,10 Z M70,90 C85,110 110,130 140,140 C120,110 100,85 70,90 Z" />
                </svg>
                <div className={styles.statHeader} style={{ position: "relative", zIndex: 1 }}>
                  <span className={`${styles.statLabel} ${styles.statLabelDark}`}>Total Revenue</span>
                  <span className={`${styles.statPill} ${styles.statPillDark}`}>↑ 18.4%</span>
                </div>
                <div style={{ position: "relative", zIndex: 1, marginTop: "1rem" }}>
                  <div className={`${styles.statValue} ${styles.statValueDark}`}>
                    LKR {displayRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className={`${styles.statFooter} ${styles.statFooterDark}`}>
                    <span>+LKR 14.8k this week</span>
                    <svg style={{ width: 60, height: 20, color: "rgba(255,255,255,0.8)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 60 20">
                      <path d="M2,15 L14,12 L26,14 L38,6 L50,8 L58,2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stat 2: Orders Total */}
              <div className={`${styles.glassPanel} ${styles.statCard}`}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Orders Placed</span>
                  <span className={styles.statPill}>↑ 12%</span>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <div className={styles.statValue}>{orders.length || 28}</div>
                  <div className={styles.statFooter}>
                    <span>{orders.filter((o) => o.status === "pending" || o.status === "processing").length || 8} awaiting dispatch</span>
                    <svg style={{ width: 60, height: 20, color: "rgba(0,0,0,0.7)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 60 20">
                      <path d="M2,16 L15,10 L28,14 L40,8 L52,11 L58,4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stat 3: Live Products */}
              <div className={`${styles.glassPanel} ${styles.statCard}`}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Live Catalog</span>
                  <span className={styles.statPill} style={{ fontWeight: 700 }}>Active</span>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <div className={styles.statValue}>{liveCount}</div>
                  <div className={styles.statFooter}>
                    <span>Across {categoriesList.length} categories</span>
                    <svg style={{ width: 60, height: 20, color: "rgba(0,0,0,0.7)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 60 20">
                      <path d="M2,10 L15,10 L28,7 L40,7 L52,4 L58,4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Stat 4: Catalog Value */}
              <div className={`${styles.glassPanel} ${styles.statCard}`}>
                <div className={styles.statHeader}>
                  <span className={styles.statLabel}>Catalog Value</span>
                  <span className={styles.statPill} style={{ backgroundColor: "#E5E7EB" }}>Inventory</span>
                </div>
                <div style={{ marginTop: "1rem" }}>
                  <div className={styles.statValue}>
                    LKR {(totalCatalogValue || 64500).toLocaleString("en-US")}
                  </div>
                  <div className={styles.statFooter}>
                    <span>Ready for dispatch</span>
                    <svg style={{ width: 60, height: 20, color: "rgba(0,0,0,0.6)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 60 20">
                      <path d="M2,4 L16,9 L28,8 L40,15 L52,14 L58,17" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Sales Chart & Quick Operations Row */}
            <div className={styles.grid12}>
              {/* Sales Chart Card */}
              <div className={`${styles.colSpan8} ${styles.glassPanel}`} style={{ padding: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                      Revenue Flow
                    </div>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#111111", margin: "0.125rem 0 0" }}>
                      Sales Performance (LKR)
                    </h2>
                  </div>
                  <div className={styles.tabPills}>
                    <button type="button" className={`${styles.tabPill} ${styles.tabPillActive}`}>7D</button>
                    <button type="button" className={styles.tabPill} onClick={() => showToast("Viewing 30 days history")}>30D</button>
                    <button type="button" className={styles.tabPill} onClick={() => showToast("Viewing 90 days history")}>90D</button>
                  </div>
                </div>

                {/* Monochrome Smooth Area Chart */}
                <div style={{ height: "15rem", position: "relative", width: "100%", paddingTop: "1rem" }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "space-between", pointerEvents: "none", fontSize: "0.625rem", color: "rgba(0,0,0,0.3)", fontWeight: 600 }}>
                    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", paddingBottom: "0.25rem" }}>120K</div>
                    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", paddingBottom: "0.25rem" }}>90K</div>
                    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", paddingBottom: "0.25rem" }}>60K</div>
                    <div style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", paddingBottom: "0.25rem" }}>30K</div>
                    <div>0</div>
                  </div>

                  <svg style={{ width: "100%", height: "100%", position: "relative", zIndex: 1, overflow: "visible" }} preserveAspectRatio="none" viewBox="0 0 600 200">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#111111" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#111111" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,170 C80,150 140,80 220,105 C300,130 380,45 470,60 C530,70 570,30 600,20 L600,200 L0,200 Z" fill="url(#areaGrad)" />
                    <path d="M0,180 C90,165 170,140 240,130 C320,120 400,100 480,95 C540,90 580,75 600,65" fill="none" stroke="#A0A09E" strokeDasharray="4 4" strokeWidth="1.5" />
                    <path d="M0,170 C80,150 140,80 220,105 C300,130 380,45 470,60 C530,70 570,30 600,20" fill="none" stroke="#111111" strokeLinecap="round" strokeWidth="2.5" />
                    <circle cx="470" cy="60" fill="#111111" r="5" stroke="#FFFFFF" strokeWidth="2" />
                  </svg>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "0.75rem", marginTop: "0.5rem" }}>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span style={{ fontWeight: 700, color: "#111111" }}>Today</span>
                </div>
              </div>

              {/* Quick Actions & Top Performer */}
              <div className={`${styles.colSpan4}`} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Quick Operations */}
                <div className={styles.glassPanel} style={{ padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)", marginBottom: "0.75rem" }}>
                    Quick Operations
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <button type="button" className={styles.quickActionBtn} onClick={() => setActiveTab("inventory")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: "#111111", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
                          +
                        </div>
                        <span>Add New Product to Catalog</span>
                      </div>
                      <span style={{ color: "rgba(0,0,0,0.4)" }}>→</span>
                    </button>

                    <button type="button" className={styles.quickActionBtn} onClick={() => setActiveTab("orders")}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                        <div style={{ width: "1.75rem", height: "1.75rem", borderRadius: "9999px", backgroundColor: "#E5E7EB", color: "#111111", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>
                          📦
                        </div>
                        <span>Review Orders ({orders.length})</span>
                      </div>
                      <span style={{ color: "rgba(0,0,0,0.4)" }}>→</span>
                    </button>
                  </div>
                </div>

                {/* Top Selling Product */}
                <div className={styles.glassPanel} style={{ padding: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                    <span style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                      Top Performer
                    </span>
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700, color: "#111111" }}>48 units</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", overflow: "hidden", backgroundColor: "#E5E7EB", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
                      <img
                        src={products[0]?.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=300&q=80"}
                        alt={products[0]?.name || "Product"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <div style={{ fontSize: "0.6875rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,0,0,0.4)" }}>
                        {products[0]?.category || "Men"}
                      </div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#111111" }}>
                        {products[0]?.name || "Vanguard Oversized Tee"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.7)", fontWeight: 600 }}>
                        LKR {Number(products[0]?.price || 4950).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders Preview in Overview */}
            <div className={styles.glassPanel} style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                    Order Fulfillment
                  </div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111111", margin: "0.125rem 0 0" }}>
                    Recent Orders
                  </h2>
                </div>
                <button
                  type="button"
                  style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111111", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                  onClick={() => setActiveTab("orders")}
                >
                  View all orders →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {orders.slice(0, 3).map((ord) => (
                  <div
                    key={ord.orderId}
                    className={`${styles.glassPanelSubtle} ${styles.glassRow}`}
                    style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "1.25rem", cursor: "pointer" }}
                    onClick={() => setSelectedOrder(ord)}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: "2.25rem", height: "2.25rem", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.75rem" }}>
                        #{ord.orderId.slice(-2)}
                      </div>
                      <div>
                        <div style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111111" }}>
                          #{ord.orderId} — {ord.customer ? `${ord.customer.firstName || ""} ${ord.customer.lastName || ""}`.trim() : "Valued Customer"}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.5)" }}>
                          {ord.items?.length || 1} item{ord.items?.length === 1 ? "" : "s"} • {ord.customer?.city || "Colombo"}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#111111" }}>
                        LKR {Number(ord.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                      <span className={ord.status === "paid" ? styles.badgePaid : ord.status === "shipped" ? styles.badgeShipped : styles.badgeProcessing}>
                        {ord.status.toUpperCase()}
                      </span>
                      <span style={{ color: "rgba(0,0,0,0.4)" }}>→</span>
                    </div>
                  </div>
                ))}

                {orders.length === 0 && (
                  <div style={{ textAlign: "center", padding: "2rem", color: "rgba(0,0,0,0.5)" }}>
                    No orders placed yet. Orders made on the site will appear here in real-time.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 2: ANALYTICS
            ========================================================= */}
        {activeTab === "analytics" && (
          <div className={styles.pageSection} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>
                  FORMA OPERATIONS / METRICS
                </div>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111", margin: "0.125rem 0 0" }}>
                  Dashboard / Analytics
                </h1>
                <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.6)", margin: "0.25rem 0 0" }}>
                  Cohort retention, sales distribution by garment category & sizes
                </p>
              </div>

              <div className={`${styles.glassPanelSubtle}`} style={{ padding: "0.5rem 1rem", borderRadius: "9999px", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", fontWeight: 600 }}>
                <svg style={{ width: 14, height: 14, opacity: 0.6 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>Live Catalog Metrics</span>
              </div>
            </div>

            {/* 3 Metric Cards Grid */}
            <div className={styles.grid12}>
              {/* Donut Chart: Category Share */}
              <div className={`${styles.colSpan4} ${styles.glassPanel}`} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                    Distribution
                  </div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111111" }}>Category Share</h2>
                </div>

                <div style={{ margin: "1.5rem 0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <svg style={{ width: "11rem", height: "11rem", transform: "rotate(-90deg)" }} viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#EAEAE8" strokeWidth="14" />
                    {/* Men */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#111111" strokeWidth="14" strokeDasharray={`${(menPct / 100) * 238} 238`} strokeDashoffset="0" />
                    {/* Women */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#666666" strokeWidth="14" strokeDasharray={`${(womenPct / 100) * 238} 238`} strokeDashoffset={`-${(menPct / 100) * 238}`} />
                    {/* Sets */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#A8A8A6" strokeWidth="14" strokeDasharray={`${(setsPct / 100) * 238} 238`} strokeDashoffset={`-${((menPct + womenPct) / 100) * 238}`} />
                  </svg>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <span style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111111" }}>{menPct}%</span>
                    <span style={{ fontSize: "0.625rem", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>Men's</span>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", fontSize: "0.6875rem", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "9999px", backgroundColor: "#111111" }} />
                    <span>Men ({menPct}%)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "9999px", backgroundColor: "#666666" }} />
                    <span>Women ({womenPct}%)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "9999px", backgroundColor: "#A8A8A6" }} />
                    <span>Sets ({setsPct}%)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ width: 10, height: 10, borderRadius: "9999px", backgroundColor: "#D1D1CE" }} />
                    <span>Acc ({accPct}%)</span>
                  </div>
                </div>
              </div>

              {/* Bar Chart: Best-Selling Sizes */}
              <div className={`${styles.colSpan4} ${styles.glassPanel}`} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                    Inventory Velocity
                  </div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111111" }}>Best-Selling Sizes</h2>
                </div>

                <div style={{ height: "12rem", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "1.5rem 1rem 0" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>14%</span>
                    <div style={{ width: "2rem", height: 45, backgroundColor: "#D1D5DB", borderRadius: "9999px" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700 }}>XS</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>28%</span>
                    <div style={{ width: "2rem", height: 85, backgroundColor: "#9CA3AF", borderRadius: "9999px" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700 }}>S</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "#111111" }}>42%</span>
                    <div style={{ width: "2rem", height: 135, backgroundColor: "#111111", borderRadius: "9999px" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 800 }}>M</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>34%</span>
                    <div style={{ width: "2rem", height: 105, backgroundColor: "#4B5563", borderRadius: "9999px" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700 }}>L</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.625rem", fontWeight: 700, color: "rgba(0,0,0,0.5)" }}>18%</span>
                    <div style={{ width: "2rem", height: 55, backgroundColor: "#D1D5DB", borderRadius: "9999px" }} />
                    <span style={{ fontSize: "0.6875rem", fontWeight: 700 }}>XL</span>
                  </div>
                </div>

                <div style={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.5)", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "0.75rem" }}>
                  Size <strong>M</strong> currently accounts for highest re-stock trigger rate.
                </div>
              </div>

              {/* Customer Segments */}
              <div className={`${styles.colSpan4} ${styles.glassPanel}`} style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                    Audience
                  </div>
                  <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111111" }}>Customer Segments</h2>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", margin: "auto 0" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      <span>Returning Athleisure Clients</span>
                      <span>64%</span>
                    </div>
                    <div style={{ width: "100%", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#E5E7EB", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "64%", backgroundColor: "#111111", borderRadius: "9999px" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      <span>First-time Buyers</span>
                      <span>36%</span>
                    </div>
                    <div style={{ width: "100%", height: "0.5rem", borderRadius: "9999px", backgroundColor: "#E5E7EB", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: "36%", backgroundColor: "#6B7280", borderRadius: "9999px" }} />
                    </div>
                  </div>

                  <div style={{ padding: "0.75rem", borderRadius: "1rem", backgroundColor: "rgba(0,0,0,0.05)", fontSize: "0.6875rem", color: "rgba(0,0,0,0.7)" }}>
                    Average repeat order interval: <strong>23 days</strong> in Western Province clusters.
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "0.75rem" }}>
                  <span style={{ color: "rgba(0,0,0,0.5)" }}>Total registered shoppers</span>
                  <span style={{ fontWeight: 800, color: "#111111" }}>1,842</span>
                </div>
              </div>
            </div>

            {/* Performance Ranking Table */}
            <div className={styles.glassPanel} style={{ padding: "1.5rem" }}>
              <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "rgba(0,0,0,0.4)" }}>
                Performance Ranking
              </div>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#111111", marginBottom: "1rem" }}>
                Top Garments by Catalog Price
              </h2>

              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Rank & Item</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Sizes</th>
                    <th style={{ textAlign: "right" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((p, idx) => (
                    <tr key={p.slug}>
                      <td style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <span style={{ fontSize: "0.75rem", color: "rgba(0,0,0,0.4)" }}>0{idx + 1}</span>
                        <span>{p.name}</span>
                      </td>
                      <td style={{ color: "rgba(0,0,0,0.6)" }}>{p.category}</td>
                      <td style={{ fontWeight: 600 }}>LKR {Number(p.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}</td>
                      <td>{(p.sizes || ["S", "M", "L"]).join(", ")}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className={styles.badgePaid}>ACTIVE</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 3: INVENTORY (MANAGE PRODUCTS)
            ========================================================= */}
        {activeTab === "inventory" && (
          <div className={styles.pageSection} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Header: Exact reference styling */}
            <div style={{ padding: "0 0.5rem" }}>
              <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>
                FORMA OPERATIONS / 04
              </div>
              <h1 style={{ fontSize: "2.25rem", fontWeight: 900, letterSpacing: "-0.03em", color: "#111111", margin: "0.25rem 0 0" }}>
                Manage products
              </h1>
            </div>

            {/* 3 Stat Boxes from reference */}
            <div className={styles.statGrid3}>
              <div className={`${styles.glassPanel}`} style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)" }}>
                  LIVE PRODUCTS
                </div>
                <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "#111111", marginTop: "0.25rem" }}>
                  {liveCount}
                </div>
              </div>
              <div className={`${styles.glassPanel}`} style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)" }}>
                  CATEGORIES
                </div>
                <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "#111111", marginTop: "0.25rem" }}>
                  {categoriesList.length}
                </div>
              </div>
              <div className={`${styles.glassPanel}`} style={{ padding: "1.25rem" }}>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)" }}>
                  CATALOG VALUE
                </div>
                <div style={{ fontSize: "1.875rem", fontWeight: 900, color: "#111111", marginTop: "0.25rem" }}>
                  LKR {totalCatalogValue.toLocaleString("en-US")}
                </div>
              </div>
            </div>

            {/* Main Layout: Collection List (Left 7) + Sticky Add/Edit Form (Right 5) */}
            <div className={styles.grid12}>
              {/* Left: Current Collection */}
              <div className={styles.colSpan7} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.25rem" }}>
                  <div>
                    <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)" }}>
                      INVENTORY
                    </div>
                    <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "#111111" }}>
                      Current collection
                    </h2>
                  </div>

                  {/* Category Pills */}
                  <div style={{ display: "flex", gap: "0.375rem" }}>
                    {(["all", "men", "women"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "9999px",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          backgroundColor: inventoryCategory === cat ? "#111111" : "transparent",
                          color: inventoryCategory === cat ? "#ffffff" : "rgba(0,0,0,0.6)",
                          border: "none",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onClick={() => setInventoryCategory(cat)}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {filteredProducts.map((p) => (
                    <div
                      key={p.slug}
                      className={`${styles.glassPanel} ${styles.glassRow}`}
                      style={{ padding: "0.875rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                        <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "1rem", overflow: "hidden", backgroundColor: "#E5E7EB", border: "1px solid rgba(0,0,0,0.08)", flexShrink: 0 }}>
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)" }}>
                              {p.category}
                            </span>
                            {p.tag && (
                              <span style={{ fontSize: "0.5625rem", fontWeight: 800, textTransform: "uppercase", padding: "0.125rem 0.5rem", borderRadius: "9999px", backgroundColor: "#111111", color: "#ffffff" }}>
                                {p.tag}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#111111" }}>{p.name}</div>
                          <div style={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.5)" }}>{p.slug}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#111111" }}>
                          LKR {Number(p.price).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <div style={{ display: "flex", gap: "0.625rem", fontSize: "0.6875rem", fontWeight: 700 }}>
                          <button
                            type="button"
                            className={styles.actionBtnText}
                            style={{ textDecoration: "underline", color: "rgba(0,0,0,0.7)", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => handleEditProduct(p)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={styles.actionBtnText}
                            style={{ textDecoration: "underline", color: "rgba(0,0,0,0.7)", background: "none", border: "none", cursor: "pointer" }}
                            onClick={() => handleDeleteProduct(p.slug, p.name)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredProducts.length === 0 && (
                    <div style={{ textAlign: "center", padding: "3rem", color: "rgba(0,0,0,0.5)" }}>
                      No products match your current filter.
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Sticky Glass "Add / Edit Product" Form */}
              <div className={styles.colSpan5} style={{ position: "sticky", top: "6rem" }}>
                <div className={styles.glassPanel} style={{ padding: "1.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                    <div>
                      <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.12em", color: "rgba(0,0,0,0.4)" }}>
                        {editingSlug ? "UPDATE LISTING" : "NEW LISTING"}
                      </div>
                      <h2 style={{ fontSize: "1.5rem", fontWeight: 900, color: "#111111", letterSpacing: "-0.02em" }}>
                        {editingSlug ? "Edit product" : "Add product"}
                      </h2>
                    </div>
                    {editingSlug && (
                      <button
                        type="button"
                        style={{ fontSize: "0.6875rem", fontWeight: 700, padding: "0.25rem 0.625rem", borderRadius: "9999px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer" }}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleProductFormSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.25rem" }}>
                        NAME
                      </label>
                      <input
                        type="text"
                        required
                        className={styles.glassInput}
                        style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
                        placeholder="e.g. AeroWeave Track Pant"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.25rem" }}>
                        SLUG
                      </label>
                      <input
                        type="text"
                        className={styles.glassInput}
                        style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
                        placeholder="aeroweave-track-pant"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.25rem" }}>
                          CATEGORY
                        </label>
                        <select
                          className={styles.glassInput}
                          style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value as Product["category"] })}
                        >
                          <option value="Men">Men</option>
                          <option value="Women">Women</option>
                          <option value="Unisex">Unisex</option>
                          <option value="Kids">Kids</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.25rem" }}>
                          PRICE (LKR)
                        </label>
                        <input
                          type="number"
                          required
                          className={styles.glassInput}
                          style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
                          placeholder="4950"
                          value={form.price}
                          onChange={(e) => setForm({ ...form, price: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.375rem" }}>
                        <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)" }}>
                          IMAGE
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowCloudinarySettings((v) => !v)}
                          title="Cloudinary settings"
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.625rem", fontWeight: 700, color: showCloudinarySettings ? "#111" : "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: "0.25rem" }}
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                          CDN Settings
                        </button>
                      </div>

                      {/* Cloudinary Settings Panel */}
                      {showCloudinarySettings && (
                        <div style={{ marginBottom: "0.75rem", padding: "0.875rem", borderRadius: "0.75rem", backgroundColor: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                          <div style={{ fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(0,0,0,0.5)", marginBottom: "0.125rem" }}>Cloudinary Config</div>
                          <input
                            type="text"
                            className={styles.glassInput}
                            placeholder="Cloud name (e.g. my-store)"
                            style={{ width: "100%", padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                            value={cloudName}
                            onChange={(e) => {
                              setCloudName(e.target.value);
                              localStorage.setItem("forma-cloudinary-name", e.target.value);
                            }}
                          />
                          <input
                            type="text"
                            className={styles.glassInput}
                            placeholder="Unsigned upload preset"
                            style={{ width: "100%", padding: "0.375rem 0.75rem", fontSize: "0.75rem" }}
                            value={uploadPreset}
                            onChange={(e) => {
                              setUploadPreset(e.target.value);
                              localStorage.setItem("forma-cloudinary-preset", e.target.value);
                            }}
                          />
                          <div style={{ fontSize: "0.6rem", color: "rgba(0,0,0,0.4)", lineHeight: 1.5 }}>
                            Go to <strong>cloudinary.com</strong> &rarr; Settings &rarr; Upload &rarr; Add upload preset &rarr; set to <em>Unsigned</em>.
                          </div>
                        </div>
                      )}

                      {/* Drag-and-drop Upload Zone */}
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                        onDragLeave={() => setIsDraggingOver(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDraggingOver(false);
                          const file = e.dataTransfer.files?.[0];
                          if (file && file.type.startsWith("image/")) uploadToCloudinary(file);
                        }}
                        style={{
                          border: `1.5px dashed ${isDraggingOver ? "#111111" : "rgba(0,0,0,0.18)"}`,
                          borderRadius: "0.75rem",
                          padding: "1rem",
                          textAlign: "center",
                          cursor: "pointer",
                          backgroundColor: isDraggingOver ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.5)",
                          transition: "all 0.2s ease",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {form.image ? (
                          <div style={{ position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={form.image}
                              alt="Product preview"
                              style={{ width: "100%", height: "120px", objectFit: "cover", borderRadius: "0.5rem", display: "block" }}
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <div
                              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s", borderRadius: "0.5rem" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "1"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.45)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.opacity = "0"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0)"; }}
                            >
                              <span style={{ color: "#fff", fontSize: "0.6875rem", fontWeight: 700 }}>Click to replace</span>
                            </div>
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0" }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "rgba(0,0,0,0.45)" }}>Drop image here or <span style={{ textDecoration: "underline" }}>browse</span></span>
                            <span style={{ fontSize: "0.5625rem", color: "rgba(0,0,0,0.3)" }}>PNG, JPG, WebP &mdash; uploads to Cloudinary CDN</span>
                          </div>
                        )}

                        {/* Progress Bar */}
                        {uploadProgress !== null && (
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "3px", backgroundColor: "rgba(0,0,0,0.08)" }}>
                            <div style={{ height: "100%", width: `${uploadProgress}%`, backgroundColor: "#111111", transition: "width 0.2s ease", borderRadius: "9999px" }} />
                          </div>
                        )}
                      </div>

                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadToCloudinary(file);
                          e.target.value = "";
                        }}
                      />

                      {/* Upload error */}
                      {uploadError && (
                        <div style={{ marginTop: "0.375rem", fontSize: "0.6rem", color: "#c0392b", fontWeight: 600 }}>{uploadError}</div>
                      )}

                      {/* URL fallback */}
                      <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }} />
                        <span style={{ fontSize: "0.5625rem", color: "rgba(0,0,0,0.35)", fontWeight: 600, textTransform: "uppercase" }}>or paste URL</span>
                        <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }} />
                      </div>
                      <input
                        type="text"
                        className={styles.glassInput}
                        style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", marginTop: "0.5rem" }}
                        placeholder="https://..."
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.25rem" }}>
                        TAG (OPTIONAL)
                      </label>
                      <input
                        type="text"
                        className={styles.glassInput}
                        style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
                        placeholder="New, Limited, Bestseller"
                        value={form.tag}
                        onChange={(e) => setForm({ ...form, tag: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.25rem" }}>
                        DESCRIPTION
                      </label>
                      <textarea
                        rows={2}
                        className={styles.glassInput}
                        style={{ width: "100%", padding: "0.5rem 0.875rem", fontSize: "0.8125rem", resize: "none" }}
                        placeholder="Fabric blend, taper, functional details..."
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.625rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(0,0,0,0.5)", marginBottom: "0.375rem" }}>
                        SIZES
                      </label>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        {["XS", "S", "M", "L", "XL"].map((s) => (
                          <label
                            key={s}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              padding: "0.25rem 0.625rem",
                              borderRadius: "9999px",
                              border: "1px solid rgba(0,0,0,0.1)",
                              backgroundColor: form.sizes.includes(s) ? "#111111" : "rgba(255,255,255,0.6)",
                              color: form.sizes.includes(s) ? "#ffffff" : "#111111",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.2s ease",
                            }}
                          >
                            <input
                              type="checkbox"
                              hidden
                              checked={form.sizes.includes(s)}
                              onChange={(e) => {
                                const next = e.target.checked
                                  ? [...form.sizes, s]
                                  : form.sizes.filter((item) => item !== s);
                                setForm({ ...form, sizes: next });
                              }}
                            />
                            {s}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div style={{ paddingTop: "0.5rem" }}>
                      <button
                        type="submit"
                        disabled={submittingProduct}
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "9999px",
                          backgroundColor: "#111111",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.12em",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                        }}
                      >
                        {submittingProduct ? "SAVING..." : editingSlug ? "UPDATE PRODUCT" : "ADD PRODUCT"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            SECTION 4: ORDERS (LOGISTICS)
            ========================================================= */}
        {activeTab === "orders" && (
          <div className={styles.pageSection} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "0 0.5rem" }}>
              <div>
                <div style={{ fontSize: "0.6875rem", textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 700, color: "rgba(0,0,0,0.45)" }}>
                  FORMA OPERATIONS / LOGISTICS
                </div>
                <h1 style={{ fontSize: "1.875rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#111111", margin: "0.125rem 0 0" }}>
                  Orders
                </h1>
                <p style={{ fontSize: "0.8125rem", color: "rgba(0,0,0,0.6)", margin: "0.25rem 0 0" }}>
                  Island-wide fulfillment across Western, Central, and Southern Provinces
                </p>
              </div>

              <button
                type="button"
                className={styles.glassPanelSubtle}
                style={{ padding: "0.5rem 1.125rem", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer" }}
                onClick={() => showToast("Exporting all orders to CSV...")}
              >
                Export CSV
              </button>
            </div>

            {/* Filter Pills Row */}
            <div className={styles.glassPanel} style={{ padding: "0.875rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                {(["all", "pending", "paid", "processing", "shipped", "delivered"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    style={{
                      padding: "0.3125rem 0.875rem",
                      borderRadius: "9999px",
                      fontSize: "0.6875rem",
                      fontWeight: 700,
                      backgroundColor: orderStatusFilter === st ? "#111111" : "transparent",
                      color: orderStatusFilter === st ? "#ffffff" : "rgba(0,0,0,0.6)",
                      border: "none",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setOrderStatusFilter(st)}
                  >
                    {st.charAt(0).toUpperCase() + st.slice(1)}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  style={{ padding: "0.375rem 0.875rem", borderRadius: "9999px", backgroundColor: "rgba(0,0,0,0.06)", fontSize: "0.6875rem", fontWeight: 700, border: "none", cursor: "pointer" }}
                  onClick={() => showToast("Active filters refreshed")}
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* Orders Main Table */}
            <div className={styles.glassPanel} style={{ padding: "1.5rem" }}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total (LKR)</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((ord) => (
                    <tr
                      key={ord.orderId}
                      className={styles.glassRow}
                      style={{ cursor: "pointer" }}
                      onClick={() => setSelectedOrder(ord)}
                    >
                      <td style={{ fontWeight: 800, color: "#111111" }}>#{ord.orderId}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: "#111111" }}>
                          {ord.customer ? `${ord.customer.firstName || ""} ${ord.customer.lastName || ""}`.trim() : "Shopper"}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.5)" }}>
                          {ord.customer?.city || "Island Delivery"}
                        </div>
                      </td>
                      <td style={{ color: "rgba(0,0,0,0.6)" }}>
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today"}
                      </td>
                      <td>{ord.items?.length || 1} item{ord.items?.length === 1 ? "" : "s"}</td>
                      <td style={{ fontWeight: 800, color: "#111111" }}>
                        LKR {Number(ord.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td>
                        <span className={ord.status === "paid" ? styles.badgePaid : ord.status === "shipped" ? styles.badgeShipped : styles.badgeProcessing}>
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          style={{ padding: "0.25rem 0.75rem", borderRadius: "9999px", border: "1px solid rgba(0,0,0,0.15)", fontSize: "0.6875rem", fontWeight: 700, background: "none", cursor: "pointer" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedOrder(ord);
                          }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div style={{ textAlign: "center", padding: "3rem", color: "rgba(0,0,0,0.5)" }}>
                  No orders found matching status "{orderStatusFilter}".
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =========================================================
          RIGHT-SIDE GLASS SLIDE-OVER FOR ORDER DETAIL
          ========================================================= */}
      {selectedOrder && (
        <>
          <div
            className={styles.slideOverBackdrop}
            onClick={() => setSelectedOrder(null)}
          />
          <div className={styles.slideOverPanel}>
            {/* Dark Glass Header with Cropped Motif */}
            <div style={{ padding: "1.5rem", backgroundColor: "#111111", color: "#ffffff", position: "relative", overflow: "hidden" }}>
              <svg style={{ position: "absolute", right: "-2rem", bottom: "-2rem", width: 130, height: 130, color: "rgba(255,255,255,0.1)", pointerEvents: "none", transform: "rotate(45deg)" }} fill="currentColor" viewBox="0 0 200 200">
                <path d="M100,20 Q140,80 180,120 Q140,160 100,180 Q60,140 20,100 Q60,60 100,20 Z" />
              </svg>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
                <div>
                  <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.14em", color: "rgba(255,255,255,0.5)" }}>
                    ORDER DETAILS
                  </div>
                  <h3 style={{ fontSize: "1.375rem", fontWeight: 900, color: "#ffffff", margin: "0.125rem 0 0" }}>
                    #{selectedOrder.orderId}
                  </h3>
                </div>
                <button
                  type="button"
                  style={{ width: "2rem", height: "2rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.15)", color: "#ffffff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onClick={() => setSelectedOrder(null)}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "1rem", fontSize: "0.75rem", position: "relative", zIndex: 1 }}>
                <span style={{ padding: "0.125rem 0.625rem", borderRadius: "9999px", backgroundColor: "rgba(255,255,255,0.15)", fontWeight: 700 }}>
                  Island Delivery
                </span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>
                  Status: {selectedOrder.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Slide-over Body */}
            <div style={{ padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1, fontSize: "0.8125rem" }}>
              {/* Customer Info */}
              <div>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>
                  Customer & Shipping
                </div>
                <div style={{ padding: "0.875rem", borderRadius: "1rem", backgroundColor: "rgba(255,255,255,0.65)", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  <div style={{ fontWeight: 800, color: "#111111", fontSize: "0.875rem" }}>
                    {selectedOrder.customer ? `${selectedOrder.customer.firstName || ""} ${selectedOrder.customer.lastName || ""}`.trim() : "Customer"}
                  </div>
                  <div style={{ color: "rgba(0,0,0,0.6)" }}>
                    {selectedOrder.customer?.phone || "No phone"} • {selectedOrder.customer?.email || "No email"}
                  </div>
                  <div style={{ color: "rgba(0,0,0,0.8)", fontWeight: 600, paddingTop: "0.25rem" }}>
                    {[selectedOrder.customer?.addressLine1, selectedOrder.customer?.addressLine2, selectedOrder.customer?.city, selectedOrder.customer?.postalCode, selectedOrder.customer?.country].filter(Boolean).join(", ") || "Colombo, Sri Lanka"}
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>
                  Line Items ({selectedOrder.items?.length || 0})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <div
                      key={idx}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem", borderRadius: "1rem", backgroundColor: "rgba(255,255,255,0.65)", border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", overflow: "hidden", backgroundColor: "#E5E7EB", flexShrink: 0 }}>
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=150&q=80"}
                            alt={item.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: "#111111" }}>{item.name}</div>
                          <div style={{ fontSize: "0.6875rem", color: "rgba(0,0,0,0.5)" }}>
                            Size: {item.size} {item.color ? `• ${item.color}` : ""} • Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#111111" }}>
                        LKR {Number(item.lineTotal || item.price * item.quantity).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment Timeline */}
              <div>
                <div style={{ fontSize: "0.625rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", color: "rgba(0,0,0,0.4)", marginBottom: "0.5rem" }}>
                  Fulfillment Timeline
                </div>
                <div style={{ paddingLeft: "0.5rem", borderLeft: "2px solid rgba(0,0,0,0.1)", marginLeft: "0.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.75rem" }}>
                  <div style={{ position: "relative", paddingLeft: "0.75rem" }}>
                    <span style={{ position: "absolute", left: "-1.1875rem", top: "0.25rem", width: 10, height: 10, borderRadius: "9999px", backgroundColor: "#111111" }} />
                    <div style={{ fontWeight: 800, color: "#111111" }}>Order Placed</div>
                    <div style={{ fontSize: "0.625rem", color: "rgba(0,0,0,0.5)" }}>Recorded on backend database</div>
                  </div>
                  <div style={{ position: "relative", paddingLeft: "0.75rem" }}>
                    <span style={{ position: "absolute", left: "-1.1875rem", top: "0.25rem", width: 10, height: 10, borderRadius: "9999px", backgroundColor: selectedOrder.status === "pending" ? "#D1D5DB" : "#111111" }} />
                    <div style={{ fontWeight: 800, color: "#111111" }}>Payment Status: {selectedOrder.status.toUpperCase()}</div>
                    <div style={{ fontSize: "0.625rem", color: "rgba(0,0,0,0.5)" }}>PayHere Sandbox Integration</div>
                  </div>
                  <div style={{ position: "relative", paddingLeft: "0.75rem", opacity: selectedOrder.status === "shipped" || selectedOrder.status === "delivered" ? 1 : 0.4 }}>
                    <span style={{ position: "absolute", left: "-1.1875rem", top: "0.25rem", width: 10, height: 10, borderRadius: "9999px", backgroundColor: selectedOrder.status === "shipped" || selectedOrder.status === "delivered" ? "#111111" : "#D1D5DB" }} />
                    <div style={{ fontWeight: 800, color: "#111111" }}>Dispatched / Shipped</div>
                    <div style={{ fontSize: "0.625rem", color: "rgba(0,0,0,0.5)" }}>Assigned to local island courier</div>
                  </div>
                </div>
              </div>

              {/* Payment Breakdown */}
              <div style={{ padding: "1rem", borderRadius: "1rem", backgroundColor: "rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.75rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(0,0,0,0.6)" }}>
                  <span>Subtotal</span>
                  <span>LKR {Number(selectedOrder.subtotal || selectedOrder.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(0,0,0,0.6)" }}>
                  <span>Island Delivery</span>
                  <span>LKR {Number(selectedOrder.deliveryFee || 350).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 800, color: "#111111", fontSize: "0.875rem", borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: "0.5rem" }}>
                  <span>Total Amount</span>
                  <span>LKR {Number(selectedOrder.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Slide-over Action Footer */}
            <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(0,0,0,0.08)", backgroundColor: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <select
                className={styles.glassInput}
                style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.75rem", fontWeight: 700 }}
                value={newOrderStatus}
                onChange={(e) => setNewOrderStatus(e.target.value)}
              >
                <option value="processing">Status: Processing</option>
                <option value="shipped">Status: Shipped</option>
                <option value="delivered">Status: Delivered</option>
                <option value="paid">Status: Paid</option>
                <option value="cancelled">Status: Cancelled</option>
              </select>
              <button
                type="button"
                disabled={updatingOrderStatus}
                style={{ padding: "0.5rem 1.25rem", borderRadius: "9999px", backgroundColor: "#111111", color: "#ffffff", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", border: "none", cursor: "pointer" }}
                onClick={() => handleUpdateOrderStatus(selectedOrder.orderId, newOrderStatus)}
              >
                {updatingOrderStatus ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Floating Dark Glass Toast Notification */}
      {toastMessage && (
        <div className={`${styles.glassCharcoal} ${styles.toast}`}>
          <div className={styles.toastDot} />
          <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#ffffff" }}>
            {toastMessage}
          </span>
        </div>
      )}
    </div>
  );
}
