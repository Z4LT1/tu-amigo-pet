import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { availableSlots } from "@/lib/agenda";

/** Horarios disponibles para un servicio en una fecha (YYYY-MM-DD). */
export async function GET(request: NextRequest) {
  const date = request.nextUrl.searchParams.get("date") ?? "";
  const serviceId = request.nextUrl.searchParams.get("serviceId") ?? "";
  const service = await prisma.service.findFirst({ where: { id: serviceId, isActive: true }, select: { kind: true } });
  if (!service) return NextResponse.json({ slots: [] }, { status: 404 });
  const slots = await availableSlots(date, service.kind === "GUARDERIA" ? "GUARDERIA" : "CLINICA");
  return NextResponse.json({ slots }, { headers: { "Cache-Control": "no-store" } });
}
