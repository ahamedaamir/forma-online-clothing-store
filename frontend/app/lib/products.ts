export type Product = {
  slug: string;
  name: string;
  category: "Men" | "Women" | "Kids" | "Accessories";
  price: number;
  tag?: string;
  image: string;
  description: string;
  sizes: string[];
};

export const products: Product[] = [
  {
    slug: "luna-linen-set",
    name: "Luna Linen Set",
    category: "Women",
    price: 84,
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    description:
      "A breathable two-piece linen set cut for warm-weather days. Relaxed through the shoulder, tapered at the hem, finished with mismatched horn buttons.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    slug: "urban-utility-jacket",
    name: "Urban Utility Jacket",
    category: "Men",
    price: 120,
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
    description:
      "A six-pocket field jacket in brushed cotton twill. Built for layering, with a storm flap and adjustable cuff tabs.",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    slug: "crest-knit-tee",
    name: "Crest Knit Tee",
    category: "Men",
    price: 42,
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    description:
      "Heavyweight cotton knit with a ribbed crew neck. Garment-dyed for a lived-in finish that softens with every wash.",
    sizes: ["S", "M", "L", "XL"],
  },
  {
    slug: "nordic-everyday-tote",
    name: "Nordic Everyday Tote",
    category: "Accessories",
    price: 58,
    tag: "Limited",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    description:
      "Waxed canvas tote with leather straps and an internal pocket. Holds a laptop, a notebook, and whatever the day adds.",
    sizes: ["One Size"],
  },
  {
    slug: "atelier-wool-coat",
    name: "Atelier Wool Coat",
    category: "Women",
    price: 210,
    tag: "New",
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
    description:
      "Double-faced wool coat, fully lined, with a notched collar and horn buttons. Cut long, worn open.",
    sizes: ["XS", "S", "M", "L"],
  },
  {
    slug: "junior-explorer-hoodie",
    name: "Junior Explorer Hoodie",
    category: "Kids",
    price: 46,
    tag: "Bestseller",
    image:
      "https://images.unsplash.com/photo-1519278409-1f56fdda7fe5?auto=format&fit=crop&w=900&q=80",
    description:
      "Brushed-fleece hoodie built for the playground. Reinforced elbows, kangaroo pocket, machine washable.",
    sizes: ["4Y", "6Y", "8Y", "10Y", "12Y"],
  },
  {
    slug: "field-trouser",
    name: "Field Trouser",
    category: "Men",
    price: 96,
    image:
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    description:
      "Straight-leg trouser in a mid-weight cotton twill, with a gusseted crotch for movement and a hidden coin pocket.",
    sizes: ["28", "30", "32", "34", "36"],
  },
  {
    slug: "brass-hoop-set",
    name: "Brass Hoop Set",
    category: "Accessories",
    price: 34,
    tag: "Trending",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=900&q=80",
    description:
      "A set of three brass hoops in graduated sizes. Hypoallergenic posts, brushed matte finish.",
    sizes: ["One Size"],
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}
