import Link from "next/link";
import { prisma } from "@/lib/db";
import { ProductForm } from "@/components/admin/ProductForm";
import styles from "../../../admin.module.css";

export const metadata = { title: "Nuevo producto" };

export default async function NewProduct() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <Link href="/admin/productos" className={styles.back}>
            Productos
          </Link>
          <h1>Nuevo producto</h1>
        </div>
      </header>
      <ProductForm categories={categories} brands={brands} />
    </>
  );
}
