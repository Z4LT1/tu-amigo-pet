"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, CalendarDays, ClipboardList, ExternalLink, LayoutDashboard, Package } from "lucide-react";
import styles from "@/app/admin/admin.module.css";

const links = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard, exact: true },
  { href: "/admin/pedidos", label: "Pedidos", icon: ClipboardList },
  { href: "/admin/productos", label: "Productos", icon: Package },
  { href: "/admin/inventario", label: "Inventario", icon: Boxes },
  { href: "/admin/reservas", label: "Agenda", icon: CalendarDays },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Panel">
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            <Icon />
            {label}
          </Link>
        );
      })}
      <Link href="/" target="_blank" className={styles.navStore}>
        <ExternalLink />
        Ver tienda
      </Link>
    </nav>
  );
}
