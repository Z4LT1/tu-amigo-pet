/**
 * Configuración central de la marca. Cambiar estos valores actualiza
 * textos, SEO, datos estructurados y pie de página en todo el sitio.
 */
export const site = {
  name: "Tu Amigo Pet",
  legalName: "Tu Amigo Pet SpA",
  kind: "Tienda & Veterinaria",
  tagline: "Tienda y veterinaria de barrio, con cariño de verdad",
  description:
    "Tienda y veterinaria de barrio en Santiago: alimento para perros y gatos, arenas, accesorios, farmacia veterinaria, consultas, esterilizaciones y guardería de día. Despacho a domicilio y retiro en tienda.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "es_CL",
  currency: "CLP",
  contact: {
    phone: "+56 9 0000 0000",
    whatsapp: "56900000000",
    email: "contacto@tuamigopet.cl",
    address: "Dirección de la tienda",
    city: "Santiago",
    region: "Región Metropolitana",
    country: "CL",
    hours: [
      { days: "Lunes a viernes", time: "10:00 – 19:30" },
      { days: "Sábado", time: "10:00 – 14:00" },
    ],
  },
  social: {
    instagram: "https://instagram.com/",
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
  },
  shipping: {
    metropolitanFee: 3990,
    metropolitanFreeFrom: 39990,
    regionsFee: 6990,
    regionsFreeFrom: 69990,
  },
  payments: {
    /** Pago en caja al retirar: el pedido queda reservado este número de horas. */
    payOnPickup: true,
    pickupHoldHours: 48,
    bank: {
      holder: "Tu Amigo Pet SpA",
      rut: "77.777.777-7",
      bank: "Banco de ejemplo",
      accountType: "Cuenta corriente",
      account: "000-00000-00",
      email: "pagos@tuamigopet.cl",
    },
  },
  keywords: [
    "tienda de mascotas",
    "alimento para perros",
    "alimento para gatos",
    "arena para gatos",
    "farmacia veterinaria",
    "esterilización de mascotas",
    "pet shop Chile",
  ],
} as const;

export type Site = typeof site;
