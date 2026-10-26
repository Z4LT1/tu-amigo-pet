import type { Metadata } from "next";
import { CatalogView, normalizeParams } from "@/components/catalog/CatalogView";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { q } = await searchParams;
  return q
    ? { title: `Resultados para “${q}”`, robots: { index: false, follow: true } }
    : {
        title: "Tienda de mascotas online",
        description: "Alimento para perros y gatos, arenas, snacks, accesorios y farmacia veterinaria con despacho en Santiago.",
        alternates: { canonical: "/tienda" },
      };
}

export default async function StorePage({ searchParams }: Props) {
  const params = normalizeParams(await searchParams);
  return (
    <CatalogView
      title={params.q ? `Resultados para “${params.q}”` : "Toda la tienda"}
      crumbs={[{ label: "Tienda" }]}
      params={params}
      basePath="/tienda"
    />
  );
}
