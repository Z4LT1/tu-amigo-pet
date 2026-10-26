import Link from "next/link";
import { prisma } from "@/lib/db";
import { nowInChile } from "@/lib/agenda";
import { formatCLP, formatDateTime, formatYMD } from "@/lib/format";
import { StatusBadge } from "@/components/admin/StatusBadge";
import styles from "../admin.module.css";

export const metadata = { title: "Resumen" };

const DAYS = 14;

export default async function Dashboard() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const since = new Date(now.getTime() - (DAYS - 1) * 86400000);
  since.setHours(0, 0, 0, 0);
  const today = nowInChile().date;

  const [monthOrders, toHandle, products, upcoming, recent, recentOrders] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: monthStart }, status: { not: "CANCELADO" } }, select: { total: true } }),
    prisma.order.count({ where: { status: { in: ["PENDIENTE", "PAGADO", "PREPARANDO"] } } }),
    prisma.product.findMany({ where: { isActive: true }, select: { id: true, name: true, stock: true, minStock: true, sku: true } }),
    prisma.appointment.findMany({
      where: { date: { gte: today }, status: { in: ["SOLICITADA", "CONFIRMADA"] } },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      take: 6,
      include: { service: { select: { name: true } } },
    }),
    prisma.order.findMany({ where: { createdAt: { gte: since }, status: { not: "CANCELADO" } }, select: { total: true, createdAt: true } }),
    prisma.order.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const revenue = monthOrders.reduce((s, o) => s + o.total, 0);
  const low = products.filter((p) => p.stock <= p.minStock).sort((a, b) => a.stock - b.stock);
  const pendingAppointments = upcoming.filter((a) => a.status === "SOLICITADA").length;

  // Ventas por día (últimos 14 días)
  const key = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/Santiago" });
  const byDay = new Map<string, number>();
  for (let i = 0; i < DAYS; i++) byDay.set(key(new Date(since.getTime() + i * 86400000)), 0);
  for (const o of recent) {
    const k = key(o.createdAt);
    if (byDay.has(k)) byDay.set(k, byDay.get(k)! + o.total);
  }
  const series = [...byDay.entries()];
  const max = Math.max(1, ...series.map(([, v]) => v));
  const total14 = series.reduce((s, [, v]) => s + v, 0);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1>Resumen</h1>
          <p className="muted">{formatYMD(today)}</p>
        </div>
      </header>

      <section className={styles.kpis} aria-label="Indicadores">
        <div className={styles.kpi}>
          <span>Ventas del mes</span>
          <strong>{formatCLP(revenue)}</strong>
          <small>{monthOrders.length} pedidos</small>
        </div>
        <Link href="/admin/pedidos?estado=abiertos" className={styles.kpi}>
          <span>Pedidos por gestionar</span>
          <strong>{toHandle}</strong>
          <small>Pendientes, pagados o en preparación</small>
        </Link>
        <Link href="/admin/inventario?filtro=bajo" className={styles.kpi} data-alert={low.length > 0}>
          <span>Productos con stock bajo</span>
          <strong>{low.length}</strong>
          <small>En o bajo el mínimo definido</small>
        </Link>
        <Link href="/admin/reservas" className={styles.kpi}>
          <span>Horas por confirmar</span>
          <strong>{pendingAppointments}</strong>
          <small>{upcoming.length} próximas en agenda</small>
        </Link>
      </section>

      <div className={styles.dashGrid}>
        <section className={styles.panel} aria-labelledby="ventas">
          <header>
            <h2 id="ventas">Ventas online, últimos {DAYS} días</h2>
            <span className="muted">{formatCLP(total14)}</span>
          </header>
          <div className={styles.chart} role="img" aria-label={`Ventas diarias de los últimos ${DAYS} días, total ${formatCLP(total14)}`}>
            {series.map(([day, value]) => (
              <div key={day} className={styles.barCol}>
                <div className={styles.bar} style={{ height: `${Math.max(value ? 3 : 0, (value / max) * 100)}%` }}>
                  <span className={styles.tip}>
                    {formatYMD(day)}
                    <strong>{formatCLP(value)}</strong>
                  </span>
                </div>
                <span className={styles.barLabel}>{Number(day.slice(8))}</span>
              </div>
            ))}
          </div>
          <table className="visually-hidden">
            <caption>Ventas por día</caption>
            <tbody>
              {series.map(([day, value]) => (
                <tr key={day}>
                  <th scope="row">{day}</th>
                  <td>{formatCLP(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className={styles.panel} aria-labelledby="bajo">
          <header>
            <h2 id="bajo">Reponer pronto</h2>
            <Link href="/admin/inventario?filtro=bajo" className="link">
              Ver inventario
            </Link>
          </header>
          {low.length === 0 ? (
            <p className="muted">Todo el catálogo está sobre su stock mínimo.</p>
          ) : (
            <ul role="list" className={styles.list}>
              {low.slice(0, 7).map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/productos/${p.id}`}>
                    <span>{p.name}</span>
                    <span className={styles.stockPill} data-out={p.stock === 0} data-low={p.stock > 0}>
                      {p.stock === 0 ? "Agotado" : `${p.stock} / mín. ${p.minStock}`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="ultimos">
          <header>
            <h2 id="ultimos">Últimos pedidos</h2>
            <Link href="/admin/pedidos" className="link">
              Ver todos
            </Link>
          </header>
          <ul role="list" className={styles.list}>
            {recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/pedidos/${o.id}`}>
                  <span>
                    <strong>{o.code}</strong>
                    <small>
                      {o.customerName}, {formatDateTime(o.createdAt)}
                    </small>
                  </span>
                  <span className={styles.listEnd}>
                    {formatCLP(o.total)}
                    <StatusBadge status={o.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="agenda">
          <header>
            <h2 id="agenda">Próximas horas</h2>
            <Link href="/admin/reservas" className="link">
              Ver agenda
            </Link>
          </header>
          {upcoming.length === 0 ? (
            <p className="muted">No hay horas agendadas.</p>
          ) : (
            <ul role="list" className={styles.list}>
              {upcoming.map((a) => (
                <li key={a.id}>
                  <Link href="/admin/reservas">
                    <span>
                      <strong>
                        {a.petName} ({a.service.name})
                      </strong>
                      <small>
                        {formatYMD(a.date)}, {a.time}
                      </small>
                    </span>
                    <StatusBadge status={a.status} kind="appointment" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
