import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { photos } from "@/content/media";
import { getServices } from "@/lib/catalog";
import { formatCLP, formatYMD } from "@/lib/format";
import { nextClinicSlot } from "@/lib/next-slot";
import styles from "./services.module.css";

export const metadata: Metadata = {
  title: "Veterinaria y guardería de día",
  description: "Consulta veterinaria, esterilización, vacunas, control sano, peluquería, microchip y guardería de día para perros en Santiago. Agenda tu hora online.",
  alternates: { canonical: "/servicios" },
};

export const revalidate = 300;

export default async function ServicesPage() {
  const [services, slot] = await Promise.all([getServices(), nextClinicSlot()]);
  const daycare = services.find((s) => s.kind === "GUARDERIA");
  const clinic = services.filter((s) => s.kind === "CLINICA");

  return (
    <>
      <header className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div>
            <Breadcrumbs items={[{ label: "Veterinaria y guardería" }]} />
            <h1>Veterinaria y guardería en el mismo local</h1>
            <p className={styles.lead}>
              Atendemos a tu mascota donde ya compras su alimento. Agenda online, llega a tu hora y sal con la receta y los productos en la mano.
            </p>
            <div className={styles.heroActions}>
              <Link href="/servicios/agendar" className="btn btn--sky">
                Agendar hora
              </Link>
              {slot && (
                <p className={styles.next}>
                  Próxima hora: <strong>{slot.isToday ? "hoy" : slot.isTomorrow ? "mañana" : formatYMD(slot.date)}, {slot.time}</strong>
                </p>
              )}
            </div>
          </div>
          <div className={styles.heroPhoto}>
            <Image src={photos.vetVaccine} alt="Veterinario vacunando a un perro pequeño" fill priority sizes="(max-width: 860px) 100vw, 520px" />
          </div>
        </div>
      </header>

      <section className="section container" aria-labelledby="clinica">
        <h2 id="clinica" className={styles.h2}>
          Clínica veterinaria
        </h2>
        <ul role="list" className={styles.list}>
          {clinic.map((s) => (
            <li key={s.id}>
              <Link href={`/servicios/${s.slug}`} className={styles.item}>
                <span className={styles.icon}>
                  <ServiceIcon name={s.icon} />
                </span>
                <span className={styles.itemBody}>
                  <strong>{s.name}</strong>
                  <span>{s.summary}</span>
                </span>
                <span className={styles.itemPrice}>
                  {s.priceFrom ? (
                    <>
                      desde <strong>{formatCLP(s.priceFrom)}</strong>
                    </>
                  ) : (
                    "Consultar"
                  )}
                  <small>{s.durationMin} min aprox.</small>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p className={styles.note}>Los valores son referenciales y pueden variar según especie, peso y exámenes requeridos. Te confirmamos el valor final al agendar.</p>
      </section>

      {daycare && (
        <section className={styles.daycare} aria-labelledby="guarderia">
          <div className={`container ${styles.daycareInner}`}>
            <div className={styles.daycarePhoto}>
              <Image src={photos.twoDogsSun} alt="Perros descansando al sol en la guardería" fill sizes="(max-width: 860px) 100vw, 560px" />
            </div>
            <div>
              <h2 id="guarderia" className={styles.h2}>
                {daycare.name}
              </h2>
              <p className={styles.lead}>{daycare.description}</p>
              <p className={styles.daycarePrice}>
                Jornada completa desde <strong>{formatCLP(daycare.priceFrom ?? 0)}</strong>
              </p>
              <div className={styles.heroActions}>
                <Link href="/servicios/agendar?servicio=guarderia-de-dia" className="btn btn--primary">
                  Reservar un día
                </Link>
                <Link href="/servicios/guarderia-de-dia" className="link">
                  Requisitos y horarios
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          itemListElement: services.map((s, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Service",
              name: s.name,
              description: s.summary,
              provider: { "@id": `${site.url}/#negocio` },
              areaServed: site.contact.city,
              ...(s.priceFrom ? { offers: { "@type": "Offer", price: s.priceFrom, priceCurrency: "CLP" } } : {}),
            },
          })),
        }}
      />
    </>
  );
}
