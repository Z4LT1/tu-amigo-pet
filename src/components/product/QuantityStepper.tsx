"use client";

import { Minus, Plus } from "lucide-react";
import styles from "./QuantityStepper.module.css";

export function QuantityStepper({
  value,
  max,
  onChange,
  size = "md",
  label = "Cantidad",
}: {
  value: number;
  max: number;
  onChange: (n: number) => void;
  size?: "sm" | "md";
  label?: string;
}) {
  return (
    <div className={`${styles.stepper} ${size === "sm" ? styles.sm : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Quitar uno">
        <Minus />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Agregar uno">
        <Plus />
      </button>
    </div>
  );
}
