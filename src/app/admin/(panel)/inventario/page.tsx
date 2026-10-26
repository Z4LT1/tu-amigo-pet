import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatCLP } from "@/lib/format";
import { MovementForm } from "@/components/admin/MovementForm";
import { MovementTable } from "@/components/admin/MovementTable";
import styles from "../../admin.module.css";

export const metadata = { title: "Inventario" };

type Props = { searchParams: Promise<{ filtro?: string }> };

export default async function InventoryPage({ searchParams }: Props) {
  const { filtro } = await searchParams;
  const [products, movements] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, include: { category: { select: { name: true } } }, orderBy: { name: "asc" } }),
    prisma.inventoryMovement.findMany({ orderBy: { createdAt: "desc" }, take: 25, include: { product: { select: { name: true } } } }),
  ]);

  const low = products.filter((p) => p.stock <= p.minStock);
  const rows = filtro === "bajo" ? low.sort((a, b) => a.stock - b.stock) : products;
  const units = products.reduce((s, p) => s + p.stock, 0);
  const valueAtCost = products.reduce((s, p) => s + p.stock * (p.cost ?? 0), 0);
  const valueAtPrice = products.reduce((s, p) => s + p.stock * p.price, 0);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1>Inventario</h1>
          <p className="muted">Cada venta online descuenta stock automáticamente. Registra aquí lo que entra y sale del local.</p>
        </div>
      </header>

      <section className={styles.kpis} aria-label="Totales de inventario">
        <div className={styles.kpi}>
          <span>Unidades en bodega</span>
          <strong>{units.toLocaleString("es-CL")}</strong>
          <small>{products.length} productos activos</small>
        </div>
        <div className={styles.kpi}>
          <span>Valor a costo</span>
          <strong>{formatCLP(valueAtCost)}</strong>
          <small>Capital inmovilizado</small>
        </div>
        <div className={styles.kpi}>
          <span>Valor a precio de venta</span>
          <strong>{formatCLP(valueAtPrice)}</strong>
          <small>Margen bruto potencial {formatCLP(valueAtPrice - valueAtCost)}</small>
        </div>
        <Link href="/admin/inventario?filtro=bajo" className={styles.kpi} data-alert={low.length > 0}>
          <span>Bajo el mínimo</span>
          <strong>{low.length}</strong>
          <small>Productos por reponer</small>
        </Link>
      </section>

      <section className={styles.panel}>
        <h2>Registrar movimiento</h2>
        <MovementForm products={products.map((p) => ({ id: p.id, name: p.name, stock: p.stock }))} />
      </section>

      <section className={styles.panel}>
        <header className={styles.panelHead}>
          <h2>{filtro === "bajo" ? "Productos por reponer" : "Stock por producto"}</h2>
          <nav className={styles.tabs} aria-label="Filtro de inventario">
            <Link href="/admin/inventario" aria-current={filtro !== "bajo" ? "page" : undefined}>
              Todos
            </Link>
            <Link href="/admin/inventario?filtro=bajo" aria-current={filtro === "bajo" ? "page" : undefined}>
              Stock bajo ({low.length})
            </Link>
          </nav>
        </header>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th className={styles.num}>Stock</th>
                <th className={styles.num}>Mínimo</th>
                <th className={styles.num}>Valor a costo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/admin/productos/${p.id}`} className={styles.rowTitle}>
                      {p.name}
                    </Link>
                    <small>{p.sku}</small>
                  </td>
                  <td>{p.category.name}</td>
                  <td className={styles.num}>
                    <span className={styles.stockPill} data-out={p.stock === 0} data-low={p.stock > 0 && p.stock <= p.minStock}>
                      {p.stock}
                    </span>
                  </td>
                  <td className={styles.num}>{p.minStock}</td>
                  <td className={styles.num}>{formatCLP(p.stock * (p.cost ?? 0))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Últimos movimientos</h2>
        <MovementTable movements={movements} />
      </section>
    </>
  );
}
