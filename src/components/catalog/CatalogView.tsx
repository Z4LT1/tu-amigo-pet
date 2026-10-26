import Link from "next/link";
import { Suspense } from "react";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { getCategories, getFacets, searchProducts, type CatalogParams } from "@/lib/catalog";
import { CatalogFilters, SortSelect } from "./CatalogFilters";
import styles from "./Catalog.module.css";

type RawParams = Record<string, string | string[] | undefined>;

export function normalizeParams(raw: RawParams): CatalogParams {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  return {
    q: one(raw.q),
    especie: one(raw.especie),
    categoria: one(raw.categoria),
    marca: raw.marca,
    etapa: one(raw.etapa),
    min: one(raw.min),
    max: one(raw.max),
    orden: one(raw.orden),
    pagina: one(raw.pagina),
    ofertas: one(raw.ofertas),
  };
}

export async function CatalogView({
  title,
  intro,
  crumbs,
  params,
  fixed = {},
  theme = "default",
  basePath,
}: {
  title: string;
  intro?: React.ReactNode;
  crumbs: Crumb[];
  params: CatalogParams;
  fixed?: Partial<CatalogParams>;
  theme?: "default" | "sky";
  basePath: string;
}) {
  const merged = { ...params, ...fixed };
  const [result, facets, categories] = await Promise.all([
    searchProducts(merged),
    getFacets(merged),
    fixed.categoria ? Promise.resolve(undefined) : getCategories(fixed.seccion),
  ]);
  const hide = Object.keys(fixed);

  const pageHref = (page: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (!v || k === "pagina" || hide.includes(k)) continue;
      [v].flat().forEach((x) => sp.append(k, x));
    }
    if (page > 1) sp.set("pagina", String(page));
    const qs = sp.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className={theme === "sky" ? styles.sky : undefined}>
      <header className={styles.hero}>
        <div className="container">
          <Breadcrumbs items={crumbs} />
          <h1>{title}</h1>
          {intro && <div className={styles.intro}>{intro}</div>}
        </div>
      </header>

      <div className={`container ${styles.layout}`}>
        <Suspense>
          <CatalogFilters
            facets={{ ...facets, categories: categories?.map((c) => ({ slug: c.slug, name: c.name })) }}
            hide={hide}
            total={result.total}
          />
        </Suspense>

        <section className={styles.results} aria-label="Productos">
          <div className={styles.toolbar}>
            <p>
              {params.q ? (
                <>
                  {result.total} resultados para <strong>“{params.q}”</strong>
                </>
              ) : (
                <>
                  {result.total} {result.total === 1 ? "producto" : "productos"}
                </>
              )}
            </p>
            <Suspense>
              <SortSelect value={params.orden ?? "relevancia"} />
            </Suspense>
          </div>

          {result.items.length === 0 ? (
            <div className={styles.empty}>
              <h2>No hay productos con estos filtros</h2>
              <p>Quita algún filtro o busca por marca. También puedes escribirnos y te conseguimos lo que necesitas.</p>
              <Link href={basePath} className="btn btn--primary">
                Quitar filtros
              </Link>
            </div>
          ) : (
            <ProductGrid>
              {result.items.map((p, i) => (
                <ProductCard key={p.id} product={p} priority={i < 4} />
              ))}
            </ProductGrid>
          )}

          {result.pages > 1 && (
            <nav className={styles.pagination} aria-label="Páginas">
              {Array.from({ length: result.pages }, (_, i) => i + 1).map((n) => (
                <Link key={n} href={pageHref(n)} aria-current={n === result.page ? "page" : undefined}>
                  {n}
                </Link>
              ))}
            </nav>
          )}
        </section>
      </div>
    </div>
  );
}
