import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { posts } from "@/content/blog";
import { formatDate } from "@/lib/format";
import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: "Consejos de cuidado para perros y gatos",
  description: "Guías del equipo veterinario sobre vacunas, esterilización, alimentación, arenas y guardería.",
  alternates: { canonical: "/blog" },
};

export default function BlogPage() {
  const [first, ...rest] = posts;
  return (
    <div className="container">
      <header className={styles.header}>
        <Breadcrumbs items={[{ label: "Consejos" }]} />
        <h1>Consejos del equipo</h1>
        <p className={styles.lead}>Lo que más nos preguntan en el mesón y en la consulta, respondido con calma.</p>
      </header>

      <article className={styles.featured}>
        <Link href={`/blog/${first.slug}`} className={styles.featuredImg}>
          <Image src={first.cover} alt="" fill priority sizes="(max-width: 860px) 100vw, 640px" />
        </Link>
        <div>
          <p className={styles.meta}>
            {first.category}, {first.readMinutes} min de lectura
          </p>
          <h2>
            <Link href={`/blog/${first.slug}`}>{first.title}</Link>
          </h2>
          <p className={styles.excerpt}>{first.excerpt}</p>
          <Link href={`/blog/${first.slug}`} className="link">
            Leer artículo
          </Link>
        </div>
      </article>

      <div className={styles.grid}>
        {rest.map((post) => (
          <article key={post.slug} className={styles.card}>
            <Link href={`/blog/${post.slug}`} className={styles.cardImg}>
              <Image src={post.cover} alt="" fill sizes="(max-width: 860px) 100vw, 400px" />
            </Link>
            <p className={styles.meta}>
              {post.category}, {formatDate(post.date, { day: "numeric", month: "long" })}
            </p>
            <h2>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            <p className={styles.excerpt}>{post.excerpt}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
