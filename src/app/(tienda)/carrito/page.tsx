import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { CartPage } from "@/components/checkout/CartPage";
import styles from "@/components/checkout/checkout.module.css";

export const metadata: Metadata = { title: "Carrito", robots: { index: false } };

export default function Page() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Carrito" }]} />
      <h1>Tu carrito</h1>
      <CartPage />
    </div>
  );
}
