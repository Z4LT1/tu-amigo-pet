import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCLP } from "@/lib/format";
import { toggleProductActive } from "@/server/admin";
import styles from "../../admin.module.css";

export const metadata = { title: "Productos" };

type Props = { searchParams: Promise<{ q?: string; categoria?: string; estado?: string }> };

export default async function ProductsAdmin({ searchParams }: Props) {
  const { q, categoria, estado } = await searchParams;
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: {
        AND: [
          q ? { OR: [{ name: { contains: q } }, { sku: { contains: q } }] } : {},
          categoria ? { category: { slug: categoria } } : {},
          estado === "activos" ? { isActive: true } : estado === "inactivos" ? { isActive: false } : {},
        ],
      },
      include: { category: true, brand: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1>Productos</h1>
          <p className="muted">{products.length} productos</p>
        </div>
        <Link href="/admin/productos/nuevo" className="btn btn--primary">
          <Plus /> Nuevo producto
        </Link>
      </header>

      <form className={styles.filters}>
        <input name="q" className="input" placeholder="Buscar por nombre o SKU" defaultValue={q} />
        <select name="categoria" className="select" defaultValue={categoria ?? ""}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="estado" className="select" defaultValue={estado ?? ""}>
          <option value="">Activos e inactivos</option>
          <option value="activos">Solo activos</option>
          <option value="inactivos">Solo inactivos</option>
        </select>
        <button className="btn btn--ghost">Filtrar</button>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th className={styles.num}>Precio</th>
              <th className={styles.num}>Stock</th>
              <th>Estado</th>
              <th>
                <span className="visually-hidden">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} data-inactive={!p.isActive}>
                <td>
                  <Link href={`/admin/productos/${p.id}`} className={styles.rowTitle}>
                    {p.name}
                  </Link>
                  <small>
                    {p.brand.name}, {p.presentation}
                  </small>
                </td>
                <td className={styles.mono}>{p.sku}</td>
                <td>{p.category.name}</td>
                <td className={styles.num}>
                  {formatCLP(p.price)}
                  {p.compareAtPrice && <small>antes {formatCLP(p.compareAtPrice)}</small>}
                </td>
                <td className={styles.num}>
                  <span className={styles.stockPill} data-out={p.stock === 0} data-low={p.stock > 0 && p.stock <= p.minStock}>
                    {p.stock}
                  </span>
                </td>
                <td>
                  <form action={toggleProductActive.bind(null, p.id)}>
                    <button className={styles.toggle} data-on={p.isActive} aria-label={p.isActive ? `Desactivar ${p.name}` : `Activar ${p.name}`}>
                      {p.isActive ? "Visible" : "Oculto"}
                    </button>
                  </form>
                </td>
                <td>
                  <Link href={`/admin/productos/${p.id}`} className="link">
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
