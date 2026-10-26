"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { requestAppointment, type AppointmentState } from "@/server/appointments";
import { formatCLP, formatYMD } from "@/lib/format";
import { ServiceIcon } from "./ServiceIcon";
import styles from "@/app/(tienda)/servicios/agendar/booking.module.css";

type ServiceOption = { id: string; name: string; summary: string; priceFrom: number | null; kind: string; icon: string; durationMin: number };
type Slot = { time: string; available: boolean; remaining?: number };

const DAY = new Intl.DateTimeFormat("es-CL", { weekday: "short", timeZone: "UTC" });
const NUM = new Intl.DateTimeFormat("es-CL", { day: "numeric", month: "short", timeZone: "UTC" });

function nextDays(today: string, count: number, skipSaturday: boolean) {
  const [y, m, d] = today.split("-").map(Number);
  const out: { ymd: string; date: Date }[] = [];
  for (let i = 0; out.length < count && i < 40; i++) {
    const date = new Date(Date.UTC(y, m - 1, d + i));
    const wd = date.getUTCDay();
    if (wd === 0 || (skipSaturday && wd === 6)) continue;
    out.push({ ymd: date.toISOString().slice(0, 10), date });
  }
  return out;
}

export function BookingForm({ services, today, preselected }: { services: ServiceOption[]; today: string; preselected?: string }) {
  const [state, action, pending] = useActionState<AppointmentState, FormData>(requestAppointment, { status: "idle" });
  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? state.errors : {};

  const [serviceId, setServiceId] = useState(values?.serviceId ?? preselected ?? "");
  const [date, setDate] = useState(values?.date ?? "");
  const [time, setTime] = useState(values?.time ?? "");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);

  const service = services.find((s) => s.id === serviceId);
  const isDaycare = service?.kind === "GUARDERIA";
  const days = useMemo(() => nextDays(today, 14, isDaycare), [today, isDaycare]);

  useEffect(() => {
    if (!serviceId || !date) {
      setSlots(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/slots?serviceId=${serviceId}&date=${date}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setSlots(d.slots))
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [serviceId, date, state]);

  if (state.status === "success") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.successIcon}>
          <CalendarCheck />
        </span>
        <h2>Solicitud recibida</h2>
        <p>
          {state.service} para <strong>{state.petName}</strong>, el {formatYMD(state.date)} a las {state.time}.
        </p>
        <p className="muted">
          Código de reserva <strong>{state.code}</strong>. Te escribiremos para confirmar la hora. Si necesitas cambiarla, responde ese mensaje o llámanos.
        </p>
        <div className={styles.successActions}>
          <Link href="/" className="btn btn--primary">
            Volver al inicio
          </Link>
          <Link href="/farmacia" className="btn btn--ghost">
            Ver farmacia
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={action} className={styles.form} noValidate>
      {errors.form && <p className="form-alert">{errors.form}</p>}

      <fieldset className={styles.step}>
        <legend>
          <span>1</span> ¿Qué necesitas?
        </legend>
        <div className={styles.services}>
          {services.map((s) => (
            <label key={s.id} className={styles.service} data-kind={s.kind}>
              <input
                type="radio"
                name="serviceId"
                value={s.id}
                checked={serviceId === s.id}
                onChange={() => {
                  setServiceId(s.id);
                  setTime("");
                  if (s.kind === "GUARDERIA" && date && new Date(`${date}T12:00:00Z`).getUTCDay() === 6) setDate("");
                }}
              />
              <ServiceIcon name={s.icon} className={styles.serviceIcon} />
              <span className={styles.serviceName}>{s.name}</span>
              <span className={styles.servicePrice}>{s.priceFrom ? `desde ${formatCLP(s.priceFrom)}` : "Consultar"}</span>
            </label>
          ))}
        </div>
        {errors.serviceId && <p className="field-error">{errors.serviceId}</p>}
      </fieldset>

      <fieldset className={styles.step} disabled={!serviceId}>
        <legend>
          <span>2</span> {isDaycare ? "Día y hora de ingreso" : "Día y hora"}
        </legend>
        <div className={styles.days} role="radiogroup" aria-label="Día">
          {days.map((d) => (
            <label key={d.ymd} className={styles.day}>
              <input
                type="radio"
                name="date"
                value={d.ymd}
                checked={date === d.ymd}
                onChange={() => {
                  setDate(d.ymd);
                  setTime("");
                }}
              />
              <span>{d.ymd === today ? "Hoy" : DAY.format(d.date)}</span>
              <strong>{NUM.format(d.date)}</strong>
            </label>
          ))}
        </div>

        {date && (
          <div className={styles.slots} aria-busy={loading}>
            {loading && !slots ? (
              <p className="muted">Buscando horarios…</p>
            ) : slots && slots.length > 0 ? (
              <>
                {isDaycare && slots[0]?.remaining !== undefined && (
                  <p className={styles.remaining}>{slots[0].remaining > 0 ? `Quedan ${slots[0].remaining} cupos ese día` : "No quedan cupos ese día"}</p>
                )}
                <div className={styles.times} role="radiogroup" aria-label="Hora">
                  {slots.map((s) => (
                    <label key={s.time} className={styles.time} data-disabled={!s.available}>
                      <input type="radio" name="time" value={s.time} checked={time === s.time} disabled={!s.available} onChange={() => setTime(s.time)} />
                      <span>{s.time}</span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <p className="muted">No hay horarios ese día. Prueba con otra fecha.</p>
            )}
          </div>
        )}
        {(errors.date || errors.time) && <p className="field-error">{errors.time ?? errors.date}</p>}
      </fieldset>

      <fieldset className={styles.step} disabled={!time}>
        <legend>
          <span>3</span> Tus datos y los de tu mascota
        </legend>
        <div className={styles.fields}>
          <div className="field">
            <label htmlFor="petName">Nombre de tu mascota</label>
            <input id="petName" name="petName" className="input" defaultValue={values?.petName} aria-invalid={!!errors.petName} required />
            {errors.petName && <p className="field-error">{errors.petName}</p>}
          </div>
          <div className="field">
            <label htmlFor="species">Especie</label>
            <select id="species" name="species" className="select" defaultValue={values?.species ?? "PERRO"} aria-invalid={!!errors.species}>
              <option value="PERRO">Perro</option>
              <option value="GATO">Gato</option>
              <option value="OTROS">Otra</option>
            </select>
            {errors.species && <p className="field-error">{errors.species}</p>}
          </div>
          <div className="field">
            <label htmlFor="petAge">Edad aproximada (opcional)</label>
            <input id="petAge" name="petAge" className="input" placeholder="Ej: 3 años" defaultValue={values?.petAge} />
          </div>
          <div className="field">
            <label htmlFor="ownerName">Tu nombre</label>
            <input id="ownerName" name="ownerName" className="input" autoComplete="name" defaultValue={values?.ownerName} aria-invalid={!!errors.ownerName} required />
            {errors.ownerName && <p className="field-error">{errors.ownerName}</p>}
          </div>
          <div className="field">
            <label htmlFor="phone">Celular</label>
            <input id="phone" name="phone" type="tel" className="input" autoComplete="tel" placeholder="+56 9 1234 5678" defaultValue={values?.phone} aria-invalid={!!errors.phone} required />
            {errors.phone && <p className="field-error">{errors.phone}</p>}
          </div>
          <div className="field">
            <label htmlFor="email">Correo</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" defaultValue={values?.email} aria-invalid={!!errors.email} required />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div className={`field ${styles.full}`}>
            <label htmlFor="notes">{isDaycare ? "Carácter, alimentación o cuidados especiales (opcional)" : "Motivo de la consulta (opcional)"}</label>
            <textarea id="notes" name="notes" className="textarea" defaultValue={values?.notes} />
          </div>
        </div>
      </fieldset>

      <div className={styles.submit}>
        {service && date && time && (
          <p>
            {service.name}, {formatYMD(date)} a las {time}
          </p>
        )}
        <button type="submit" className={isDaycare ? "btn btn--primary" : "btn btn--sky"} disabled={!time || pending}>
          {pending ? "Enviando…" : "Solicitar hora"}
        </button>
      </div>
    </form>
  );
}
