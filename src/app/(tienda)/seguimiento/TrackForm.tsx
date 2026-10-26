"use client";

import { useActionState } from "react";
import { trackOrder } from "@/server/orders";

export function TrackForm() {
  const [state, action, pending] = useActionState(trackOrder, null);
  return (
    <form action={action} style={{ display: "grid", gap: "1rem" }}>
      {state?.error && <p className="form-alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="code">Número de pedido</label>
        <input id="code" name="code" className="input" placeholder="TAP-261025-XXXXX" required autoCapitalize="characters" />
      </div>
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" className="input" required autoComplete="email" />
      </div>
      <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
        {pending ? "Buscando…" : "Ver estado del pedido"}
      </button>
    </form>
  );
}
