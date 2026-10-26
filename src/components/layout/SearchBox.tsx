"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { PackShot } from "@/components/product/PackShot";
import { formatCLP } from "@/lib/format";
import styles from "./SearchBox.module.css";

type Suggestion = {
  slug: string;
  name: string;
  price: number;
  presentation: string;
  packColor: string;
  brand: { name: string };
  category: { icon: string | null; name: string };
};

export function SearchBox({ autoFocus = false, onNavigate, id = "buscador" }: { autoFocus?: boolean; onNavigate?: () => void; id?: string }) {
  const router = useRouter();
  const listId = `${id}-sugerencias`;
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapper = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal });
        const data = await res.json();
        setItems(data.items);
        setActive(-1);
      } catch {
        /* búsqueda cancelada */
      }
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapper.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (active >= 0 && items[active]) return go(`/producto/${items[active].slug}`);
    if (q.trim()) go(`/tienda?q=${encodeURIComponent(q.trim())}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showList = open && q.trim().length >= 2;

  return (
    <form ref={wrapper} role="search" className={styles.form} onSubmit={submit}>
      <Search className={styles.icon} aria-hidden />
      <input
        className={styles.input}
        type="search"
        name="q"
        value={q}
        placeholder="Busca alimento, arena, antiparasitarios…"
        aria-label="Buscar productos"
        autoComplete="off"
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <button type="submit" className={styles.submit} aria-label="Buscar">
        <ArrowRight />
      </button>

      {showList && (
        <div className={styles.panel}>
          {items.length === 0 ? (
            <p className={styles.empty}>Sin coincidencias para “{q}”. Prueba con una marca o categoría.</p>
          ) : (
            <ul id={listId} role="listbox" className={styles.list}>
              {items.map((item, i) => (
                <li key={item.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/producto/${item.slug}`}
                    className={styles.item}
                    data-active={i === active}
                    onClick={(e) => {
                      e.preventDefault();
                      go(`/producto/${item.slug}`);
                    }}
                  >
                    <PackShot brand={item.brand.name} color={item.packColor} icon={item.category.icon} className={styles.thumb} />
                    <span className={styles.meta}>
                      <span className={styles.name}>{item.name}</span>
                      <span className={styles.sub}>
                        {item.category.name} · {item.presentation}
                      </span>
                    </span>
                    <span className={styles.price}>{formatCLP(item.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <button type="submit" className={styles.all}>
            Ver todos los resultados <ArrowRight />
          </button>
        </div>
      )}
    </form>
  );
}
