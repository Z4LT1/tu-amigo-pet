import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import { prisma } from "@/lib/db";
import { formatCLP } from "@/lib/format";
import { site } from "@/config/site";
import { simulatePayment } from "@/server/orders";
import styles from "../../../pedido/order.module.css";

export const metadata: Metadata = { title: "Pago", robots: { index: false } };

type Props = { params: Promise<{ code: string }> };

/**
 * Pantalla de pasarela simulada. En producción, el pedido se registra en Transbank
 * Webpay Plus (SDK oficial) y el cliente es redirigido a su formulario; al volver,
 * se confirma la transacción y se actualiza el estado del pedido.
 */
export default async function PaymentPage({ params }: Props) {
  const { code } = await params;
  const order = await prisma.order.findUnique({ where: { code } });
  if (!order) notFound();
  if (order.status !== "PENDIENTE" || order.paymentMethod !== "WEBPAY") redirect(`/pedido/${code}`);

  const approve = simulatePayment.bind(null, code, true);
  const reject = simulatePayment.bind(null, code, false);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.gateway}>
        <p className={styles.demo}>Entorno de demostración: no se realiza ningún cobro.</p>
        <header>
          <Lock />
          <span>Pasarela de pago</span>
        </header>
        <dl>
          <div>
            <dt>Comercio</dt>
            <dd>{site.legalName}</dd>
          </div>
          <div>
            <dt>Pedido</dt>
            <dd>{order.code}</dd>
          </div>
          <div className={styles.amount}>
            <dt>Monto a pagar</dt>
            <dd>{formatCLP(order.total)}</dd>
          </div>
        </dl>
        <div className={styles.card}>
          <CreditCard />
          <span>Tarjeta de prueba terminada en 6623</span>
        </div>
        <form action={approve}>
          <button type="submit" className="btn btn--primary btn--block">
            Aprobar pago
          </button>
        </form>
        <form action={reject}>
          <button type="submit" className="btn btn--ghost btn--block">
            Rechazar pago
          </button>
        </form>
      </div>
    </div>
  );
}
