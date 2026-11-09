import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CreditCard, Lock } from "lucide-react";
import { WebpayButton } from "@/components/checkout/WebpayButton";
import { prisma } from "@/lib/db";
import { formatCLP } from "@/lib/format";
import { isWebpayTestMode } from "@/lib/webpay";
import { site } from "@/config/site";
import { startWebpayPayment } from "@/server/orders";
import styles from "../../../pedido/order.module.css";

export const metadata: Metadata = { title: "Pago", robots: { index: false } };

type Props = { params: Promise<{ code: string }> };

/** Resumen previo al pago. El botón crea la transacción y lleva al formulario de Webpay. */
export default async function PaymentPage({ params }: Props) {
  const { code } = await params;
  const order = await prisma.order.findUnique({ where: { code } });
  if (!order) notFound();
  if (order.status !== "PENDIENTE" || order.paymentMethod !== "WEBPAY") redirect(`/pedido/${code}`);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.gateway}>
        {isWebpayTestMode() && <p className={styles.demo}>Modo de prueba: no se realiza ningún cobro.</p>}
        <header>
          <Lock />
          <span>Pago seguro con Webpay</span>
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
        {isWebpayTestMode() && (
          <div className={styles.card}>
            <CreditCard />
            <span>Tarjeta de prueba: 4051 8856 0044 6623, CVV 123. Para autenticar: RUT 11.111.111-1, clave 123.</span>
          </div>
        )}
        <WebpayButton action={startWebpayPayment.bind(null, order.code)} />
        <Link href={`/pedido/${order.code}`} className="btn btn--ghost btn--block">
          Volver a mi pedido
        </Link>
      </div>
    </div>
  );
}
