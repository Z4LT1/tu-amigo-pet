"use server";

import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";
import { fieldErrors, productSchema, stockMovementSchema } from "@/lib/validators";
import { slugify } from "@/lib/format";
import { APPOINTMENT_STATUS, ORDER_STATUS } from "@/lib/constants";

// ─── Sesión ──────────────────────────────────────────────────────────────────

export async function login(_: unknown, formData: FormData) {
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(`login:${ip}`, 5, 5 * 60_000).ok) {
    return { error: "Demasiados intentos. Espera unos minutos." };
  }
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const user = await prisma.adminUser.findUnique({ where: { email } });
  // Se compara siempre contra un hash para no revelar si el correo existe
  const valid = await bcrypt.compare(password, user?.passwordHash ?? "$2b$10$.m3bToS80YGLZJ5C/7.O3.5fQjzLwqmf6W3i1aNn4qFM4VwKWb0Pi");
  if (!user || !valid) return { error: "Correo o contraseña incorrectos." };

  const token = await signSession({ sub: user.id, email: user.email, name: user.name });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// ─── Productos ───────────────────────────────────────────────────────────────

export type ProductFormState = { errors?: Record<string, string>; saved?: boolean };

export async function saveProduct(id: string | null, _: ProductFormState, formData: FormData): Promise<ProductFormState> {
  const session = await requireAdmin();
  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse({
    ...raw,
    isActive: raw.isActive === "on",
    isFeatured: raw.isFeatured === "on",
    requiresPrescription: raw.requiresPrescription === "on",
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const data = parsed.data;
  if (data.compareAtPrice && data.compareAtPrice <= data.price) {
    return { errors: { compareAtPrice: "El precio anterior debe ser mayor al precio de venta." } };
  }

  const duplicate = await prisma.product.findFirst({ where: { sku: data.sku, NOT: id ? { id } : undefined } });
  if (duplicate) return { errors: { sku: "Ya existe un producto con ese SKU." } };

  const payload = {
    ...data,
    compareAtPrice: data.compareAtPrice ?? null,
    cost: data.cost ?? null,
    imageUrl: data.imageUrl ?? null,
  };

  if (id) {
    await prisma.product.update({ where: { id }, data: payload });
  } else {
    let slug = slugify(data.name);
    if (await prisma.product.findUnique({ where: { slug } })) slug = `${slug}-${Date.now().toString(36)}`;
    const initialStock = Math.max(0, Number(formData.get("initialStock")) || 0);
    const created = await prisma.product.create({ data: { ...payload, slug, stock: initialStock } });
    if (initialStock > 0) {
      await prisma.inventoryMovement.create({
        data: { productId: created.id, type: "ENTRADA", quantity: initialStock, stockAfter: initialStock, reason: "Stock inicial", createdBy: session.name },
      });
    }
    revalidatePath("/", "layout");
    redirect(`/admin/productos/${created.id}?creado=1`);
  }
  revalidatePath("/", "layout");
  return { saved: true };
}

export async function toggleProductActive(id: string) {
  await requireAdmin();
  const product = await prisma.product.findUniqueOrThrow({ where: { id } });
  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/", "layout");
}

// ─── Inventario ──────────────────────────────────────────────────────────────

export type MovementState = { error?: string; ok?: string };

export async function registerMovement(_: MovementState, formData: FormData): Promise<MovementState> {
  const session = await requireAdmin();
  const parsed = stockMovementSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: Object.values(fieldErrors(parsed.error))[0] };
  const { productId, type, reason } = parsed.data;
  let { quantity } = parsed.data;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Producto no encontrado." };

  // AJUSTE fija el stock al valor contado; ENTRADA/SALIDA suman o restan
  if (type === "AJUSTE") {
    if (quantity < 0) return { error: "El conteo físico no puede ser negativo." };
    quantity = quantity - product.stock;
    if (quantity === 0) return { error: "El stock contado coincide con el sistema; no hay nada que ajustar." };
  } else {
    if (quantity <= 0) return { error: "La cantidad debe ser mayor a cero." };
    if (type === "SALIDA") quantity = -quantity;
  }
  const stockAfter = product.stock + quantity;
  if (stockAfter < 0) return { error: `No puedes descontar más de ${product.stock} unidades.` };

  await prisma.$transaction([
    prisma.product.update({ where: { id: productId }, data: { stock: stockAfter } }),
    prisma.inventoryMovement.create({
      data: { productId, type, quantity, stockAfter, reason: reason || null, createdBy: session.name },
    }),
  ]);
  revalidatePath("/admin", "layout");
  revalidatePath(`/producto/${product.slug}`);
  return { ok: `${product.name}: stock actualizado a ${stockAfter} unidades.` };
}

// ─── Pedidos ─────────────────────────────────────────────────────────────────

export async function updateOrderStatus(id: string, formData: FormData) {
  const session = await requireAdmin();
  const status = String(formData.get("status"));
  if (!(status in ORDER_STATUS)) return;

  const order = await prisma.order.findUniqueOrThrow({ where: { id }, include: { items: true } });
  if (order.status === status) return;
  if (order.status === "CANCELADO") return; // un pedido cancelado no se reabre

  await prisma.$transaction(async (tx) => {
    // Condicional: con doble clic en "cancelar", el stock se devuelve una sola vez
    const changed = await tx.order.updateMany({ where: { id, status: { not: "CANCELADO" } }, data: { status } });
    if (changed.count === 0) return;
    if (status === "CANCELADO") {
      for (const item of order.items) {
        const p = await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        await tx.inventoryMovement.create({
          data: { productId: item.productId, type: "DEVOLUCION", quantity: item.quantity, stockAfter: p.stock, reference: order.code, reason: "Pedido cancelado", createdBy: session.name },
        });
      }
    }
  });
  revalidatePath("/admin", "layout");
}

// ─── Reservas ────────────────────────────────────────────────────────────────

export async function updateAppointmentStatus(id: string, formData: FormData) {
  await requireAdmin();
  const status = String(formData.get("status"));
  if (!(status in APPOINTMENT_STATUS)) return;
  await prisma.appointment.update({ where: { id }, data: { status } });
  revalidatePath("/admin/reservas");
  revalidatePath("/admin");
}
