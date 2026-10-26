import type { Metadata } from "next";
import { CatalogView, normalizeParams } from "@/components/catalog/CatalogView";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Todo para tu gato",
  description: "Alimento, sachets, arenas sanitarias, rascadores y antiparasitarios para gatos y gatitos.",
  alternates: { canonical: "/gatos" },
};

export default async function PetPage({ searchParams }: Props) {
  const params = normalizeParams(await searchParams);
  return (
    <CatalogView
      title="Todo para tu gato"
      intro={<p>Alimento, sachets, arenas sanitarias, rascadores y antiparasitarios para gatos y gatitos.</p>}
      crumbs={[{ label: "Gatos" }]}
      params={params}
      fixed={{ especie: "gato" }}
      basePath="/gatos"
    />
  );
}
