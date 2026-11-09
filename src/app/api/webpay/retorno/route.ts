import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { webpayTransaction } from "@/lib/webpay";

type Read = (key: string) => string | undefined;

/**
 * Webpay devuelve aquí al cliente, por POST o GET, según lo ocurrido:
 * - pago terminado: token_ws
 * - compra anulada por el cliente: TBK_TOKEN, TBK_ORDEN_COMPRA y TBK_ID_SESION
 * - formulario expirado: TBK_ORDEN_COMPRA y TBK_ID_SESION
 * El pedido solo pasa a PAGADO después de confirmar la transacción con Transbank.
 */
async function handleReturn(request: NextRequest, read: Read) {
  const go = (path: string) => NextResponse.redirect(new URL(path, request.url), 303);
  const toOrder = (code: string, result: string) => go(`/pedido/${encodeURIComponent(code)}?pago=${result}`);

  const token = read("token_ws");
  if (!token || read("TBK_TOKEN")) {
    const code = read("TBK_ID_SESION");
    return code ? toOrder(code, "rechazado") : go("/seguimiento");
  }

  const order = await prisma.order.findUnique({ where: { paymentToken: token } });
  if (!order) return go("/seguimiento");
  // Una recarga de la página no debe confirmar dos veces la misma transacción
  if (order.status !== "PENDIENTE") return go(`/pedido/${order.code}`);

  const transaction = webpayTransaction();
  let result;
  try {
    result = await transaction.commit(token);
  } catch (error) {
    console.error("Error al confirmar el pago en Webpay", order.code, error);
    return toOrder(order.code, "rechazado");
  }
  if (result.response_code !== 0 || result.status !== "AUTHORIZED") return toOrder(order.code, "rechazado");

  // Condicional: si el pedido se canceló mientras el cliente pagaba, no se marca como pagado
  const marked =
    result.amount === order.total &&
    (
      await prisma.order.updateMany({
        where: { id: order.id, status: "PENDIENTE" },
        data: {
          status: "PAGADO",
          paidAt: new Date(result.transaction_date),
          paymentAuthCode: result.authorization_code,
          paymentCardLast4: result.card_detail?.card_number,
          paymentTypeCode: result.payment_type_code,
          paymentInstallments: result.installments_number,
        },
      })
    ).count > 0;
  if (marked) return toOrder(order.code, "aprobado");

  // Hubo cobro, pero el pedido no puede cumplirse: se devuelve el dinero
  try {
    await transaction.refund(token, result.amount);
  } catch (error) {
    console.error("REVISAR: cobro sin pedido vigente y reversa fallida", order.code, error);
  }
  return toOrder(order.code, "revertido");
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  return handleReturn(request, (key) => form.get(key)?.toString());
}

export async function GET(request: NextRequest) {
  return handleReturn(request, (key) => request.nextUrl.searchParams.get(key) ?? undefined);
}
