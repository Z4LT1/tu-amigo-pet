import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import { MovementForm } from "@/components/admin/MovementForm";
import { MovementTable } from "@/components/admin/MovementTable";
import styles from "../../../admin.module.css";

export const metadata = { title: "Editar producto" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ creado?: string }> };

export default async function EditProduct({ params, searchParams }: Props) {
  const [{ id }, { creado }] = await Promise.all([params, searchParams]);
  const [product, categories, brands, movements] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.inventoryMovement.findMany({ where: { productId: id }, orderBy: { createdAt: "desc" }, take: 15, include: { product: { select: { name: true } } } }),
  ]);
  if (!product) notFound();

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <Link href="/admin/productos" className={styles.back}>
            Productos
          </Link>
          <h1>{product.name}</h1>
          <p className="muted">
            SKU {product.sku}, stock actual <strong>{product.stock}</strong>
          </p>
        </div>
        {product.isActive && (
          <Link href={`/producto/${product.slug}`} target="_blank" className="btn btn--ghost">
            Ver en la tienda
          </Link>
        )}
      </header>
      {creado && <p className="form-alert form-alert--ok">Producto creado.</p>}
      <div className={styles.editGrid}>
        <ProductForm product={product} categories={categories} brands={brands} />
        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2>Movimiento de stock</h2>
            <MovementForm fixedProductId={product.id} />
          </section>
          <section className={styles.panel}>
            <h2>Historial</h2>
            <MovementTable movements={movements} compact />
          </section>
        </aside>
      </div>
    </>
  );
}
