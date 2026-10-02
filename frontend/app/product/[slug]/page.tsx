import Link from "next/link";
import type { Metadata } from "next";
import { getProduct, products } from "../../lib/products";
import ProductDetail from "./ProductDetail";
import styles from "./product-detail.module.css";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return {
    title: product ? `${product.name} | FORMA` : "Product not found | FORMA",
    description: product?.description || "This FORMA product could not be found.",
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);

  if (!product) {
    return (
      <main className={styles.notFoundWrap}>
        <section className={styles.notFoundCard}>
          <p>FORMA</p>
          <h1>Product not found</h1>
          <p>This piece may have moved or is no longer available.</p>
          <Link href="/shop" className={styles.backLink}>Back to shop</Link>
        </section>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}
