/**
 * Mock API Service & Data Layer for FORMA Everyday Clothing Store
 * Simulates asynchronous backend fetch calls with realistic JSON structures.
 * NO HARDCODING in UI components: All data is consumed dynamically via this service.
 * All pricing is standardized to LKR (Sri Lankan Rupees).
 */

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  currency?: string;
  rating: number;
  reviewCount: number;
  badge?: "Sale" | "Bestseller" | "Hot" | "Trending" | "Save 30%" | "New";
  imageUrl: string;
  hoverImageUrl?: string;
  category: "Men" | "Women" | "Kids" | "Accessories" | "Sale";
  sizes?: string[];
  colors?: string[];
  inStock: boolean;
}

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  itemCount: number;
  imageUrl: string;
}

export interface PromoDeal {
  id: string;
  headline: string;
  discountText: string;
  code: string;
  expiresText: string;
}

export function formatLKR(amount: number): string {
  return `LKR ${amount.toLocaleString()}.00`;
}

// Dummy JSON database with realistic LKR prices
const mockProductsDatabase: ProductItem[] = [
  {
    id: "prod-01",
    name: "Classic Heavyweight Cotton Crewneck Tee",
    price: 4950,
    originalPrice: 6500,
    currency: "LKR",
    rating: 4.8,
    reviewCount: 342,
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=700&q=80",
    category: "Men",
    sizes: ["S", "M", "L", "XL", "2XL"],
    colors: ["#18181b", "#ffffff", "#2563eb", "#6b7280"],
    inStock: true,
  },
  {
    id: "prod-02",
    name: "Everyday Stretch High-Rise Skinny Denim",
    price: 7450,
    originalPrice: 9900,
    currency: "LKR",
    rating: 4.9,
    reviewCount: 512,
    badge: "Sale",
    imageUrl: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=700&q=80",
    category: "Women",
    sizes: ["26", "28", "30", "32"],
    colors: ["#1e3a8a", "#0f172a", "#64748b"],
    inStock: true,
  },
  {
    id: "prod-03",
    name: "Ultra-Soft Fleece Zip Hoodie",
    price: 8950,
    originalPrice: 12500,
    currency: "LKR",
    rating: 4.7,
    reviewCount: 219,
    badge: "Hot",
    imageUrl: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=700&q=80",
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#334155", "#e2e8f0", "#15803d"],
    inStock: true,
  },
  {
    id: "prod-04",
    name: "Relaxed Fit Cotton Poplin Button-Down",
    price: 6250,
    originalPrice: 7900,
    currency: "LKR",
    rating: 4.6,
    reviewCount: 148,
    badge: "Save 30%",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=700&q=80",
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#93c5fd", "#ffffff", "#fed7aa"],
    inStock: true,
  },
  {
    id: "prod-05",
    name: "Ribbed Knit Everyday Tank Top (2-Pack)",
    price: 3850,
    originalPrice: 5200,
    currency: "LKR",
    rating: 4.8,
    reviewCount: 420,
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80",
    category: "Women",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#ffffff", "#000000", "#d4d4d8"],
    inStock: true,
  },
  {
    id: "prod-06",
    name: "Kids Organic Cotton Graphic Tee & Shorts Set",
    price: 4250,
    originalPrice: 5900,
    currency: "LKR",
    rating: 4.9,
    reviewCount: 184,
    badge: "Sale",
    imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=700&q=80",
    category: "Kids",
    sizes: ["3-4Y", "5-6Y", "7-8Y", "9-10Y"],
    colors: ["#fbbf24", "#38bdf8", "#4ade80"],
    inStock: true,
  },
  {
    id: "prod-07",
    name: "Cozy Fleece Jogger Sweatpants with Pockets",
    price: 6450,
    originalPrice: 8500,
    currency: "LKR",
    rating: 4.7,
    reviewCount: 308,
    badge: "Sale",
    imageUrl: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=700&q=80",
    category: "Men",
    sizes: ["S", "M", "L", "XL"],
    colors: ["#475569", "#0f172a", "#78716c"],
    inStock: true,
  },
  {
    id: "prod-08",
    name: "Lightweight Quilted Puffer Jacket",
    price: 12950,
    originalPrice: 16500,
    currency: "LKR",
    rating: 4.8,
    reviewCount: 267,
    badge: "Save 30%",
    imageUrl: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=700&q=80",
    hoverImageUrl: "https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=700&q=80",
    category: "Women",
    sizes: ["XS", "S", "M", "L"],
    colors: ["#15803d", "#000000", "#d97706"],
    inStock: true,
  },
  {
    id: "prod-09",
    name: "Kids Play-All-Day Durable Stretch Leggings",
    price: 3250,
    originalPrice: 4500,
    currency: "LKR",
    rating: 4.9,
    reviewCount: 195,
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=700&q=80",
    category: "Kids",
    sizes: ["4Y", "6Y", "8Y", "10Y"],
    colors: ["#f43f5e", "#8b5cf6", "#0284c7"],
    inStock: true,
  },
  {
    id: "prod-10",
    name: "Everyday Seamless Daily Crew Socks (5-Pack)",
    price: 2450,
    originalPrice: 3500,
    currency: "LKR",
    rating: 4.8,
    reviewCount: 680,
    badge: "Hot",
    imageUrl: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?auto=format&fit=crop&w=700&q=80",
    category: "Sale",
    sizes: ["One Size"],
    colors: ["#ffffff", "#000000", "#9ca3af"],
    inStock: true,
  },
  {
    id: "prod-11",
    name: "Everyday Heavyweight Canvas Tote Bag",
    price: 2850,
    originalPrice: 3900,
    currency: "LKR",
    rating: 4.9,
    reviewCount: 145,
    badge: "Bestseller",
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=700&q=80",
    category: "Accessories",
    sizes: ["One Size"],
    colors: ["#f4ede4", "#18181b", "#1e3a8a"],
    inStock: true,
  },
  {
    id: "prod-12",
    name: "Classic Washed Cotton Baseball Cap",
    price: 2950,
    originalPrice: 3800,
    currency: "LKR",
    rating: 4.7,
    reviewCount: 98,
    badge: "New",
    imageUrl: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=700&q=80",
    category: "Accessories",
    sizes: ["Adjustable"],
    colors: ["#18181b", "#78716c", "#15803d"],
    inStock: true,
  },
];

