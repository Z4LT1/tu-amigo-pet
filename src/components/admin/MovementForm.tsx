"use client";

import { useActionState, useRef, useState, useEffect } from "react";
import { registerMovement, type MovementState } from "@/server/admin";
import styles from "@/app/admin/admin.module.css";

type Option = { id: string; name: string; stock: number };

/** Registro de entradas, salidas y ajustes por conteo físico. */
export function MovementForm({ products, fixedProductId }: { products?: Option[]; fixedProductId?: string }) {
  const [state, action, pending] = useActionState<MovementState, FormData>(registerMovement, {});
  const [type, setType] = useState("ENTRADA");
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) form.current?.reset();
  }, [state]);

  return (
    <form ref={form} action={action} className={styles.movement}>
      {fixedProductId ? (
        <input type="hidden" name="productId" value={fixedProductId} />
      ) : (
        <div className="field">
          <label htmlFor="mv-product">Producto</label>
          <select id="mv-product" name="productId" className="select" required>
            {products?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (stock {p.stock})
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="field">
        <label htmlFor="mv-type">Tipo</label>
        <select id="mv-type" name="type" className="select" value={type} onChange={(e) => setType(e.target.value)}>
          <option value="ENTRADA">Entrada (llegó mercadería)</option>
          <option value="SALIDA">Salida (venta en local, merma)</option>
          <option value="AJUSTE">Ajuste por conteo físico</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="mv-qty">{type === "AJUSTE" ? "Stock contado" : "Cantidad"}</label>
        <input id="mv-qty" name="quantity" type="number" min={0} className="input" required />
      </div>
      <div className="field">
        <label htmlFor="mv-reason">Motivo (opcional)</label>
        <input id="mv-reason" name="reason" className="input" placeholder="Ej: factura proveedor 1234" />
      </div>
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Registrando…" : "Registrar movimiento"}
      </button>
      {state.error && <p className="form-alert">{state.error}</p>}
      {state.ok && <p className="form-alert form-alert--ok">{state.ok}</p>}
    </form>
  );
}
