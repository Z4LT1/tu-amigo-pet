import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ServiceIcon } from "@/components/services/ServiceIcon";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { photos } from "@/content/media";
import { prisma } from "@/lib/db";
import { getServices } from "@/lib/catalog";
import { DAYCARE_SLOTS } from "@/lib/constants";
import { formatCLP } from "@/lib/format";
import styles from "../services.module.css";

type Props = { params: Promise<{ slug: string }> };

const getService = async (slug: string) => prisma.service.findFirst({ where: { slug, isActive: true } });

const servicePhoto: Record<string, string> = {
  "guarderia-de-dia": photos.twoDogsPlaying,
  esterilizacion: photos.vetExam,
  vacunacion: photos.vetVaccine,
  "control-sano-y-desparasitacion": photos.vetTeeth,
  "peluqueria-y-bano": photos.pomeranianBlue,
};

/** Indicaciones prácticas por servicio (contenido editable por el local). */
const prep: Record<string, string[]> = {
  "guarderia-de-dia": [
    "Vacunas al día (óctuple, antirrábica y KC) y desparasitación vigente.",
    "Evaluación de convivencia de 30 minutos antes del primer día.",
    `Ingreso entre ${DAYCARE_SLOTS[0]} y ${DAYCARE_SLOTS.at(-1)}; retiro hasta las 19:30.`,
    "Trae su alimento del día, correa y sus remedios con indicaciones por escrito.",
  ],
  esterilizacion: [
    "Ayuno de alimento de 8 a 12 horas antes de la cirugía.",
    "Llega 10 minutos antes con su carnet de vacunas.",
    "Incluye collar isabelino y control a los 10 días.",
  ],
  vacunacion: ["Trae su carnet de vacunas si ya tiene uno.", "Tu mascota debe estar sana el día de la vacuna.", "Desparasítala unos días antes si no está al día."],
};

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await getService((await params).slug);
  if (!service) return {};
  return {
    title: service.name,
    description: `${service.summary} ${service.priceFrom ? `Desde ${formatCLP(service.priceFrom)}.` : ""} Agenda online en ${site.name}.`,
    alternates: { canonical: `/servicios/${service.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const service = await getService((await params).slug);
  if (!service) notFound();
  const isDaycare = service.kind === "GUARDERIA";
  const tips = prep[service.slug] ?? ["Llega 10 minutos antes de tu hora.", "Trae su carnet de vacunas y exámenes anteriores si los tienes."];

  return (
    <>
      <header className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div>
            <Breadcrumbs items={[{ label: "Veterinaria y guardería", href: "/servicios" }, { label: service.name }]} />
            <span className={styles.icon} style={{ marginTop: "1.4rem", background: "var(--surface)" }}>
              <ServiceIcon name={service.icon} />
            </span>
            <h1>{service.name}</h1>
            <p className={styles.lead}>{service.description}</p>
            <div className={styles.heroActions}>
              <Link href={`/servicios/agendar?servicio=${service.slug}`} className={isDaycare ? "btn btn--primary" : "btn btn--sky"}>
                {isDaycare ? "Reservar un día" : "Agendar esta atención"}
              </Link>
              <p className={styles.next}>
                {service.priceFrom ? (
                  <>
                    Desde <strong>{formatCLP(service.priceFrom)}</strong>
                  </>
                ) : (
                  "Valor a consultar"
                )}
                {!isDaycare && <>, {service.durationMin} min aprox.</>}
              </p>
            </div>
          </div>
          <div className={styles.heroPhoto}>
            <Image src={servicePhoto[service.slug] ?? photos.vetExam} alt="" fill priority sizes="(max-width: 860px) 100vw, 520px" />
          </div>
        </div>
      </header>

      <section className="section container" aria-labelledby="preparacion">
        <h2 id="preparacion" className={styles.h2}>
          {isDaycare ? "Requisitos" : "Antes de venir"}
        </h2>
        <ul className="prose">
          {tips.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className={styles.note}>
          ¿Tienes dudas? Escríbenos a <a href={`https://wa.me/${site.contact.whatsapp}`}>WhatsApp</a> o llámanos al {site.contact.phone}.
        </p>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: service.name,
          description: service.description,
          provider: { "@id": `${site.url}/#negocio` },
          areaServed: site.contact.city,
          ...(service.priceFrom ? { offers: { "@type": "Offer", price: service.priceFrom, priceCurrency: "CLP" } } : {}),
        }}
      />
    </>
  );
}
