"use client";

import { useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { type CartItem, useCart } from "@/lib/cart-store";
import styles from "./ProductCard.module.css";

export function AddToCartButton({
  item,
  quantity = 1,
  compact = false,
  disabled = false,
  disabledLabel = "Agotado",
}: {
  item: Omit<CartItem, "quantity">;
  quantity?: number;
  compact?: boolean;
  disabled?: boolean;
  disabledLabel?: string;
}) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);

  if (disabled) {
    return (
      <button type="button" className={`btn ${compact ? "btn--sm" : ""} ${styles.add} ${styles.addDisabled}`} disabled>
        {disabledLabel}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`btn btn--primary ${compact ? "btn--sm" : ""} ${styles.add}`}
      data-added={added}
      onClick={() => {
        add(item, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 1400);
      }}
    >
      {added ? <Check /> : <ShoppingBag />}
      <span aria-live="polite">{added ? "Agregado" : "Agregar"}</span>
    </button>
  );
}
