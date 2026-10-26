import { z } from "zod";
import { REGIONS } from "./constants";

const phone = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine((v) => /^(\+?56)?9\d{8}$/.test(v), "Ingresa un celular chileno válido (ej: +56 9 1234 5678).");

/** Valida un RUT chileno con dígito verificador (módulo 11). */
export function isValidRut(raw: string) {
  const clean = raw.replace(/[.\-\s]/g, "").toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(clean)) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const dvCalc = expected === 11 ? "0" : expected === 10 ? "K" : String(expected);
  return dv === dvCalc;
}

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(3, "Ingresa tu nombre completo.").max(80),
    email: z.string().trim().toLowerCase().email("Ingresa un correo válido."),
    phone,
    rut: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || isValidRut(v), "El RUT no es válido."),
    deliveryMethod: z.enum(["DESPACHO", "RETIRO"]),
    address: z.string().trim().max(120).optional(),
    comuna: z.string().trim().max(60).optional(),
    region: z.enum(REGIONS).optional(),
    notes: z.string().trim().max(300).optional(),
    paymentMethod: z.enum(["WEBPAY", "TRANSFERENCIA", "EFECTIVO_RETIRO"]),
    items: z
      .array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(50) }))
      .min(1, "Tu carrito está vacío."),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "DESPACHO") {
      if (!data.address || data.address.length < 5) ctx.addIssue({ code: "custom", path: ["address"], message: "Ingresa la dirección de despacho." });
      if (!data.comuna) ctx.addIssue({ code: "custom", path: ["comuna"], message: "Ingresa la comuna." });
      if (!data.region) ctx.addIssue({ code: "custom", path: ["region"], message: "Selecciona la región." });
      if (data.paymentMethod === "EFECTIVO_RETIRO") ctx.addIssue({ code: "custom", path: ["paymentMethod"], message: "El pago en tienda solo aplica para retiro." });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const appointmentSchema = z.object({
  serviceId: z.string().min(1, "Selecciona un servicio."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Selecciona una fecha."),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Selecciona un horario."),
  ownerName: z.string().trim().min(3, "Ingresa tu nombre.").max(80),
  email: z.string().trim().toLowerCase().email("Ingresa un correo válido."),
  phone,
  petName: z.string().trim().min(1, "Ingresa el nombre de tu mascota.").max(40),
  species: z.enum(["PERRO", "GATO", "OTROS"]),
  petAge: z.string().trim().max(30).optional(),
  notes: z.string().trim().max(400).optional(),
});

/**
 * Montos opcionales del formulario: un campo vacío (o 0) significa "sin valor".
 * Sin este paso, z.coerce convierte "" en 0 y el producto aparecería como oferta.
 */
const optionalAmount = z.preprocess(
  (v) => (v === "" || v === null || v === undefined || Number(v) === 0 ? undefined : v),
  z.coerce.number().int().positive("Ingresa un monto mayor a cero.").optional(),
);

export const productSchema = z.object({
  name: z.string().trim().min(3).max(120),
  sku: z.string().trim().min(2).max(40),
  shortDescription: z.string().trim().min(10).max(200),
  description: z.string().trim().min(10).max(4000),
  price: z.coerce.number().int().min(0),
  compareAtPrice: optionalAmount,
  cost: optionalAmount,
  minStock: z.coerce.number().int().min(0),
  species: z.enum(["PERRO", "GATO", "AMBOS", "OTROS"]),
  lifeStage: z.enum(["CACHORRO", "ADULTO", "SENIOR", "TODAS"]),
  presentation: z.string().trim().min(1).max(60),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  packColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  imageUrl: z
    .string()
    .trim()
    .refine((v) => /^https:\/\/\S+$/.test(v) || /^\/uploads\/[\w.-]+$/.test(v), "Usa una dirección que empiece con https:// o sube una foto.")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  isActive: z.coerce.boolean(),
  isFeatured: z.coerce.boolean(),
  requiresPrescription: z.coerce.boolean(),
});

export const stockMovementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(["ENTRADA", "SALIDA", "AJUSTE"]),
  quantity: z.coerce.number().int(),
  reason: z.string().trim().max(160).optional(),
});

export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
