import type { Metadata } from "next";
import { CatalogView, normalizeParams } from "@/components/catalog/CatalogView";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Todo para tu perro",
  description: "Alimento seco y húmedo, snacks, juguetes, higiene y antiparasitarios para perros de todas las edades.",
  alternates: { canonical: "/perros" },
};

export default async function PetPage({ searchParams }: Props) {
  const params = normalizeParams(await searchParams);
  return (
    <CatalogView
      title="Todo para tu perro"
      intro={<p>Alimento seco y húmedo, snacks, juguetes, higiene y antiparasitarios para perros de todas las edades.</p>}
      crumbs={[{ label: "Perros" }]}
      params={params}
      fixed={{ especie: "perro" }}
      basePath="/perros"
    />
  );
}
