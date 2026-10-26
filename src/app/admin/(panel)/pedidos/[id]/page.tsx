import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { DELIVERY_METHODS, ORDER_STATUS, PAYMENT_METHODS } from "@/lib/constants";
import { formatCLP, formatDateTime } from "@/lib/format";
import { updateOrderStatus } from "@/server/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";
import styles from "../../../admin.module.css";

export const metadata = { title: "Pedido" };

type Props = { params: Promise<{ id: string }> };

export default async function OrderAdmin({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: { include: { product: { select: { id: true, stock: true } } } } } });
  if (!order) notFound();
  const closed = order.status === "CANCELADO";

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <Link href="/admin/pedidos" className={styles.back}>
            Pedidos
          </Link>
          <h1>{order.code}</h1>
          <p className="muted">
            {formatDateTime(order.createdAt)} <StatusBadge status={order.status} />
          </p>
        </div>
        <a className="btn btn--ghost" href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${order.customerName.split(" ")[0]}, te escribimos de Tu Amigo Pet por tu pedido ${order.code}.`)}`} target="_blank" rel="noopener noreferrer">
          Escribir al cliente
        </a>
      </header>

      <div className={styles.editGrid}>
        <div className={styles.form}>
          <section className={styles.panel}>
            <h2>Productos</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th className={styles.num}>Precio</th>
                    <th className={styles.num}>Cant.</th>
                    <th className={styles.num}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it) => (
                    <tr key={it.id}>
                      <td>
                        <Link href={`/admin/productos/${it.product.id}`} className={styles.rowTitle}>
                          {it.name}
                        </Link>
                        <small>
                          {it.sku}, stock actual {it.product.stock}
                        </small>
                      </td>
                      <td className={styles.num}>{formatCLP(it.unitPrice)}</td>
                      <td className={styles.num}>{it.quantity}</td>
                      <td className={styles.num}>{formatCLP(it.unitPrice * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}>Despacho</td>
                    <td className={styles.num}>{formatCLP(order.shippingCost)}</td>
                  </tr>
                  <tr>
                    <th colSpan={3}>Total</th>
                    <th className={styles.num}>{formatCLP(order.total)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Cliente y entrega</h2>
            <dl className={styles.facts}>
              <div>
                <dt>Nombre</dt>
                <dd>{order.customerName}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>
                  <a href={`mailto:${order.email}`}>{order.email}</a>
                </dd>
              </div>
              <div>
                <dt>Celular</dt>
                <dd>{order.phone}</dd>
              </div>
              {order.rut && (
                <div>
                  <dt>RUT</dt>
                  <dd>{order.rut}</dd>
                </div>
              )}
              <div>
                <dt>Entrega</dt>
                <dd>{DELIVERY_METHODS[order.deliveryMethod as keyof typeof DELIVERY_METHODS]}</dd>
              </div>
              {order.address && (
                <div>
                  <dt>Dirección</dt>
                  <dd>
                    {order.address}, {order.comuna}, {order.region}
                  </dd>
                </div>
              )}
              <div>
                <dt>Pago</dt>
                <dd>{PAYMENT_METHODS[order.paymentMethod as keyof typeof PAYMENT_METHODS]}</dd>
              </div>
              {order.notes && (
                <div>
                  <dt>Indicaciones</dt>
                  <dd>{order.notes}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>

        <aside className={styles.side}>
          <section className={styles.panel}>
            <h2>Cambiar estado</h2>
            {closed ? (
              <p className="muted">Este pedido está cancelado y su stock ya fue repuesto.</p>
            ) : (
              <form action={updateOrderStatus.bind(null, order.id)} className={styles.statusForm}>
                {Object.entries(ORDER_STATUS).map(([k, v]) => (
                  <label key={k} className="check">
                    <input type="radio" name="status" value={k} defaultChecked={order.status === k} />
                    {v.label}
                  </label>
                ))}
                <p className="muted">Si eliges “Cancelado”, las unidades vuelven al inventario.</p>
                <button className="btn btn--primary btn--block">Actualizar estado</button>
              </form>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
