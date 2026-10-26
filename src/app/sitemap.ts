import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { site } from "@/config/site";
import { posts } from "@/content/blog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories, services] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.service.findMany({ where: { isActive: true }, select: { slug: true } }),
  ]);
  const url = (path: string) => `${site.url}${path}`;
  const now = new Date();

  const pages: MetadataRoute.Sitemap = [
    { url: url("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: url("/tienda"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/perros"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/gatos"), changeFrequency: "daily", priority: 0.9 },
    { url: url("/farmacia"), changeFrequency: "weekly", priority: 0.8 },
    { url: url("/ofertas"), changeFrequency: "daily", priority: 0.8 },
    { url: url("/servicios"), changeFrequency: "monthly", priority: 0.8 },
    { url: url("/servicios/agendar"), changeFrequency: "monthly", priority: 0.7 },
    { url: url("/blog"), changeFrequency: "weekly", priority: 0.6 },
    { url: url("/contacto"), changeFrequency: "yearly", priority: 0.5 },
    { url: url("/preguntas-frecuentes"), changeFrequency: "yearly", priority: 0.4 },
    { url: url("/terminos-y-condiciones"), changeFrequency: "yearly", priority: 0.2 },
    { url: url("/politica-de-privacidad"), changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...pages,
    ...categories.map((c) => ({ url: url(`/categoria/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...services.map((s) => ({ url: url(`/servicios/${s.slug}`), changeFrequency: "monthly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: url(`/producto/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
