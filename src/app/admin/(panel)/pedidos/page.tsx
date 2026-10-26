import Link from "next/link";
import { prisma } from "@/lib/db";
import { DELIVERY_METHODS, ORDER_STATUS, PAYMENT_METHODS } from "@/lib/constants";
import { formatCLP, formatDateTime } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { site } from "@/config/site";
import styles from "../../admin.module.css";

export const metadata = { title: "Pedidos" };

type Props = { searchParams: Promise<{ estado?: string; q?: string }> };

export default async function OrdersAdmin({ searchParams }: Props) {
  const { estado, q } = await searchParams;
  const statusFilter = estado === "abiertos" ? { in: ["PENDIENTE", "PAGADO", "PREPARANDO"] } : estado && estado in ORDER_STATUS ? estado : undefined;
  const [orders, counts] = await Promise.all([
    prisma.order.findMany({
      where: {
        status: statusFilter,
        ...(q ? { OR: [{ code: { contains: q.toUpperCase() } }, { customerName: { contains: q } }, { email: { contains: q.toLowerCase() } }] } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { items: true } } },
      take: 100,
    }),
    prisma.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countOf = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const holdMs = site.payments.pickupHoldHours * 3600000;

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1>Pedidos</h1>
          <p className="muted">Pedidos de la tienda online. Al cancelar un pedido el stock vuelve al inventario.</p>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Estado">
        <Link href="/admin/pedidos" aria-current={!estado ? "page" : undefined}>
          Todos
        </Link>
        <Link href="/admin/pedidos?estado=abiertos" aria-current={estado === "abiertos" ? "page" : undefined}>
          Por gestionar ({countOf("PENDIENTE") + countOf("PAGADO") + countOf("PREPARANDO")})
        </Link>
        {Object.entries(ORDER_STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin/pedidos?estado=${k}`} aria-current={estado === k ? "page" : undefined}>
            {v.label} ({countOf(k)})
          </Link>
        ))}
      </nav>

      <form className={styles.filters}>
        {estado && <input type="hidden" name="estado" value={estado} />}
        <input name="q" className="input" placeholder="Buscar por código, nombre o correo" defaultValue={q} />
        <button className="btn btn--ghost">Buscar</button>
      </form>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Pedido</th>
              <th>Cliente</th>
              <th>Entrega</th>
              <th>Pago</th>
              <th className={styles.num}>Total</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const expired = o.status === "PENDIENTE" && o.paymentMethod === "EFECTIVO_RETIRO" && Date.now() - o.createdAt.getTime() > holdMs;
              return (
                <tr key={o.id}>
                  <td>
                    <Link href={`/admin/pedidos/${o.id}`} className={styles.rowTitle}>
                      {o.code}
                    </Link>
                    <small>{formatDateTime(o.createdAt)}</small>
                  </td>
                  <td>
                    {o.customerName}
                    <small>{o._count.items} productos</small>
                  </td>
                  <td>
                    {DELIVERY_METHODS[o.deliveryMethod as keyof typeof DELIVERY_METHODS]}
                    {o.comuna && <small>{o.comuna}</small>}
                  </td>
                  <td>{PAYMENT_METHODS[o.paymentMethod as keyof typeof PAYMENT_METHODS]}</td>
                  <td className={styles.num}>{formatCLP(o.total)}</td>
                  <td>
                    <StatusBadge status={o.status} />
                    {expired && <small className={styles.warnText}>Reserva vencida</small>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && <p className={styles.emptyRow}>No hay pedidos con este filtro.</p>}
      </div>
    </>
  );
}