const mockCategories: CategorySummary[] = [
  {
    id: "cat-women",
    name: "Women's Daily",
    slug: "Women",
    itemCount: 420,
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-men",
    name: "Men's Basics",
    slug: "Men",
    itemCount: 380,
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-kids",
    name: "Kids & Teens",
    slug: "Kids",
    itemCount: 195,
    imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-accessories",
    name: "Accessories & Bags",
    slug: "Accessories",
    itemCount: 120,
    imageUrl: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "cat-sale",
    name: "Super Deals",
    slug: "Sale",
    itemCount: 160,
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=400&q=80",
  },
];

const mockPromoDeal: PromoDeal = {
  id: "deal-01",
  headline: "Everyday Flash Sale: Up to 50% Off",
  discountText: "Free island-wide delivery on orders over LKR 7,500",
  code: "EVERYDAY20",
  expiresText: "Limited time offer",
};

export const initialProducts = mockProductsDatabase;
export const initialCategories = mockCategories;
export const initialPromoDeal = mockPromoDeal;

/**
 * Service methods simulating asynchronous network calls
 */
export async function fetchProducts(filters?: {
  category?: string;
  badge?: string;
  searchQuery?: string;
}): Promise<ProductItem[]> {
  // Simulate network latency (20ms)
  await new Promise((resolve) => setTimeout(resolve, 20));

  let results = [...mockProductsDatabase];

  if (filters?.category && filters.category !== "All") {
    if (filters.category === "Sale") {
      results = results.filter((p) => Boolean(p.originalPrice && p.originalPrice > p.price));
    } else {
      results = results.filter(
        (p) => p.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }
  }

  if (filters?.badge) {
    results = results.filter((p) => p.badge === filters.badge);
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }

  return results;
}

export async function fetchCategories(): Promise<CategorySummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return mockCategories;
}

export async function fetchPromoDeal(): Promise<PromoDeal> {
  await new Promise((resolve) => setTimeout(resolve, 10));
  return mockPromoDeal;
}
