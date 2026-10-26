"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import styles from "./Catalog.module.css";

type Facets = {
  brands: { slug: string; name: string; _count: { products: number } }[];
  categories?: { slug: string; name: string }[];
  minPrice: number;
  maxPrice: number;
};

const SPECIES = [
  { value: "", label: "Todas" },
  { value: "perro", label: "Perro" },
  { value: "gato", label: "Gato" },
];

const STAGES = [
  { value: "", label: "Todas" },
  { value: "cachorro", label: "Cachorro / gatito" },
  { value: "adulto", label: "Adulto" },
  { value: "senior", label: "Senior" },
];

export function CatalogFilters({ facets, hide = [], total }: { facets: Facets; hide?: string[]; total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");

  useEffect(() => {
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
  }, [params]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const update = (mutate: (p: URLSearchParams) => void) => {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("pagina");
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  };

  const set = (key: string, value: string) => update((p) => (value ? p.set(key, value) : p.delete(key)));

  const toggleBrand = (slug: string) =>
    update((p) => {
      const current = p.getAll("marca");
      p.delete("marca");
      const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
      next.forEach((s) => p.append("marca", s));
    });

  const activeCount = ["especie", "etapa", "min", "max", "ofertas", "categoria"].filter((k) => !hide.includes(k) && params.get(k)).length + params.getAll("marca").length;
  const selectedBrands = params.getAll("marca");

  return (
    <>
      <button type="button" className={styles.filterToggle} onClick={() => setOpen(true)}>
        <SlidersHorizontal />
        Filtrar
        {activeCount > 0 && <span>{activeCount}</span>}
      </button>

      <div className={styles.filtersLayer} data-open={open}>
        <div className={styles.filtersScrim} onClick={() => setOpen(false)} />
        <aside className={styles.filters} aria-label="Filtros" aria-busy={pending}>
          <header className={styles.filtersHead}>
            <h2>Filtrar</h2>
            <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar filtros">
              <X />
            </button>
          </header>

          <div className={styles.filtersBody}>
            {!hide.includes("especie") && (
              <fieldset className={styles.group}>
                <legend>Mascota</legend>
                <div className={styles.segment}>
                  {SPECIES.map((s) => (
                    <label key={s.value}>
                      <input type="radio" name="especie" checked={(params.get("especie") ?? "") === s.value} onChange={() => set("especie", s.value)} />
                      <span>{s.label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {facets.categories && !hide.includes("categoria") && (
              <fieldset className={styles.group}>
                <legend>Categoría</legend>
                <select className="select" value={params.get("categoria") ?? ""} onChange={(e) => set("categoria", e.target.value)}>
                  <option value="">Todas las categorías</option>
                  {facets.categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </fieldset>
            )}

            {!hide.includes("etapa") && (
              <fieldset className={styles.group}>
                <legend>Etapa de vida</legend>
                <div className={styles.stack}>
                  {STAGES.map((s) => (
                    <label key={s.value} className="check">
                      <input type="radio" name="etapa" checked={(params.get("etapa") ?? "") === s.value} onChange={() => set("etapa", s.value)} />
                      {s.label}
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {facets.brands.length > 0 && (
              <fieldset className={styles.group}>
                <legend>Marca</legend>
                <div className={styles.stack}>
                  {facets.brands.map((b) => (
                    <label key={b.slug} className="check">
                      <input type="checkbox" checked={selectedBrands.includes(b.slug)} onChange={() => toggleBrand(b.slug)} />
                      {b.name}
                      <span className={styles.count}>{b._count.products}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset className={styles.group}>
              <legend>Precio</legend>
              <form
                className={styles.price}
                onSubmit={(e) => {
                  e.preventDefault();
                  update((p) => {
                    if (min) p.set("min", min);
                    else p.delete("min");
                    if (max) p.set("max", max);
                    else p.delete("max");
                  });
                }}
              >
                <label>
                  <span className="visually-hidden">Precio mínimo</span>
                  <input className="input" inputMode="numeric" placeholder={`$${facets.minPrice.toLocaleString("es-CL")}`} value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} />
                </label>
                <label>
                  <span className="visually-hidden">Precio máximo</span>
                  <input className="input" inputMode="numeric" placeholder={`$${facets.maxPrice.toLocaleString("es-CL")}`} value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} />
                </label>
                <button type="submit" className="btn btn--sm btn--ghost">
                  Aplicar
                </button>
              </form>
            </fieldset>

            {!hide.includes("ofertas") && (
              <label className={`check ${styles.group}`}>
                <input type="checkbox" checked={params.get("ofertas") === "1"} onChange={(e) => set("ofertas", e.target.checked ? "1" : "")} />
                Solo productos en oferta
              </label>
            )}
          </div>

          <footer className={styles.filtersFoot}>
            {activeCount > 0 && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() =>
                  update((p) => {
                    ["especie", "etapa", "min", "max", "ofertas", "marca", "categoria"].filter((k) => !hide.includes(k)).forEach((k) => p.delete(k));
                  })
                }
              >
                Limpiar
              </button>
            )}
            <button type="button" className="btn btn--primary" onClick={() => setOpen(false)}>
              Ver {total} {total === 1 ? "producto" : "productos"}
            </button>
          </footer>
        </aside>
      </div>
    </>
  );
}

export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className={styles.sort}>
      <span>Ordenar por</span>
      <select
        className="select"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "relevancia") next.delete("orden");
          else next.set("orden", e.target.value);
          next.delete("pagina");
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
      >
        <option value="relevancia">Destacados</option>
        <option value="precio-asc">Menor precio</option>
        <option value="precio-desc">Mayor precio</option>
        <option value="nuevos">Más nuevos</option>
        <option value="nombre">Nombre A–Z</option>
      </select>
    </label>
  );
}
