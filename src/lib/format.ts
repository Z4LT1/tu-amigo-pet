const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export const formatCLP = (value: number) => clp.format(value);

export const discountPercent = (price: number, compareAt?: number | null) =>
  compareAt && compareAt > price ? Math.round((1 - price / compareAt) * 100) : 0;

export const formatDate = (value: Date | string, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }) =>
  new Intl.DateTimeFormat("es-CL", { timeZone: "America/Santiago", ...opts }).format(new Date(value));

export const formatDateTime = (value: Date | string) =>
  formatDate(value, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false });

/** Formatea una fecha YYYY-MM-DD sin conversión de zona horaria. */
export const formatYMD = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Intl.DateTimeFormat("es-CL", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
};

export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
