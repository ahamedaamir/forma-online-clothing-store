import Link from "next/link";
import { getProduct, products } from "../../lib/products";
import ProductDetail from "./ProductDetail";
import styles from "./product.module.css";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
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
        <p className={styles.eyebrow}>404</p>
        <h1 className={styles.notFoundTitle}>We couldn&rsquo;t find that piece.</h1>
        <Link href="/shop" className={styles.backLink}>
          &larr; Back to shop
        </Link>
      </main>
    );
  }

  return <ProductDetail product={product} />;
}
