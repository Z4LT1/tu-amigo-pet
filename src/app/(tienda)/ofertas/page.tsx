import type { Metadata } from "next";
import { CatalogView, normalizeParams } from "@/components/catalog/CatalogView";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Ofertas y liquidación",
  description: "Alimento, arenas, accesorios y farmacia para mascotas con precio rebajado. Stock limitado.",
  alternates: { canonical: "/ofertas" },
};

export default async function OffersPage({ searchParams }: Props) {
  const params = normalizeParams(await searchParams);
  return (
    <CatalogView
      title="Ofertas de la semana"
      intro={<p>Precios rebajados mientras dure el stock. El descuento ya está aplicado en el precio que ves.</p>}
      crumbs={[{ label: "Ofertas" }]}
      params={params}
      fixed={{ ofertas: "1" }}
      basePath="/ofertas"
    />
  );
}
