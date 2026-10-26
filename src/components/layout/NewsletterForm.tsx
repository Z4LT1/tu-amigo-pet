"use client";

import { useActionState } from "react";
import { subscribeNewsletter } from "@/server/appointments";
import styles from "./SiteFooter.module.css";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribeNewsletter, null);
  return (
    <form action={action} className={styles.newsForm}>
      <label htmlFor="newsletter-email" className="visually-hidden">
        Correo electrónico
      </label>
      <input id="newsletter-email" name="email" type="email" required placeholder="tu@correo.cl" className={styles.newsInput} />
      <button type="submit" className="btn btn--primary" disabled={pending}>
        {pending ? "Suscribiendo…" : "Suscribirme"}
      </button>
      {state && (
        <p role="status" className={state.ok ? styles.newsOk : styles.newsErr}>
          {state.message}
        </p>
      )}
    </form>
  );
}
