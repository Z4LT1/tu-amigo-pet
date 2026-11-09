import "server-only";
import { IntegrationApiKeys, IntegrationCommerceCodes, WebpayPlus } from "transbank-sdk";

/** Sin WEBPAY_ENV=production se usa el ambiente de pruebas de Transbank: no hay cobros reales. */
export const isWebpayTestMode = () => process.env.WEBPAY_ENV !== "production";

export function webpayTransaction() {
  if (isWebpayTestMode()) {
    return WebpayPlus.Transaction.buildForIntegration(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY);
  }
  const commerceCode = process.env.WEBPAY_COMMERCE_CODE;
  const apiKey = process.env.WEBPAY_API_KEY;
  if (!commerceCode || !apiKey) throw new Error("Faltan WEBPAY_COMMERCE_CODE o WEBPAY_API_KEY para operar en producción.");
  return WebpayPlus.Transaction.buildForProduction(commerceCode, apiKey);
}
