import "server-only";
import type { Prisma } from "@prisma/client";
import { cache } from "react";
import { prisma } from "./db";

export const PAGE_SIZE = 12;

export type CatalogParams = {
  q?: string;
  especie?: string;
  categoria?: string;
  marca?: string | string[];
  etapa?: string;
  min?: string;
  max?: string;
  orden?: string;
  pagina?: string;
  ofertas?: string;
  seccion?: "TIENDA" | "FARMACIA";
};

export const SORTS = {
  relevancia: "Destacados",
  "precio-asc": "Menor precio",
  "precio-desc": "Mayor precio",
  nuevos: "Más nuevos",
  nombre: "Nombre A–Z",
} as const;

const speciesFilter = (especie?: string): Prisma.ProductWhereInput | undefined => {
  if (especie === "perro") return { species: { in: ["PERRO", "AMBOS"] } };
  if (especie === "gato") return { species: { in: ["GATO", "AMBOS"] } };
  if (especie === "otros") return { species: "OTROS" };
  return undefined;
};

export function buildWhere(params: CatalogParams): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ isActive: true }];
  const q = params.q?.trim();
  if (q) {
    and.push({
      OR: [
        { name: { contains: q } },
        { shortDescription: { contains: q } },
        { brand: { name: { contains: q } } },
        { category: { name: { contains: q } } },
      ],
    });
  }
  const species = speciesFilter(params.especie);
  if (species) and.push(species);
  if (params.categoria) and.push({ category: { slug: params.categoria } });
  if (params.seccion) and.push({ category: { section: params.seccion } });
  const marcas = [params.marca].flat().filter(Boolean) as string[];
  if (marcas.length) and.push({ brand: { slug: { in: marcas } } });
  if (params.etapa) and.push({ lifeStage: { in: [params.etapa.toUpperCase(), "TODAS"] } });
  const min = Number(params.min);
  const max = Number(params.max);
  if (params.min && Number.isFinite(min)) and.push({ price: { gte: min } });
  if (params.max && Number.isFinite(max)) and.push({ price: { lte: max } });
  if (params.ofertas === "1") and.push({ compareAtPrice: { not: null } });
  return { AND: and };
}

function buildOrder(orden?: string): Prisma.ProductOrderByWithRelationInput[] {
  switch (orden) {
    case "precio-asc":
      return [{ price: "asc" }];
    case "precio-desc":
      return [{ price: "desc" }];
    case "nuevos":
      return [{ createdAt: "desc" }];
    case "nombre":
      return [{ name: "asc" }];
    default:
      return [{ isFeatured: "desc" }, { stock: "desc" }, { name: "asc" }];
  }
}

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  price: true,
  compareAtPrice: true,
  stock: true,
  presentation: true,
  packColor: true,
  imageUrl: true,
  species: true,
  requiresPrescription: true,
  brand: { select: { name: true, color: true } },
  category: { select: { slug: true, name: true, section: true, icon: true } },
} satisfies Prisma.ProductSelect;

export type ProductCardData = Prisma.ProductGetPayload<{ select: typeof productCardSelect }>;

export async function searchProducts(params: CatalogParams) {
  const where = buildWhere(params);
  const page = Math.max(1, Number(params.pagina) || 1);
  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: buildOrder(params.orden),
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: productCardSelect,
    }),
  ]);
  return { total, items, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}

/** Facetas disponibles para el contexto actual (sin aplicar el propio filtro de marca ni precio). */
export async function getFacets(params: CatalogParams) {
  const base = buildWhere({ ...params, marca: undefined, min: undefined, max: undefined, pagina: undefined });
  const [brands, priceRange] = await Promise.all([
    prisma.brand.findMany({
      where: { products: { some: base } },
      select: { slug: true, name: true, _count: { select: { products: { where: base } } } },
      orderBy: { name: "asc" },
    }),
    prisma.product.aggregate({ where: base, _min: { price: true }, _max: { price: true } }),
  ]);
  return { brands, minPrice: priceRange._min.price ?? 0, maxPrice: priceRange._max.price ?? 0 };
}

export const getCategories = cache((section?: "TIENDA" | "FARMACIA") =>
  prisma.category.findMany({
    where: section ? { section } : undefined,
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  }),
);

export const getCategory = cache((slug: string) => prisma.category.findUnique({ where: { slug } }));

export const getProduct = cache((slug: string) =>
  prisma.product.findFirst({
    where: { slug, isActive: true },
    include: { brand: true, category: true },
  }),
);

export function getFeatured(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true, category: { section: "TIENDA" } },
    orderBy: { updatedAt: "desc" },
    take,
    select: productCardSelect,
  });
}

export function getOnSale(take = 8) {
  return prisma.product.findMany({
    where: { isActive: true, compareAtPrice: { not: null }, stock: { gt: 0 } },
    orderBy: { price: "desc" },
    take,
    select: productCardSelect,
  });
}

export function getPharmacyHighlights(take = 4) {
  return prisma.product.findMany({
    where: { isActive: true, category: { section: "FARMACIA" }, requiresPrescription: false },
    orderBy: [{ isFeatured: "desc" }, { stock: "desc" }],
    take,
    select: productCardSelect,
  });
}

export function getRelated(productId: string, categoryId: string, take = 4) {
  return prisma.product.findMany({
    where: { isActive: true, categoryId, id: { not: productId } },
    take,
    orderBy: { isFeatured: "desc" },
    select: productCardSelect,
  });
}

export const getBrands = cache(() => prisma.brand.findMany({ orderBy: { name: "asc" } }));

export const getServices = cache(() =>
  prisma.service.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
);
