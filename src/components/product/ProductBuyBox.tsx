"use client";

import { useState } from "react";
import type { CartItem } from "@/lib/cart-store";
import { discountPercent, formatCLP } from "@/lib/format";
import { site } from "@/config/site";
import { AddToCartButton } from "./AddToCartButton";
import { QuantityStepper } from "./QuantityStepper";
import styles from "./ProductBuyBox.module.css";

export function ProductBuyBox({
  product,
  compareAtPrice,
  minStock,
  requiresPrescription,
}: {
  product: Omit<CartItem, "quantity">;
  compareAtPrice: number | null;
  minStock: number;
  requiresPrescription: boolean;
}) {
  const [qty, setQty] = useState(1);
  const off = discountPercent(product.price, compareAtPrice);
  const out = product.stock <= 0;

  return (
    <div className={styles.box}>
      <div className={styles.priceLine}>
        {off > 0 ? (
          <>
            <span className={styles.tag}>{formatCLP(product.price)}</span>
            <span className={styles.was}>
              Antes <s>{formatCLP(compareAtPrice!)}</s>
            </span>
          </>
        ) : (
          <span className={styles.price}>{formatCLP(product.price)}</span>
        )}
      </div>
      <p className={styles.unit}>{product.presentation}</p>

      <p className={styles.stock} data-state={out ? "out" : product.stock <= minStock ? "low" : "ok"}>
        {out ? "Sin stock por ahora" : product.stock <= minStock ? `Últimas ${product.stock} unidades` : "Disponible para despacho y retiro"}
      </p>

      {requiresPrescription ? (
        <div className={styles.rx}>
          <strong>Requiere receta del médico veterinario.</strong> Este medicamento se vende solo en el local, presentando la receta. Llámanos al{" "}
          {site.contact.phone} para reservarlo.
        </div>
      ) : out ? (
        <a className="btn btn--ghost btn--block" href={`https://wa.me/${site.contact.whatsapp}?text=${encodeURIComponent(`Hola, ¿cuándo vuelve a llegar ${product.name}?`)}`} target="_blank" rel="noopener noreferrer">
          Avisarme por WhatsApp cuando llegue
        </a>
      ) : (
        <div className={styles.actions}>
          <QuantityStepper value={qty} max={product.stock} onChange={setQty} />
          <AddToCartButton item={product} quantity={qty} />
        </div>
      )}

      {!out && !requiresPrescription && (
        <div className={styles.mobileBar}>
          <div>
            <strong>{formatCLP(product.price * qty)}</strong>
            <span>{qty > 1 ? `${qty} unidades` : product.presentation}</span>
          </div>
          <AddToCartButton item={product} quantity={qty} />
        </div>
      )}
    </div>
  );
}
