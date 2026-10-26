import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import styles from "./Breadcrumbs.module.css";

export type Crumb = { label: string; href?: string };

/** Migas de pan con su BreadcrumbList para buscadores. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Inicio", href: "/" }, ...items];
  return (
    <nav aria-label="Ruta de navegación" className={styles.nav}>
      <ol>
        {all.map((c, i) => (
          <li key={i}>
            {c.href && i < all.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            {i < all.length - 1 && <ChevronRight aria-hidden />}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            ...(c.href ? { item: `${site.url}${c.href}` } : {}),
          })),
        }}
      />
    </nav>
  );
}
