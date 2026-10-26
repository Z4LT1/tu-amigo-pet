import type { Metadata } from "next";
import Link from "next/link";
import { CatalogView, normalizeParams } from "@/components/catalog/CatalogView";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export const metadata: Metadata = {
  title: "Farmacia veterinaria",
  description: "Antiparasitarios, suplementos, dermatología y medicamentos veterinarios para perros y gatos. Asesoría de nuestro equipo veterinario.",
  alternates: { canonical: "/farmacia" },
};

export default async function PharmacyPage({ searchParams }: Props) {
  const params = normalizeParams(await searchParams);
  return (
    <CatalogView
      theme="sky"
      title="Farmacia veterinaria"
      intro={
        <p>
          Antiparasitarios, suplementos y cuidado de piel y oídos. Los medicamentos que requieren receta se venden solo en el local, presentando la
          receta del médico veterinario. ¿Dudas con una dosis? <Link href="/servicios/consulta-veterinaria">Agenda una consulta</Link>.
        </p>
      }
      crumbs={[{ label: "Farmacia" }]}
      params={params}
      fixed={{ seccion: "FARMACIA" }}
      basePath="/farmacia"
    />
  );
}
