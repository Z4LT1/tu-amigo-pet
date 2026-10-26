"use client";

import { useActionState } from "react";
import { login } from "@/server/admin";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, null);
  return (
    <form action={action} style={{ display: "grid", gap: "1rem", width: "100%" }}>
      {state?.error && <p className="form-alert">{state.error}</p>}
      <div className="field">
        <label htmlFor="email">Correo</label>
        <input id="email" name="email" type="email" className="input" autoComplete="username" required />
      </div>
      <div className="field">
        <label htmlFor="password">Contraseña</label>
        <input id="password" name="password" type="password" className="input" autoComplete="current-password" required />
      </div>
      <button type="submit" className="btn btn--primary btn--block" disabled={pending}>
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
