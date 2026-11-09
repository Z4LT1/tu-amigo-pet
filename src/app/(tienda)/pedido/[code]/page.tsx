import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CircleCheck, CircleX, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { site } from "@/config/site";
import { DELIVERY_METHODS, ORDER_STATUS, PAYMENT_METHODS, WEBPAY_PAYMENT_TYPES } from "@/lib/constants";
import { formatCLP, formatDateTime } from "@/lib/format";
import styles from "../order.module.css";

export const metadata: Metadata = { title: "Estado de tu pedido", robots: { index: false } };

type Props = { params: Promise<{ code: string }>; searchParams: Promise<{ pago?: string }> };

const TIMELINE = ["PENDIENTE", "PAGADO", "PREPARANDO", "ENVIADO", "ENTREGADO"] as const;

/** Oculta parte de los datos personales: la URL del pedido puede compartirse. */
const mask = (value: string) => value.replace(/^(.{2}).*(@.*)$/, "$1•••$2");

export default async function OrderPage({ params, searchParams }: Props) {
  const [{ code }, { pago }] = await Promise.all([params, searchParams]);
  const order = await prisma.order.findUnique({ where: { code }, include: { items: true } });
  if (!order) notFound();

  const status = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
  const steps: readonly string[] = order.deliveryMethod === "RETIRO" ? TIMELINE.filter((s) => s !== "ENVIADO") : TIMELINE;
  const currentIndex = steps.indexOf(order.status);
  const rejected = pago === "rechazado" && order.status === "PENDIENTE";
  const { bank } = site.payments;

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.head}>
        {rejected ? (
          <CircleX className={styles.iconErr} />
        ) : order.status === "PENDIENTE" ? (
          <Clock className={styles.iconWait} />
        ) : (
          <CircleCheck className={styles.iconOk} />
        )}
        <div>
          <h1>
            {rejected
              ? "El pago no se completó"
              : order.status === "PENDIENTE"
                ? "Recibimos tu pedido"
                : order.status === "CANCELADO"
                  ? "Pedido cancelado"
                  : `¡Gracias, ${order.customerName.split(" ")[0]}!`}
          </h1>
          <p>
            Pedido <strong>{order.code}</strong>, {formatDateTime(order.createdAt)}. Te enviamos el detalle a {mask(order.email)}.
          </p>
        </div>
      </header>

      {rejected && (
        <div className={styles.notice}>
          <p>Tu banco rechazó el pago o lo cancelaste. Tu pedido sigue reservado: puedes intentarlo de nuevo.</p>
          <Link href={`/checkout/pago/${order.code}`} className="btn btn--primary">
            Reintentar pago
          </Link>
        </div>
      )}

      {!rejected && order.status === "PENDIENTE" && order.paymentMethod === "WEBPAY" && (
        <div className={styles.notice}>
          <p>Todavía no recibimos el pago de este pedido.</p>
          <Link href={`/checkout/pago/${order.code}`} className="btn btn--primary">
            Pagar con Webpay
          </Link>
        </div>
      )}

      {pago === "revertido" && (
        <div className={styles.notice}>
          <p>Este pedido ya no estaba vigente, así que anulamos el cobro. Si ves el cargo en tu cuenta, escríbenos con tu número de pedido.</p>
        </div>
      )}

      {order.status === "PENDIENTE" && order.paymentMethod === "TRANSFERENCIA" && (
        <section className={styles.notice} aria-labelledby="transferencia">
          <h2 id="transferencia">Datos para transferir {formatCLP(order.total)}</h2>
          <dl className={styles.bank}>
            <div>
              <dt>Titular</dt>
              <dd>{bank.holder}</dd>
            </div>
            <div>
              <dt>RUT</dt>
              <dd>{bank.rut}</dd>
            </div>
            <div>
              <dt>Banco</dt>
              <dd>{bank.bank}</dd>
            </div>
            <div>
              <dt>{bank.accountType}</dt>
              <dd>{bank.account}</dd>
            </div>
            <div>
              <dt>Correo</dt>
              <dd>{bank.email}</dd>
            </div>
          </dl>
          <p className="muted">Indica el número de pedido en el comentario. Preparamos tu pedido cuando confirmamos el pago, normalmente el mismo día hábil.</p>
        </section>
      )}

      {order.status === "PENDIENTE" && order.paymentMethod === "EFECTIVO_RETIRO" && (
        <section className={styles.notice}>
          <h2>Tu pedido está reservado por {site.payments.pickupHoldHours} horas</h2>
          <p>
            Pásalo a buscar a {site.contact.address} y paga en caja con efectivo o tarjeta. Si no lo retiras en ese plazo, liberamos los productos.
          </p>
        </section>
      )}

      {order.status !== "CANCELADO" && (
        <ol className={styles.timeline} aria-label="Estado del pedido">
          {steps.map((s, i) => (
            <li key={s} data-state={i < currentIndex ? "done" : i === currentIndex ? "current" : "todo"}>
              <span />
              {s === "ENTREGADO" && order.deliveryMethod === "RETIRO" ? "Retirado" : ORDER_STATUS[s as keyof typeof ORDER_STATUS].label}
            </li>
          ))}
        </ol>
      )}

      <div className={styles.grid}>
        <section className={styles.box} aria-labelledby="detalle">
          <h2 id="detalle">Detalle</h2>
          <ul role="list" className={styles.items}>
            {order.items.map((it) => (
              <li key={it.id}>
                <span>
                  {it.quantity} × {it.name}
                </span>
                <strong>{formatCLP(it.unitPrice * it.quantity)}</strong>
              </li>
            ))}
          </ul>
          <dl className={styles.totals}>
            <div>
              <dt>Subtotal</dt>
              <dd>{formatCLP(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Despacho</dt>
              <dd>{order.shippingCost === 0 ? "Gratis" : formatCLP(order.shippingCost)}</dd>
            </div>
            <div className={styles.grand}>
              <dt>Total</dt>
              <dd>{formatCLP(order.total)}</dd>
            </div>
          </dl>
        </section>

        <section className={styles.box} aria-labelledby="entrega">
          <h2 id="entrega">Entrega y pago</h2>
          <dl className={styles.facts}>
            <div>
              <dt>Estado</dt>
              <dd>{status.label}</dd>
            </div>
            <div>
              <dt>Entrega</dt>
              <dd>{DELIVERY_METHODS[order.deliveryMethod as keyof typeof DELIVERY_METHODS]}</dd>
            </div>
            {order.deliveryMethod === "DESPACHO" ? (
              <div>
                <dt>Dirección</dt>
                <dd>
                  {order.comuna}, {order.region}
                </dd>
              </div>
            ) : (
              <div>
                <dt>Retiro en</dt>
                <dd>{site.contact.address}</dd>
              </div>
            )}
            <div>
              <dt>Pago</dt>
              <dd>{PAYMENT_METHODS[order.paymentMethod as keyof typeof PAYMENT_METHODS]}</dd>
            </div>
            {order.paymentAuthCode && (
              <>
                <div>
                  <dt>Comercio</dt>
                  <dd>{site.legalName}</dd>
                </div>
                <div>
                  <dt>Monto pagado</dt>
                  <dd>{formatCLP(order.total)}</dd>
                </div>
                <div>
                  <dt>Autorización</dt>
                  <dd>{order.paymentAuthCode}</dd>
                </div>
                <div>
                  <dt>Tarjeta</dt>
                  <dd>
                    {WEBPAY_PAYMENT_TYPES[order.paymentTypeCode ?? ""] ?? "Tarjeta"} terminada en {order.paymentCardLast4}
                  </dd>
                </div>
                {Boolean(order.paymentInstallments) && (
                  <div>
                    <dt>Cuotas</dt>
                    <dd>{order.paymentInstallments}</dd>
                  </div>
                )}
                {order.paidAt && (
                  <div>
                    <dt>Fecha de pago</dt>
                    <dd>{formatDateTime(order.paidAt)}</dd>
                  </div>
                )}
              </>
            )}
          </dl>
          <p className="muted">
            ¿Necesitas cambiar algo? Escríbenos por{" "}
            <a href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(`Hola, consulto por el pedido ${order.code}`)}`}>WhatsApp</a> indicando tu número de pedido.
          </p>
        </section>
      </div>

      <div className={styles.actions}>
        <Link href="/tienda" className="btn btn--primary">
          Seguir comprando
        </Link>
        <Link href="/seguimiento" className="btn btn--ghost">
          Seguir otro pedido
        </Link>
      </div>
    </div>
  );
}
