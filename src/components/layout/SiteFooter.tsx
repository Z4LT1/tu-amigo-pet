import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/config/site";
import { getCategories } from "@/lib/catalog";
import { helpLinks } from "./nav";
import { NewsletterForm } from "./NewsletterForm";
import styles from "./SiteFooter.module.css";

export async function SiteFooter() {
  const [shop, pharmacy] = await Promise.all([getCategories("TIENDA"), getCategories("FARMACIA")]);
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.news}`}>
        <div>
          <h2 className={styles.newsTitle}>Ofertas y recordatorios, una vez al mes</h2>
          <p className={styles.newsText}>Te avisamos de liquidaciones y de cuándo toca vacuna o antiparasitario.</p>
        </div>
        <NewsletterForm />
      </div>

      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo inverted />
          <p>{site.tagline}. Alimento, farmacia, consultas y guardería en un mismo lugar.</p>
          <ul role="list" className={styles.contact}>
            <li>
              <MapPin /> {site.contact.address}, {site.contact.city}
            </li>
            <li>
              <Phone /> <a href={`https://wa.me/${site.contact.whatsapp}`}>{site.contact.phone}</a>
            </li>
            <li>
              <Mail /> <a href={`mailto:${site.contact.email}`}>{site.contact.email}</a>
            </li>
          </ul>
        </div>

        <nav aria-label="Tienda">
          <h3>Tienda</h3>
          <ul role="list">
            <li>
              <Link href="/perros">Perros</Link>
            </li>
            <li>
              <Link href="/gatos">Gatos</Link>
            </li>
            {shop.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/ofertas">Ofertas</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Veterinaria">
          <h3>Veterinaria</h3>
          <ul role="list">
            <li>
              <Link href="/servicios">Servicios y precios</Link>
            </li>
            <li>
              <Link href="/servicios/agendar">Agendar hora</Link>
            </li>
            <li>
              <Link href="/servicios/guarderia-de-dia">Guardería de día</Link>
            </li>
            <li>
              <Link href="/farmacia">Farmacia</Link>
            </li>
            {pharmacy.slice(0, 3).map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Ayuda">
          <h3>Ayuda</h3>
          <ul role="list">
            {helpLinks.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/blog">Consejos de cuidado</Link>
            </li>
          </ul>
        </nav>

        <div>
          <h3>Horario</h3>
          <ul role="list" className={styles.hours}>
            {site.contact.hours.map((h) => (
              <li key={h.days}>
                <Clock />
                <span>
                  {h.days}
                  <strong>{h.time}</strong>
                </span>
              </li>
            ))}
          </ul>
          <h3 className={styles.payTitle}>Medios de pago</h3>
          <p className={styles.pay}>Webpay (débito y crédito) y transferencia bancaria.</p>
        </div>
      </div>

      <div className={`container ${styles.legal}`}>
        <p>
          © {year} {site.legalName}. Precios en pesos chilenos con IVA incluido.
        </p>
        <p>
          <Link href="/terminos-y-condiciones">Términos</Link>
          <Link href="/politica-de-privacidad">Privacidad</Link>
        </p>
      </div>
    </footer>
  );
}
