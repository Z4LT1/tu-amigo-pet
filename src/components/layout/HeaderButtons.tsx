"use client";

import { ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useMounted } from "@/lib/use-mounted";
import styles from "./Panels.module.css";

export function MenuButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const open = useUI((s) => s.open);
  return (
    <button type="button" className={`${styles.iconBtn} ${className ?? ""}`} onClick={() => open("menu")} aria-label="Abrir menú">
      {children}
    </button>
  );
}

export function CartButton() {
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const mounted = useMounted();
  const count = mounted ? cartCount(items) : 0;
  return (
    <button type="button" className={styles.cartBtn} onClick={openCart} aria-label={`Abrir carrito, ${count} productos`}>
      <ShoppingBag />
      <span className={styles.cartLabel}>Carrito</span>
      {count > 0 && (
        <span key={count} className={styles.count}>
          {count}
        </span>
      )}
    </button>
  );
}
