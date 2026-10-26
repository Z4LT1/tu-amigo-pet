"use client";

import Link from "next/link";
import { ShoppingBag, Trash2 } from "lucide-react";
import { FreeShippingMeter } from "@/components/layout/Overlays";
import { ProductThumb } from "@/components/product/ProductThumb";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatCLP } from "@/lib/format";
import { useMounted } from "@/lib/use-mounted";
import styles from "./checkout.module.css";

export function CartPage() {
  const { items, setQuantity, remove } = useCart();
  const mounted = useMounted();
  const subtotal = cartSubtotal(items);

  if (!mounted) return <div className={styles.skeleton} />;

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <ShoppingBag />
        <h2>Tu carrito está vacío</h2>
        <p className="muted">Agrega alimento, arena o lo que tu mascota necesite.</p>
        <Link href="/tienda" className="btn btn--primary">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <ul role="list" className={styles.cartList}>
        {items.map((item) => (
          <li key={item.productId} className={styles.cartLine}>
            <Link href={`/producto/${item.slug}`} className={styles.cartThumb}>
              <ProductThumb name={item.name} brand={item.brand} color={item.packColor} icon={item.categoryIcon} imageUrl={item.imageUrl} />
            </Link>
            <div className={styles.cartInfo}>
              <span className={styles.cartBrand}>{item.brand}</span>
              <Link href={`/producto/${item.slug}`} className={styles.cartName}>
                {item.name}
              </Link>
              <span className="muted">
                {item.presentation}, {formatCLP(item.price)} c/u
              </span>
            </div>
            <QuantityStepper value={item.quantity} max={item.stock} onChange={(n) => setQuantity(item.productId, n)} />
            <strong className={styles.cartTotal}>{formatCLP(item.price * item.quantity)}</strong>
            <button type="button" className={styles.cartRemove} onClick={() => remove(item.productId)} aria-label={`Quitar ${item.name}`}>
              <Trash2 />
            </button>
          </li>
        ))}
      </ul>

      <aside className={styles.summary}>
        <h2>Resumen</h2>
        <FreeShippingMeter subtotal={subtotal} />
        <dl className={styles.totals}>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCLP(subtotal)}</dd>
          </div>
          <div>
            <dt>Despacho</dt>
            <dd className="muted">Se calcula al elegir la entrega</dd>
          </div>
        </dl>
        <Link href="/checkout" className="btn btn--primary btn--block">
          Continuar con la compra
        </Link>
        <Link href="/tienda" className={styles.keep}>
          Seguir comprando
        </Link>
      </aside>
    </div>
  );
}
