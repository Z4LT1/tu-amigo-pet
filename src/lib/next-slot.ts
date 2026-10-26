import "server-only";
import { availableSlots, nowInChile } from "./agenda";

/** Primer bloque libre de la clínica en los próximos 14 días. */
export async function nextClinicSlot() {
  const { date } = nowInChile();
  const [y, m, d] = date.split("-").map(Number);
  for (let i = 0; i < 14; i++) {
    const day = new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10);
    const slot = (await availableSlots(day, "CLINICA")).find((s) => s.available);
    if (slot) return { date: day, time: slot.time, isToday: i === 0, isTomorrow: i === 1 };
  }
  return null;
}
