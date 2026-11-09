"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { prisma } from "@/lib/db";
import { orderCode, webpayBuyOrder } from "@/lib/codes";
import { shippingCost } from "@/lib/shipping";
import { checkoutSchema, fieldErrors, type CheckoutInput } from "@/lib/validators";
import { rateLimit } from "@/lib/rate-limit";
import { webpayTransaction } from "@/lib/webpay";

export type CheckoutResult = { ok: false; errors: Record<string, string> } | { ok: true; code: string; next: string };

class StockError extends Error {}

/**
 * Crea el pedido validando precios y stock en el servidor. El stock se descuenta
 * en la misma transacción para evitar sobreventa; si el pago no se concreta, el
 * administrador puede cancelar el pedido y el stock se repone automáticamente.
 */
export async function createOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(`checkout:${ip}`, 10, 60_000).ok) {
    return { ok: false, errors: { form: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." } };
  }

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  const ids = data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: ids }, isActive: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  for (const item of data.items) {
    const product = byId.get(item.productId);
    if (!product) return { ok: false, errors: { form: "Uno de los productos ya no está disponible. Revisa tu carrito." } };
    if (product.requiresPrescription) {
      return { ok: false, errors: { form: `"${product.name}" requiere receta veterinaria y se vende solo en tienda.` } };
    }
    if (product.stock < item.quantity) {
      return { ok: false, errors: { form: `Solo quedan ${product.stock} unidades de "${product.name}".` } };
    }
  }

  const subtotal = data.items.reduce((sum, i) => sum + byId.get(i.productId)!.price * i.quantity, 0);
  const shipping = shippingCost(subtotal, data.deliveryMethod, data.region);
  const code = orderCode();

  try {
    await prisma.$transaction(async (tx) => {
      for (const item of data.items) {
        // Descuento condicional: falla si otro pedido tomó el stock entre medio
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) throw new StockError(byId.get(item.productId)!.name);
        const { stock } = await tx.product.findUniqueOrThrow({ where: { id: item.productId }, select: { stock: true } });
        await tx.inventoryMovement.create({
          data: { productId: item.productId, type: "VENTA", quantity: -item.quantity, stockAfter: stock, reference: code, createdBy: "Tienda online" },
        });
      }

      await tx.order.create({
        data: {
          code,
          customerName: data.customerName,
          email: data.email,
          phone: data.phone,
          rut: data.rut || null,
          deliveryMethod: data.deliveryMethod,
          address: data.deliveryMethod === "DESPACHO" ? data.address : null,
          comuna: data.deliveryMethod === "DESPACHO" ? data.comuna : null,
          region: data.deliveryMethod === "DESPACHO" ? data.region : null,
          notes: data.notes || null,
          paymentMethod: data.paymentMethod,
          subtotal,
          shippingCost: shipping,
          total: subtotal + shipping,
          items: {
            create: data.items.map((i) => {
              const p = byId.get(i.productId)!;
              return { productId: p.id, name: p.name, sku: p.sku, unitPrice: p.price, quantity: i.quantity };
            }),
          },
        },
      });
    });
  } catch (error) {
    if (error instanceof StockError) {
      return { ok: false, errors: { form: `"${error.message}" se agotó mientras comprabas. Actualiza tu carrito.` } };
    }
    throw error;
  }

  const next = data.paymentMethod === "WEBPAY" ? `/checkout/pago/${code}` : `/pedido/${code}`;
  return { ok: true, code, next };
}

export type WebpayStart = { url?: string; token?: string; error?: string };

/**
 * Crea la transacción en Transbank y entrega los datos para ir a su formulario.
 * El pago se confirma después, en /api/webpay/retorno. Cada intento usa una orden
 * de compra distinta porque Transbank la exige única; el código del pedido viaja
 * como sessionId para reconocerlo si el cliente anula o el formulario expira.
 */
export async function startWebpayPayment(code: string): Promise<WebpayStart> {
  const head = await headers();
  if (!rateLimit(`webpay:${head.get("x-forwarded-for") ?? "local"}`, 10, 60_000).ok) {
    return { error: "Demasiados intentos. Espera un minuto e inténtalo de nuevo." };
  }

  const order = await prisma.order.findUnique({ where: { code } });
  if (!order || order.status !== "PENDIENTE" || order.paymentMethod !== "WEBPAY") redirect(`/pedido/${code}`);

  const host = head.get("x-forwarded-host") ?? head.get("host");
  const protocol = head.get("x-forwarded-proto") ?? "http";
  try {
    const { token, url } = await webpayTransaction().create(webpayBuyOrder(code), code, order.total, `${protocol}://${host}/api/webpay/retorno`);
    await prisma.order.update({ where: { code }, data: { paymentToken: token } });
    return { url, token };
  } catch (error) {
    console.error("Error al iniciar el pago en Webpay", code, error);
    return { error: "No pudimos conectar con Webpay. Inténtalo de nuevo en unos minutos." };
  }
}

export async function trackOrder(_: unknown, formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!code || !email) return { error: "Ingresa el número de pedido y el correo usado en la compra." };
  const order = await prisma.order.findFirst({ where: { code, email } });
  if (!order) return { error: "No encontramos un pedido con esos datos." };
  redirect(`/pedido/${order.code}`);
}
