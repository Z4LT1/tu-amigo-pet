import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/server/admin";
import { LogoMark } from "@/components/ui/Logo";
import styles from "../admin.module.css";

export const metadata: Metadata = {
  title: { default: "Panel", template: "%s | Panel Tu Amigo Pet" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <LogoMark size={36} />
          <span>
            <strong>Tu Amigo Pet</strong>
            <small>Panel de la tienda</small>
          </span>
        </div>
        <AdminNav />
        <div className={styles.user}>
          <span>{session.name}</span>
          <small>{session.email}</small>
          <form action={logout}>
            <button type="submit">Cerrar sesión</button>
          </form>
        </div>
      </aside>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
