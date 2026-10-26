import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ShieldCheck, Store, Truck } from "lucide-react";
import { ProductCard, ProductGrid, ProductVisual } from "@/components/product/ProductCard";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { getProduct, getRelated } from "@/lib/catalog";
import { LIFE_STAGES, SPECIES } from "@/lib/constants";
import { discountPercent, formatCLP } from "@/lib/format";
import styles from "./product.module.css";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} ${product.presentation}`,
    description: `${product.shortDescription} ${formatCLP(product.price)} en ${site.name}.`,
    alternates: { canonical: `/producto/${product.slug}` },
    openGraph: { type: "website", title: product.name, description: product.shortDescription, images: product.imageUrl ? [product.imageUrl] : undefined },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  const related = await getRelated(product.id, product.categoryId);
  const off = discountPercent(product.price, product.compareAtPrice);
  const pharmacy = product.category.section === "FARMACIA";
  const sectionCrumb = pharmacy ? { label: "Farmacia", href: "/farmacia" } : { label: "Tienda", href: "/tienda" };

  const specs = [
    ["Marca", product.brand.name],
    ["Presentación", product.presentation],
    ["Para", SPECIES[product.species as keyof typeof SPECIES]],
    ["Etapa de vida", LIFE_STAGES[product.lifeStage as keyof typeof LIFE_STAGES]],
    ["Categoría", product.category.name],
    ["SKU", product.sku],
  ];

  return (
    <div className={pharmacy ? styles.sky : undefined}>
      <div className={`container ${styles.top}`}>
        <Breadcrumbs items={[sectionCrumb, { label: product.category.name, href: `/categoria/${product.category.slug}` }, { label: product.name }]} />
      </div>

      <div className={`container ${styles.main}`}>
        <div className={styles.media}>
          <ProductVisual product={product} sizes="(max-width: 860px) 100vw, 600px" priority />
          {off > 0 && <span className={styles.offTag}>{off}% menos</span>}
        </div>

        <div className={styles.info}>
          <Link href={`/tienda?marca=${product.brand.slug}`} className={styles.brand}>
            {product.brand.name}
          </Link>
          <h1 className={styles.title}>{product.name}</h1>
          <p className={styles.short}>{product.shortDescription}</p>

          <ProductBuyBox
            product={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              brand: product.brand.name,
              presentation: product.presentation,
              price: product.price,
              packColor: product.packColor,
              categoryIcon: product.category.icon,
              imageUrl: product.imageUrl,
              stock: product.stock,
            }}
            compareAtPrice={product.compareAtPrice}
            minStock={product.minStock}
            requiresPrescription={product.requiresPrescription}
          />

          <ul role="list" className={styles.perks}>
            <li>
              <Truck />
              <span>
                <strong>Despacho a domicilio</strong> gratis en RM sobre {formatCLP(site.shipping.metropolitanFreeFrom)}
              </span>
            </li>
            <li>
              <Store />
              <span>
                <strong>Retiro en tienda</strong> sin costo, listo el mismo día
              </span>
            </li>
            <li>
              <ShieldCheck />
              <span>
                <strong>Pago seguro</strong> con Webpay o transferencia
              </span>
            </li>
            {pharmacy && (
              <li>
                <CalendarDays />
                <span>
                  <strong>¿Dudas con la dosis?</strong> <Link href="/servicios/consulta-veterinaria">Agenda una consulta</Link>
                </span>
              </li>
            )}
          </ul>
        </div>
      </div>

      <section className={`container ${styles.details}`} aria-label="Detalles del producto">
        <div>
          <h2>Descripción</h2>
          <div className={styles.description}>
            {product.description.split("\n\n").map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
        <div>
          <h2>Ficha</h2>
          <dl className={styles.specs}>
            {specs.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {related.length > 0 && (
        <section className={`container ${styles.related}`} aria-labelledby="relacionados">
          <h2 id="relacionados">También en {product.category.name.toLowerCase()}</h2>
          <ProductGrid>
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </ProductGrid>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product.name,
          sku: product.sku,
          description: product.shortDescription,
          image: product.imageUrl ?? `${site.url}/opengraph-image`,
          brand: { "@type": "Brand", name: product.brand.name },
          category: product.category.name,
          offers: {
            "@type": "Offer",
            url: `${site.url}/producto/${product.slug}`,
            priceCurrency: "CLP",
            price: product.price,
            availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@id": `${site.url}/#negocio` },
          },
        }}
      />
    </div>
  );
}
