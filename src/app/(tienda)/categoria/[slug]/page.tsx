import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CatalogView, normalizeParams } from "@/components/catalog/CatalogView";
import { getCategory } from "@/lib/catalog";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return {};
  return {
    title: category.name,
    description: category.description ?? undefined,
    alternates: { canonical: `/categoria/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const category = await getCategory((await params).slug);
  if (!category) notFound();
  const pharmacy = category.section === "FARMACIA";
  return (
    <CatalogView
      theme={pharmacy ? "sky" : "default"}
      title={category.name}
      intro={category.description ? <p>{category.description}</p> : undefined}
      crumbs={pharmacy ? [{ label: "Farmacia", href: "/farmacia" }, { label: category.name }] : [{ label: "Tienda", href: "/tienda" }, { label: category.name }]}
      params={normalizeParams(await searchParams)}
      fixed={{ categoria: category.slug }}
      basePath={`/categoria/${category.slug}`}
    />
  );
}
