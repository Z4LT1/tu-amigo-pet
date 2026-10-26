export const SPECIES = {
  PERRO: "Perro",
  GATO: "Gato",
  AMBOS: "Perro y gato",
  OTROS: "Otras mascotas",
} as const;

export const LIFE_STAGES = {
  CACHORRO: "Cachorro / gatito",
  ADULTO: "Adulto",
  SENIOR: "Senior",
  TODAS: "Todas las edades",
} as const;

export const ORDER_STATUS = {
  PENDIENTE: { label: "Pendiente de pago", tone: "amber" },
  PAGADO: { label: "Pagado", tone: "blue" },
  PREPARANDO: { label: "En preparación", tone: "violet" },
  ENVIADO: { label: "Enviado", tone: "sky" },
  ENTREGADO: { label: "Entregado", tone: "green" },
  CANCELADO: { label: "Cancelado", tone: "red" },
} as const;

export const APPOINTMENT_STATUS = {
  SOLICITADA: { label: "Solicitada", tone: "amber" },
  CONFIRMADA: { label: "Confirmada", tone: "blue" },
  COMPLETADA: { label: "Completada", tone: "green" },
  CANCELADA: { label: "Cancelada", tone: "red" },
} as const;

export const MOVEMENT_TYPES = {
  ENTRADA: "Entrada",
  SALIDA: "Salida",
  AJUSTE: "Ajuste",
  VENTA: "Venta web",
  DEVOLUCION: "Devolución",
} as const;

export const PAYMENT_METHODS = {
  WEBPAY: "Webpay (débito / crédito)",
  TRANSFERENCIA: "Transferencia bancaria",
  EFECTIVO_RETIRO: "Pago al retirar en tienda",
} as const;

export const DELIVERY_METHODS = {
  DESPACHO: "Despacho a domicilio",
  RETIRO: "Retiro en tienda",
} as const;

export const REGIONS = [
  "Región de Arica y Parinacota",
  "Región de Tarapacá",
  "Región de Antofagasta",
  "Región de Atacama",
  "Región de Coquimbo",
  "Región de Valparaíso",
  "Región Metropolitana",
  "Región del Libertador General Bernardo O'Higgins",
  "Región del Maule",
  "Región de Ñuble",
  "Región del Biobío",
  "Región de La Araucanía",
  "Región de Los Ríos",
  "Región de Los Lagos",
  "Región de Aysén",
  "Región de Magallanes",
] as const;

/** Horario base de atención para la agenda de servicios. */
export const APPOINTMENT_SLOTS = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];
export const SATURDAY_SLOTS = ["10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00"];
/** Guardería: horarios de ingreso y cupos diarios. */
export const DAYCARE_SLOTS = ["08:00", "08:30", "09:00", "09:30"];
export const DAYCARE_CAPACITY = 12;

export type Tone = "amber" | "blue" | "violet" | "sky" | "green" | "red" | "slate";
