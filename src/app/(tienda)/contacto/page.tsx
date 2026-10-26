import type { Metadata } from "next";
import Link from "next/link";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Contacto y horario",
  description: `Dirección, horario y WhatsApp de ${site.name}. Escríbenos para consultas de productos, despacho o la agenda veterinaria.`,
  alternates: { canonical: "/contacto" },
};

export default function ContactPage() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${site.name} ${site.contact.address} ${site.contact.city}`)}`;
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Contacto" }]} />
      <h1>Contacto</h1>
      <p className={styles.lead}>La forma más rápida de hablar con nosotros es WhatsApp. Respondemos dentro del horario de atención.</p>

      <div className={styles.contact}>
        <section className={styles.channel}>
          <MessageCircle />
          <h2>WhatsApp y teléfono</h2>
          <p>Consultas de productos, despacho, stock o tu hora veterinaria.</p>
          <a href={`https://wa.me/${site.contact.whatsapp}`} target="_blank" rel="noopener noreferrer">
            {site.contact.phone}
          </a>
          <p>
            o al correo <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
          </p>
        </section>
        <section className={styles.channel}>
          <MapPin />
          <h2>Dirección</h2>
          <p>
            {site.contact.address}, {site.contact.city}, {site.contact.region}.
          </p>
          <a href={maps} target="_blank" rel="noopener noreferrer">
            Abrir en Google Maps
          </a>
        </section>
        <section className={styles.channel}>
          <Clock />
          <h2>Horario</h2>
          <ul role="list">
            {site.contact.hours.map((h) => (
              <li key={h.days}>
                {h.days}: <strong>{h.time}</strong>
              </li>
            ))}
          </ul>
          <p>
            Guardería: ingreso de 8:00 a 9:30. <Link href="/servicios/guarderia-de-dia">Ver requisitos</Link>
          </p>
        </section>
      </div>
    </div>
  );
}
