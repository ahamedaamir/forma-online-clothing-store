import { products as fallbackProducts, latestStyles as fallbackLatestStyles, type Product } from "./products";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  data: T;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "featured" | "price-asc" | "price-desc";
}

/**
 * Check backend connection status
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetch all products with optional filters from backend API, with fallback to local data
 */
export async function getApiProducts(filters?: ProductFilters): Promise<Product[]> {
  try {
    const params = new URLSearchParams();
    if (filters?.category && filters.category !== "All") {
      params.append("category", filters.category);
    }
    if (filters?.search) params.append("search", filters.search);
    if (filters?.minPrice !== undefined) params.append("minPrice", String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.append("maxPrice", String(filters.maxPrice));
    if (filters?.sort) params.append("sort", filters.sort);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    const res = await fetch(`${API_BASE_URL}/products${queryString}`, {
      method: "GET",
      cache: "no-store",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json: ApiResponse<Product[]> = await res.json();
    return json.data;
  } catch (err) {
    console.warn("Backend API unavailable, using local catalog data:", (err as Error).message);
    let list = [...fallbackProducts];
    if (filters?.category && filters.category !== "All") {
      list = list.filter((p) => p.category.toLowerCase() === filters.category!.toLowerCase());
    }
    if (filters?.maxPrice !== undefined) {
      list = list.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters?.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filters?.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }
}

/**
 * Fetch latest styles from backend API
 */
export async function getApiLatestStyles(): Promise<Product[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/latest-styles`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const json: ApiResponse<Product[]> = await res.json();
    return json.data;
  } catch (err) {
    console.warn("Backend API unavailable for latest styles, using local fallback:", (err as Error).message);
    return fallbackLatestStyles;
  }
}

/**
 * Fetch a single product by slug
 */
export async function getApiProduct(slug: string): Promise<Product | undefined> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Product ${slug} not found on backend`);
    const json: ApiResponse<Product> = await res.json();
    return json.data;
  } catch {
    return fallbackProducts.find((p) => p.slug === slug);
  }
}

/**
 * Create a new product on the backend API
 */
export async function apiCreateProduct(product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  const json: ApiResponse<Product> = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to create product");
  return json.data;
}

/**
 * Update an existing product on the backend API
 */
export async function apiUpdateProduct(slug: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  const json: ApiResponse<Product> = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update product");
  return json.data;
}

/**
 * Delete a product on the backend API
 */
export async function apiDeleteProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`, {
    method: "DELETE",
  });

  const json: ApiResponse<Product> = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to delete product");
  return json.data;
}

/**
 * Authenticate login on backend API
 */
export async function apiLogin(credentials: { email: string; password: string; role?: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Invalid credentials");
  return json.data;
}

/**
 * Register new user on backend API
 */
export async function apiRegister(userData: { name: string; email: string; password: string }) {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json.data;
}

/**
 * Checkout cart order on backend API
 */
export async function apiCheckout(orderData: {
  items: Array<{ slug: string; size: string; qty: number; price: number }>;
  customer?: { email: string; name?: string };
  total?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/cart/checkout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(orderData),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Checkout failed");
  return json.data;
}
