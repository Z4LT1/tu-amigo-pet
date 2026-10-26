"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, House, LayoutGrid, Search, ShoppingBag } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { useUI } from "@/lib/ui-store";
import { useMounted } from "@/lib/use-mounted";
import styles from "./Panels.module.css";

/** Barra inferior tipo app, solo en teléfonos: deja las acciones clave al alcance del pulgar. */
export function BottomNav() {
  const pathname = usePathname();
  const openUI = useUI((s) => s.open);
  const items = useCart((s) => s.items);
  const openCart = useCart((s) => s.open);
  const mounted = useMounted();
  const count = mounted ? cartCount(items) : 0;

  return (
    <nav className={styles.bottomNav} aria-label="Accesos rápidos">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
        <House />
        Inicio
      </Link>
      <button type="button" onClick={() => openUI("menu")}>
        <LayoutGrid />
        Tienda
      </button>
      <button type="button" onClick={() => openUI("search")}>
        <Search />
        Buscar
      </button>
      <Link href="/servicios/agendar" aria-current={pathname.startsWith("/servicios") ? "page" : undefined}>
        <CalendarDays />
        Agendar
      </Link>
      <button type="button" onClick={openCart} className={styles.bottomCart}>
        <span>
          <ShoppingBag />
          {count > 0 && <em>{count}</em>}
        </span>
        Carrito
      </button>
    </nav>
  );
}
