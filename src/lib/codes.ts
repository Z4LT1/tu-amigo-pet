import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomCode(length: number) {
  const bytes = randomBytes(length);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export function orderCode(date = new Date()) {
  // Fecha en hora de Chile para que el código coincida con el día de la compra
  const ymd = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Santiago", year: "2-digit", month: "2-digit", day: "2-digit" })
    .format(date)
    .replace(/-/g, "");
  return `TAP-${ymd}-${randomCode(5)}`;
}

export const appointmentCode = () => `RES-${randomCode(6)}`;

/** Orden de compra de un intento de pago (máximo 26 caracteres, según Transbank). */
export const webpayBuyOrder = (code: string) => `${code}-${randomCode(4)}`;
