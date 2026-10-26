import Image from "next/image";
import Link from "next/link";
import type { ProductCardData } from "@/lib/catalog";
import { discountPercent, formatCLP } from "@/lib/format";
import { PackShot } from "./PackShot";
import { AddToCartButton } from "./AddToCartButton";
import styles from "./ProductCard.module.css";

export function ProductVisual({ product, sizes, priority }: { product: Pick<ProductCardData, "name" | "imageUrl" | "packColor" | "presentation" | "brand" | "category">; sizes: string; priority?: boolean }) {
  return product.imageUrl ? (
    <Image src={product.imageUrl} alt={product.name} fill sizes={sizes} priority={priority} className={styles.photo} />
  ) : (
    <PackShot brand={product.brand.name} color={product.packColor} icon={product.category.icon} presentation={product.presentation} title={product.name} />
  );
}

export function StockNote({ stock, minStock = 5 }: { stock: number; minStock?: number }) {
  if (stock <= 0) return <span className={`${styles.stock} ${styles.out}`}>Agotado</span>;
  if (stock <= minStock) return <span className={`${styles.stock} ${styles.low}`}>Quedan {stock}</span>;
  return null;
}

export function ProductCard({ product, priority }: { product: ProductCardData; priority?: boolean }) {
  const off = discountPercent(product.price, product.compareAtPrice);
  const pharmacy = product.category.section === "FARMACIA";
  const href = `/producto/${product.slug}`;

  return (
    <article className={`${styles.card} ${pharmacy ? styles.pharmacy : ""}`}>
      <Link href={href} className={styles.media} tabIndex={-1} aria-hidden>
        <ProductVisual product={product} sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 280px" priority={priority} />
        {product.requiresPrescription && <span className={styles.rx}>Requiere receta</span>}
      </Link>
      <div className={styles.body}>
        <p className={styles.brand}>{product.brand.name}</p>
        <h3 className={styles.name}>
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className={styles.presentation}>
          {product.presentation}
          <StockNote stock={product.stock} />
        </p>
        <div className={styles.priceRow}>
          {off > 0 ? (
            <p className={styles.sale}>
              <span className={styles.tag}>{formatCLP(product.price)}</span>
              <span className={styles.was}>
                <s>{formatCLP(product.compareAtPrice!)}</s> {off}% menos
              </span>
            </p>
          ) : (
            <p className={styles.price}>{formatCLP(product.price)}</p>
          )}
        </div>
        <AddToCartButton
          compact
          disabled={product.stock <= 0 || product.requiresPrescription}
          disabledLabel={product.requiresPrescription ? "Solo en tienda" : "Agotado"}
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand.name,
            presentation: product.presentation,
            price: product.price,
            packColor: product.packColor,
            categoryIcon: product.category.icon,
            imageUrl: product.imageUrl,
            stock: product.stock,
          }}
        />
      </div>
    </article>
  );
}

export function ProductGrid({ children }: { children: React.ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}
