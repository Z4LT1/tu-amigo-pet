"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { CreditCard, Landmark, Lock, Store, Truck, Wallet } from "lucide-react";
import { ProductThumb } from "@/components/product/ProductThumb";
import { site } from "@/config/site";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { REGIONS } from "@/lib/constants";
import { formatCLP } from "@/lib/format";
import { shippingCost } from "@/lib/shipping";
import { useMounted } from "@/lib/use-mounted";
import { createOrder } from "@/server/orders";
import styles from "./checkout.module.css";

type Delivery = "DESPACHO" | "RETIRO";
type Payment = "WEBPAY" | "TRANSFERENCIA" | "EFECTIVO_RETIRO";

export function CheckoutForm() {
  const router = useRouter();
  const mounted = useMounted();
  const { items, clear } = useCart();
  const [delivery, setDelivery] = useState<Delivery>("DESPACHO");
  const [region, setRegion] = useState("Región Metropolitana");
  const [payment, setPayment] = useState<Payment>("WEBPAY");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();

  const subtotal = cartSubtotal(items);
  const shipping = shippingCost(subtotal, delivery, region);
  const total = subtotal + shipping;

  if (!mounted) return <div className={styles.skeleton} />;

  if (items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <h2>No hay productos para pagar</h2>
        <p className="muted">Tu carrito está vacío. Vuelve a la tienda para agregar productos.</p>
        <Link href="/tienda" className="btn btn--primary">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const get = (k: string) => String(form.get(k) ?? "").trim() || undefined;
    startTransition(async () => {
      const result = await createOrder({
        customerName: get("customerName") ?? "",
        email: get("email") ?? "",
        phone: get("phone") ?? "",
        rut: get("rut"),
        deliveryMethod: delivery,
        address: get("address"),
        comuna: get("comuna"),
        region: delivery === "DESPACHO" ? (region as (typeof REGIONS)[number]) : undefined,
        notes: get("notes"),
        paymentMethod: payment,
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
      });
      if (!result.ok) {
        setErrors(result.errors);
        document.querySelector("[data-error-anchor]")?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      clear();
      router.push(result.next);
    });
  };

  const err = (k: string) => errors[k] && <p className="field-error">{errors[k]}</p>;
  const payOptions: { value: Payment; label: string; desc: string; icon: React.ReactNode; show: boolean }[] = [
    { value: "WEBPAY", label: "Webpay", desc: "Tarjeta de débito, crédito o prepago.", icon: <CreditCard />, show: true },
    { value: "TRANSFERENCIA", label: "Transferencia bancaria", desc: "Te mostramos los datos al confirmar el pedido.", icon: <Landmark />, show: true },
    {
      value: "EFECTIVO_RETIRO",
      label: "Pagar al retirar",
      desc: `Pagas en caja. Reservamos tu pedido por ${site.payments.pickupHoldHours} horas.`,
      icon: <Wallet />,
      show: site.payments.payOnPickup && delivery === "RETIRO",
    },
  ];

  return (
    <form className={styles.layout} onSubmit={submit} noValidate>
      <div className={styles.steps}>
        <span data-error-anchor />
        {errors.form && <p className="form-alert">{errors.form}</p>}

        <section className={styles.block} aria-labelledby="contacto">
          <h2 id="contacto">Tus datos</h2>
          <div className={styles.fields}>
            <div className={`field ${styles.full}`}>
              <label htmlFor="customerName">Nombre y apellido</label>
              <input id="customerName" name="customerName" className="input" autoComplete="name" aria-invalid={!!errors.customerName} />
              {err("customerName")}
            </div>
            <div className="field">
              <label htmlFor="email">Correo</label>
              <input id="email" name="email" type="email" className="input" autoComplete="email" aria-invalid={!!errors.email} />
              {err("email")}
            </div>
            <div className="field">
              <label htmlFor="phone">Celular</label>
              <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="+56 9 1234 5678" aria-invalid={!!errors.phone} />
              {err("phone")}
            </div>
            <div className="field">
              <label htmlFor="rut">RUT (opcional, para tu boleta)</label>
              <input id="rut" name="rut" className="input" placeholder="12.345.678-9" aria-invalid={!!errors.rut} />
              {err("rut")}
            </div>
          </div>
        </section>

        <section className={styles.block} aria-labelledby="entrega">
          <h2 id="entrega">Entrega</h2>
          <div className={styles.options}>
            <label className={styles.option}>
              <input
                type="radio"
                name="deliveryMethod"
                checked={delivery === "DESPACHO"}
                onChange={() => {
                  setDelivery("DESPACHO");
                  if (payment === "EFECTIVO_RETIRO") setPayment("WEBPAY");
                }}
              />
              <Truck />
              <span>
                <strong>Despacho a domicilio</strong>
                <small>RM en 24 a 48 horas hábiles. Regiones en 3 a 5 días.</small>
              </span>
              <em>{shippingCost(subtotal, "DESPACHO", region) === 0 ? "Gratis" : formatCLP(shippingCost(subtotal, "DESPACHO", region))}</em>
            </label>
            <label className={styles.option}>
              <input type="radio" name="deliveryMethod" checked={delivery === "RETIRO"} onChange={() => setDelivery("RETIRO")} />
              <Store />
              <span>
                <strong>Retiro en tienda</strong>
                <small>
                  {site.contact.address}. Listo el mismo día si compras antes de las 17:00.
                </small>
              </span>
              <em>Gratis</em>
            </label>
          </div>

          {delivery === "DESPACHO" && (
            <div className={styles.fields}>
              <div className={`field ${styles.full}`}>
                <label htmlFor="address">Dirección</label>
                <input id="address" name="address" className="input" autoComplete="street-address" placeholder="Calle, número, depto." aria-invalid={!!errors.address} />
                {err("address")}
              </div>
              <div className="field">
                <label htmlFor="comuna">Comuna</label>
                <input id="comuna" name="comuna" className="input" autoComplete="address-level2" aria-invalid={!!errors.comuna} />
                {err("comuna")}
              </div>
              <div className="field">
                <label htmlFor="region">Región</label>
                <select id="region" className="select" value={region} onChange={(e) => setRegion(e.target.value)} aria-invalid={!!errors.region}>
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                {err("region")}
              </div>
            </div>
          )}
          <div className="field">
            <label htmlFor="notes">Indicaciones (opcional)</label>
            <textarea id="notes" name="notes" className="textarea" placeholder="Ej: dejar con conserjería, tocar timbre 2 veces" />
          </div>
        </section>

        <section className={styles.block} aria-labelledby="pago">
          <h2 id="pago">Pago</h2>
          <div className={styles.options}>
            {payOptions
              .filter((o) => o.show)
              .map((o) => (
                <label key={o.value} className={styles.option}>
                  <input type="radio" name="paymentMethod" checked={payment === o.value} onChange={() => setPayment(o.value)} />
                  {o.icon}
                  <span>
                    <strong>{o.label}</strong>
                    <small>{o.desc}</small>
                  </span>
                </label>
              ))}
          </div>
          {err("paymentMethod")}
        </section>
      </div>

      <aside className={styles.summary}>
        <h2>Tu pedido</h2>
        <ul role="list" className={styles.summaryItems}>
          {items.map((i) => (
            <li key={i.productId}>
              <span className={styles.summaryThumb}>
                <ProductThumb name={i.name} brand={i.brand} color={i.packColor} icon={i.categoryIcon} imageUrl={i.imageUrl} size={56} />
                <em>{i.quantity}</em>
              </span>
              <span className={styles.summaryName}>
                {i.name}
                <small>{i.presentation}</small>
              </span>
              <strong>{formatCLP(i.price * i.quantity)}</strong>
            </li>
          ))}
        </ul>
        <dl className={styles.totals}>
          <div>
            <dt>Subtotal</dt>
            <dd>{formatCLP(subtotal)}</dd>
          </div>
          <div>
            <dt>{delivery === "RETIRO" ? "Retiro en tienda" : "Despacho"}</dt>
            <dd>{shipping === 0 ? "Gratis" : formatCLP(shipping)}</dd>
          </div>
          <div className={styles.grand}>
            <dt>Total</dt>
            <dd>{formatCLP(total)}</dd>
          </div>
        </dl>
        <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
          <Lock />
          {pending ? "Procesando…" : payment === "WEBPAY" ? `Pagar ${formatCLP(total)}` : "Confirmar pedido"}
        </button>
        <p className={styles.legal}>
          Al confirmar aceptas los <Link href="/terminos-y-condiciones">términos y condiciones</Link> y la{" "}
          <Link href="/politica-de-privacidad">política de privacidad</Link>.
        </p>
      </aside>
    </form>
  );
}
