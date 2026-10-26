import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import styles from "@/components/checkout/checkout.module.css";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function Page() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Carrito", href: "/carrito" }, { label: "Finalizar compra" }]} />
      <h1>Finalizar compra</h1>
      <CheckoutForm />
    </div>
  );
}
