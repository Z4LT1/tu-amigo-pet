import { site } from "@/config/site";

export function shippingCost(subtotal: number, delivery: "DESPACHO" | "RETIRO", region?: string | null) {
  if (delivery === "RETIRO") return 0;
  const isRM = !region || region === "Región Metropolitana";
  const { metropolitanFee, metropolitanFreeFrom, regionsFee, regionsFreeFrom } = site.shipping;
  if (isRM) return subtotal >= metropolitanFreeFrom ? 0 : metropolitanFee;
  return subtotal >= regionsFreeFrom ? 0 : regionsFee;
}
