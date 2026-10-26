import "server-only";
import { prisma } from "./db";
import { APPOINTMENT_SLOTS, DAYCARE_CAPACITY, DAYCARE_SLOTS, SATURDAY_SLOTS } from "./constants";

/** Fecha y hora actuales en Chile continental, en formato YYYY-MM-DD / HH:mm. */
export function nowInChile() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Santiago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "00";
  return { date: `${get("year")}-${get("month")}-${get("day")}`, time: `${get("hour")}:${get("minute")}` };
}

const weekday = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export type Slot = { time: string; available: boolean; remaining?: number };

/**
 * Disponibilidad del día según el tipo de servicio:
 * - CLINICA: un box de atención, cada bloque admite una sola reserva.
 * - GUARDERIA: cupos diarios compartidos (lunes a viernes), con horarios de ingreso.
 */
export async function availableSlots(date: string, kind: "CLINICA" | "GUARDERIA" = "CLINICA"): Promise<Slot[]> {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
  const day = weekday(date);
  const now = nowInChile();
  if (day === 0 || date < now.date) return [];

  const booked = await prisma.appointment.findMany({
    where: { date, status: { not: "CANCELADA" }, service: { kind } },
    select: { time: true },
  });
  const isPast = (time: string) => date === now.date && time <= now.time;

  if (kind === "GUARDERIA") {
    if (day === 6) return [];
    const remaining = Math.max(0, DAYCARE_CAPACITY - booked.length);
    return DAYCARE_SLOTS.map((time) => ({ time, available: remaining > 0 && !isPast(time), remaining }));
  }

  const taken = new Set(booked.map((b) => b.time));
  const base = day === 6 ? SATURDAY_SLOTS : APPOINTMENT_SLOTS;
  return base.map((time) => ({ time, available: !taken.has(time) && !isPast(time) }));
}
