import Link from "next/link";
import { LogoMark } from "@/components/ui/Logo";
import styles from "./info.module.css";

export default function NotFound() {
  return (
    <div className={`container ${styles.page}`} style={{ display: "grid", justifyItems: "start", gap: "1rem", paddingTop: "4rem" }}>
      <LogoMark size={72} />
      <h1>Esta página se escapó</h1>
      <p className={styles.lead}>El producto o la página que buscas ya no está disponible o cambió de dirección. Prueba con el buscador o vuelve a la tienda.</p>
      <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
        <Link href="/tienda" className="btn btn--primary">
          Ir a la tienda
        </Link>
        <Link href="/" className="btn btn--ghost">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
