"use client";

import { useActionState, useEffect, useRef } from "react";
import type { WebpayStart } from "@/server/orders";

type Props = { action: (state: WebpayStart) => Promise<WebpayStart> };

/** Crea la transacción y envía al cliente al formulario de Webpay, que exige un POST con el token. */
export function WebpayButton({ action }: Props) {
  const [state, start, pending] = useActionState(action, {});
  const redirectForm = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.url) redirectForm.current?.submit();
  }, [state.url]);

  const busy = pending || Boolean(state.url);

  return (
    <>
      {state.error && <p role="alert">{state.error}</p>}
      <form action={start}>
        <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
          {busy ? "Conectando con Webpay…" : "Pagar con Webpay"}
        </button>
      </form>
      {state.url && (
        <form ref={redirectForm} method="post" action={state.url} hidden>
          <input type="hidden" name="token_ws" value={state.token} />
        </form>
      )}
    </>
  );
}
