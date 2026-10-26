import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/Logo";
import { LoginForm } from "./LoginForm";
import styles from "../admin.module.css";

export const metadata: Metadata = { title: "Ingreso al panel", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        <LogoMark size={56} />
        <h1>Panel de la tienda</h1>
        <p className="muted">Inventario, pedidos y agenda de Tu Amigo Pet.</p>
        <LoginForm />
      </div>
    </div>
  );
}
