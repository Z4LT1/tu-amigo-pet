"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { appointmentCode } from "@/lib/codes";
import { appointmentSchema, fieldErrors } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { availableSlots } from "@/lib/agenda";

export type AppointmentState =
  | { status: "idle" }
  | { status: "error"; errors: Record<string, string>; values?: Record<string, string> }
  | { status: "success"; code: string; date: string; time: string; service: string; petName: string };

export async function requestAppointment(_: AppointmentState, formData: FormData): Promise<AppointmentState> {
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  const values = Object.fromEntries([...formData.entries()].map(([k, v]) => [k, String(v)]));
  if (!rateLimit(`appointment:${ip}`, 5, 60_000).ok) {
    return { status: "error", errors: { form: "Demasiadas solicitudes. Intenta nuevamente en un minuto." }, values };
  }

  const parsed = appointmentSchema.safeParse(values);
  if (!parsed.success) return { status: "error", errors: fieldErrors(parsed.error), values };
  const data = parsed.data;

  const service = await prisma.service.findFirst({ where: { id: data.serviceId, isActive: true } });
  if (!service) return { status: "error", errors: { serviceId: "El servicio no está disponible." }, values };

  if (service.kind === "GUARDERIA" && data.species !== "PERRO") {
    return { status: "error", errors: { species: "La guardería de día está disponible solo para perros." }, values };
  }
  const slots = await availableSlots(data.date, service.kind === "GUARDERIA" ? "GUARDERIA" : "CLINICA");
  if (!slots.find((s) => s.time === data.time && s.available)) {
    return { status: "error", errors: { time: "Ese horario ya no está disponible. Elige otro." }, values };
  }

  const appointment = await prisma.appointment.create({
    data: { ...data, petAge: data.petAge || null, notes: data.notes || null, code: appointmentCode() },
  });

  return {
    status: "success",
    code: appointment.code,
    date: appointment.date,
    time: appointment.time,
    service: service.name,
    petName: appointment.petName,
  };
}

export async function subscribeNewsletter(_: unknown, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, message: "Ingresa un correo válido." };
  await prisma.subscriber.upsert({ where: { email }, update: {}, create: { email } });
  return { ok: true, message: "¡Listo! Te avisaremos de ofertas y novedades." };
}
