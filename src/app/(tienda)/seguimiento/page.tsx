import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { TrackForm } from "./TrackForm";
import styles from "../pedido/order.module.css";

export const metadata: Metadata = {
  title: "Seguimiento de pedido",
  description: "Revisa el estado de tu compra con el número de pedido y tu correo.",
  alternates: { canonical: "/seguimiento" },
};

export default function TrackingPage() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Seguimiento de pedido" }]} />
      <div className={styles.gateway} style={{ marginTop: "2rem" }}>
        <h1 style={{ fontSize: "var(--fs-2xl)" }}>¿Dónde está mi pedido?</h1>
        <p className="muted">Ingresa el número de pedido (lo encuentras en el correo de confirmación) y el correo que usaste al comprar.</p>
        <TrackForm />
      </div>
    </div>
  );
}
