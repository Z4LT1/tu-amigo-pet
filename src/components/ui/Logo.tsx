import Link from "next/link";
import { site } from "@/config/site";
import styles from "./Logo.module.css";

/**
 * Isotipo inspirado en el perro pintado en la cortina del local:
 * mancha negra en el ojo, nariz de corazón y pañoleta roja con huellas.
 */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className={className}>
      <defs>
        <clipPath id="tap-mark-clip">
          <rect width="48" height="48" rx="13" />
        </clipPath>
      </defs>
      <g clipPath="url(#tap-mark-clip)">
        <rect width="48" height="48" fill="var(--brand)" />
        {/* líneas de cortina */}
        <g stroke="#fff" strokeOpacity="0.12" strokeWidth="1">
          <path d="M0 8h48M0 14h48M0 20h48M0 26h48M0 32h48M0 38h48M0 44h48" />
        </g>
        {/* orejas */}
        <path d="M11 12c-5 2-7 9-5 15 1 2 4 2 5 0l3-10Z" fill="var(--ink)" />
        <path d="M37 12c5 2 7 9 5 15-1 2-4 2-5 0l-3-10Z" fill="var(--ink)" />
        {/* cabeza */}
        <path d="M24 9c8 0 13 6 13 13 0 7-5 12-13 12s-13-5-13-12C11 15 16 9 24 9Z" fill="#fff" />
        {/* mancha en el ojo */}
        <path d="M27 14c4-1 7 2 7 6s-3 6-6 5c-3-1-4-3-4-6 0-2 1-4 3-5Z" fill="var(--ink)" />
        <circle cx="18.5" cy="20" r="1.8" fill="var(--ink)" />
        <circle cx="29" cy="20" r="1.8" fill="#fff" />
        <circle cx="29.3" cy="20.3" r="0.9" fill="var(--ink)" />
        {/* nariz de corazón */}
        <path d="M24 29.5c-3-1.8-3.6-4-2-4.7.9-.3 1.6.2 2 .8.4-.6 1.1-1.1 2-.8 1.6.7 1 2.9-2 4.7Z" fill="var(--ink)" />
        {/* pañoleta */}
        <path d="M9 33h30l-15 15Z" fill="var(--red)" />
        <g fill="#fff">
          <circle cx="17" cy="37" r="1.3" />
          <circle cx="24" cy="41" r="1.3" />
          <circle cx="31" cy="37" r="1.3" />
        </g>
      </g>
    </svg>
  );
}

export function Logo({ href = "/", compact = false, inverted = false }: { href?: string; compact?: boolean; inverted?: boolean }) {
  return (
    <Link href={href} className={`${styles.logo} ${inverted ? styles.inverted : ""}`} aria-label={`${site.name}, ir al inicio`}>
      <LogoMark size={compact ? 36 : 44} className={styles.mark} />
      <span className={styles.word}>
        <span className={styles.name}>Tu Amigo Pet</span>
        {!compact && <span className={styles.kind}>{site.kind}</span>}
      </span>
    </Link>
  );
}
