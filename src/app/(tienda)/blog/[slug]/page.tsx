import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { getPost, posts } from "@/content/blog";
import { formatDate } from "@/lib/format";
import styles from "../blog.module.css";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, images: [post.cover], publishedTime: post.date },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <article className={`container ${styles.article}`}>
      <header className={styles.articleHead}>
        <Breadcrumbs items={[{ label: "Consejos", href: "/blog" }, { label: post.title }]} />
        <p className={styles.meta}>
          {post.category}, {formatDate(post.date, { day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1>{post.title}</h1>
        <p className={styles.lead}>{post.excerpt}</p>
        <p className={styles.byline}>
          {post.author}, {post.readMinutes} min de lectura
        </p>
      </header>

      <div className={styles.cover}>
        <Image src={post.cover} alt="" fill priority sizes="(max-width: 960px) 100vw, 960px" />
      </div>

      <div className={`prose ${styles.body}`}>
        {post.body.map((b, i) => {
          if (b.type === "h2") return <h2 key={i}>{b.text}</h2>;
          if (b.type === "ul")
            return (
              <ul key={i}>
                {b.items.map((it) => (
                  <li key={it}>{it}</li>
                ))}
              </ul>
            );
          if (b.type === "tip")
            return (
              <aside key={i} className={styles.tip}>
                <strong>Consejo:</strong> {b.text}
              </aside>
            );
          return <p key={i}>{b.text}</p>;
        })}
        {post.related && (
          <p>
            <Link href={post.related.href} className="btn btn--primary">
              {post.related.label}
            </Link>
          </p>
        )}
      </div>

      <aside className={styles.more} aria-labelledby="mas">
        <h2 id="mas">Sigue leyendo</h2>
        <ul role="list">
          {more.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`}>
                <strong>{p.title}</strong>
                <span>{p.excerpt}</span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          image: post.cover,
          datePublished: post.date,
          author: { "@type": "Organization", name: `${site.name}: ${post.author}` },
          publisher: { "@id": `${site.url}/#negocio` },
          mainEntityOfPage: `${site.url}/blog/${post.slug}`,
          inLanguage: "es-CL",
        }}
      />
    </article>
  );
}
