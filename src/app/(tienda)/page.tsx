import Image from "next/image";
import Link from "next/link";
import { ShutterHero } from "@/components/home/ShutterHero";
import { ProductCard, ProductGrid } from "@/components/product/ProductCard";
import { site } from "@/config/site";
import { photos } from "@/content/media";
import { posts } from "@/content/blog";
import { getCategories, getFeatured, getOnSale, getPharmacyHighlights, getServices } from "@/lib/catalog";
import { formatCLP, formatDate, formatYMD } from "@/lib/format";
import { nextClinicSlot } from "@/lib/next-slot";
import styles from "./home.module.css";

export const revalidate = 300;

export default async function HomePage() {
  const [categories, featured, onSale, pharmacy, services, slot] = await Promise.all([
    getCategories("TIENDA"),
    getFeatured(8),
    getOnSale(4),
    getPharmacyHighlights(4),
    getServices(),
    nextClinicSlot(),
  ]);
  const clinic = services.filter((s) => s.kind === "CLINICA");
  const slotLabel = slot ? (slot.isToday ? "hoy" : slot.isTomorrow ? "mañana" : formatYMD(slot.date)) : null;

  return (
    <>
      <ShutterHero />

      <nav className={styles.cats} aria-label="Categorías de la tienda">
        <ul role="list" className="container">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/categoria/${c.slug}`}>
                {c.name}
                <span>{c._count.products}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <section className="section container" aria-labelledby="repone">
        <header className={styles.head}>
          <h2 id="repone">Lo que más se repone</h2>
          <Link href="/tienda" className="link">
            Ver toda la tienda
          </Link>
        </header>
        <ProductGrid>
          {featured.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={i < 2} />
          ))}
        </ProductGrid>
      </section>

      {onSale.length > 0 && (
        <section className={styles.sale} aria-labelledby="ofertas">
          <div className="container">
            <header className={styles.head}>
              <div>
                <h2 id="ofertas">Ofertas de la semana</h2>
                <p className="muted">Precios rebajados mientras dure el stock.</p>
              </div>
              <Link href="/ofertas" className="link">
                Ver todas las ofertas
              </Link>
            </header>
            <ProductGrid>
              {onSale.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}

      <section className={styles.clinic} aria-labelledby="clinica">
        <div className={`container ${styles.clinicInner}`}>
          <div>
            <h2 id="clinica">Veterinaria en el mismo local</h2>
            <p className={styles.clinicLead}>
              Consultas, vacunas y cirugías programadas con el equipo que ya conoce a tu mascota. Agenda online y recibe la confirmación por correo.
            </p>
            <ul role="list" className={styles.priceList} aria-label="Lista de precios">
              {clinic.map((s) => (
                <li key={s.id}>
                  <Link href={`/servicios/${s.slug}`}>
                    <span>{s.name}</span>
                    <i aria-hidden />
                    <strong>{s.priceFrom ? `desde ${formatCLP(s.priceFrom)}` : "Consultar"}</strong>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.clinicCard}>
            <div className={styles.clinicPhoto}>
              <Image src={photos.vetExam} alt="Veterinaria examinando a un perro" fill sizes="(max-width: 860px) 100vw, 480px" />
            </div>
            <div className={styles.slot}>
              {slot ? (
                <p>
                  Próxima hora disponible
                  <strong>
                    {slotLabel} a las {slot.time}
                  </strong>
                </p>
              ) : (
                <p>
                  Agenda completa esta semana
                  <strong>Escríbenos por WhatsApp</strong>
                </p>
              )}
              <Link href="/servicios/agendar" className="btn btn--sky">
                Agendar hora
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section container" aria-labelledby="guarderia">
        <div className={styles.daycare}>
          <div className={styles.daycarePhoto}>
            <Image src={photos.twoDogsPlaying} alt="Perros jugando en la guardería" fill sizes="(max-width: 860px) 100vw, 560px" />
          </div>
          <div>
            <h2 id="guarderia">Guardería de día, de lunes a viernes</h2>
            <p className={styles.daycareLead}>
              Para perros que pasan muchas horas solos. Juegan en grupo según su carácter, salen a pasear y descansan. Te mandamos fotos durante el día.
            </p>
            <ol className={styles.steps}>
              <li>
                <strong>Evaluación de convivencia</strong>
                <span>30 minutos para conocer su carácter y revisar vacunas.</span>
              </li>
              <li>
                <strong>Ingreso entre 8:00 y 9:30</strong>
                <span>Trae su alimento del día y sus remedios si toma.</span>
              </li>
              <li>
                <strong>Retiro hasta las 19:30</strong>
                <span>Vuelve a casa cansado y tranquilo.</span>
              </li>
            </ol>
            <Link href="/servicios/agendar?servicio=guarderia-de-dia" className="btn btn--primary">
              Reservar un día de guardería
            </Link>
          </div>
        </div>
      </section>

      {pharmacy.length > 0 && (
        <section className={styles.pharmacy} aria-labelledby="farmacia">
          <div className="container">
            <header className={styles.head}>
              <div>
                <h2 id="farmacia">Farmacia veterinaria</h2>
                <p className="muted">Antiparasitarios, suplementos y cuidado de piel y oídos. Los medicamentos con receta se venden solo en el local.</p>
              </div>
              <Link href="/farmacia" className="link">
                Ir a la farmacia
              </Link>
            </header>
            <ProductGrid>
              {pharmacy.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </ProductGrid>
          </div>
        </section>
      )}

      <section className="section container" aria-labelledby="consejos">
        <header className={styles.head}>
          <h2 id="consejos">Consejos del equipo</h2>
          <Link href="/blog" className="link">
            Ver todos los consejos
          </Link>
        </header>
        <div className={styles.posts}>
          {posts.slice(0, 3).map((post) => (
            <article key={post.slug} className={styles.post}>
              <Link href={`/blog/${post.slug}`} className={styles.postImg}>
                <Image src={post.cover} alt="" fill sizes="(max-width: 860px) 100vw, 400px" />
              </Link>
              <p className={styles.postMeta}>
                {post.category}, {formatDate(post.date, { day: "numeric", month: "long" })}
              </p>
              <h3>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </h3>
              <p className="muted">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container" aria-labelledby="visitanos">
        <div className={styles.visit}>
          <div>
            <h2 id="visitanos">Pasa a vernos</h2>
            <p>
              {site.contact.address}, {site.contact.city}
            </p>
            <ul role="list">
              {site.contact.hours.map((h) => (
                <li key={h.days}>
                  {h.days}: <strong>{h.time}</strong>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.visitActions}>
            <a
              className="btn btn--light"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${site.contact.address} ${site.contact.city}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar
            </a>
            <a className="btn btn--ghost-light" href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
              Escribir por WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
