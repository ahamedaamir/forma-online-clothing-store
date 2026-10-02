import Image from "next/image";
import Link from "next/link";
import styles from "./ShopByCategorySection.module.css";

const categories = [
  {
    label: "Collection 01",
    title: "Men",
    href: "/shop?category=Men",
    image:
      "https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_8490_7c13b2df-fc3f-41c2-a898-42103aac93ae.jpg?v=1787734609",
    alt: "Man wearing performance-ready FORMA streetwear",
    imagePosition: "Top",
  },
  {
    label: "Collection 02",
    title: "Women",
    href: "/shop?category=Women",
    image:
      "https://cdn.shopify.com/s/files/1/0607/0619/3614/files/IMG_9033.jpg?v=1787736560",
    alt: "Woman wearing FORMA athletic streetwear",
    imagePosition: "Top",
  },
  {
    label: "Collection 03",
    title: "Accessories",
    href: "/shop?category=Accessories",
    image:
      "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=85",
    alt: "Everyday fashion accessories styled for a streetwear look",
    imagePosition: "Center",
  },
] as const;

export default function ShopByCategorySection() {
  return (
    <section className={styles.section} aria-labelledby="category-heading">
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Shop By Category</p>
          <h2 className={styles.heading} id="category-heading">
            Find Your Fit
          </h2>
        </div>
        <p className={styles.description}>
          Performance-ready streetwear and gym wear built to move with you.
        </p>
      </div>

      <div className={styles.grid}>
        {categories.map((category) => (
          <Link
            className={styles.card}
            href={category.href}
            key={category.title}
            aria-label={`Shop ${category.title}`}
          >
            <Image
              className={`${styles.image} ${styles[`image${category.imagePosition}`]}`}
              src={category.image}
              alt={category.alt}
              fill
              loading="lazy"
              sizes="(max-width: 767px) 100vw, 33vw"
              unoptimized
            />
            <span className={styles.gradient} aria-hidden="true" />
            <span className={styles.glassPlate}>
              <span className={styles.cardCopy}>
                <span className={styles.cardLabel}>{category.label}</span>
                <span className={styles.cardTitle}>{category.title}</span>
              </span>
              <span className={styles.arrowButton} aria-hidden="true">
                <span className={styles.materialSymbol}>arrow_forward</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}