"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import styles from "./PromoPopup.module.css";

const KEY = "tap-promo-visto";
const DAYS = 7;
const HIDDEN_ON = ["/checkout", "/carrito", "/pedido"];

/** Aviso de liquidación: aparece una vez cada 7 días y nunca durante la compra. */
export function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (HIDDEN_ON.some((p) => pathname.startsWith(p))) return;
    let seen = 0;
    try {
      seen = Number(localStorage.getItem(KEY) ?? 0);
    } catch {
      return;
    }
    if (Date.now() - seen < DAYS * 86400000) return;
    const timer = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const el = dialog.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* almacenamiento no disponible */
    }
  };

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      onClose={dismiss}
      onClick={(e) => e.target === e.currentTarget && dismiss()}
      aria-labelledby="promo-title"
    >
      <div className={styles.art} aria-hidden>
        <LogoMark size={120} />
        <span className={styles.tag}>hasta 30% menos</span>
      </div>
      <div className={styles.body}>
        <button type="button" className={styles.close} onClick={dismiss} aria-label="Cerrar aviso">
          <X />
        </button>
        <h2 id="promo-title">Liquidación de temporada</h2>
        <p>Alimento, arenas y accesorios con precio rebajado mientras dure el stock. Solo en la tienda online.</p>
        <Link href="/ofertas" className="btn btn--primary btn--block" onClick={dismiss}>
          Ver ofertas
        </Link>
        <button type="button" className={styles.later} onClick={dismiss}>
          Ahora no
        </button>
      </div>
    </dialog>
  );
}
