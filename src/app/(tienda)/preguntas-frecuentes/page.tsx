import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { site } from "@/config/site";
import { formatCLP } from "@/lib/format";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Despachos, retiro en tienda, medios de pago, cambios y devoluciones, agenda veterinaria y guardería.",
  alternates: { canonical: "/preguntas-frecuentes" },
};

const groups = [
  {
    title: "Compras y despacho",
    items: [
      {
        q: "¿Cuánto cuesta el despacho?",
        a: `En la Región Metropolitana cuesta ${formatCLP(site.shipping.metropolitanFee)} y es gratis en compras sobre ${formatCLP(site.shipping.metropolitanFreeFrom)}. A regiones cuesta ${formatCLP(site.shipping.regionsFee)}, gratis sobre ${formatCLP(site.shipping.regionsFreeFrom)}.`,
      },
      { q: "¿Cuándo llega mi pedido?", a: "En la Región Metropolitana despachamos en 24 a 48 horas hábiles desde que se confirma el pago. A regiones, entre 3 y 5 días hábiles." },
      { q: "¿Puedo retirar en la tienda?", a: "Sí, sin costo. Si compras antes de las 17:00 tu pedido queda listo el mismo día. Te avisamos por correo cuando esté preparado." },
      { q: "¿Qué medios de pago aceptan?", a: "Webpay (tarjetas de débito, crédito y prepago) y transferencia bancaria. Si eliges retiro en tienda, también puedes pagar en caja al retirar." },
    ],
  },
  {
    title: "Cambios y devoluciones",
    items: [
      { q: "¿Puedo devolver un producto?", a: "Tienes 10 días desde que recibes tu compra para retractarte, siempre que el producto esté sellado y sin uso, según la Ley del Consumidor. Los alimentos abiertos y medicamentos no tienen cambio por razones sanitarias." },
      { q: "Me llegó un producto dañado, ¿qué hago?", a: "Escríbenos por WhatsApp con una foto dentro de las 48 horas siguientes a la entrega y lo reponemos sin costo." },
    ],
  },
  {
    title: "Veterinaria y guardería",
    items: [
      { q: "¿Cómo agendo una hora?", a: "Desde la sección Agendar hora eliges el servicio, el día y el horario disponible. Te confirmamos por correo y WhatsApp." },
      { q: "¿Venden medicamentos con receta?", a: "Sí, pero solo en el local y presentando la receta del médico veterinario. En la web aparecen como referencia." },
      { q: "¿Qué necesita mi perro para ir a la guardería?", a: "Vacunas al día, desparasitación vigente y una evaluación de convivencia de 30 minutos antes del primer día." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Preguntas frecuentes" }]} />
      <h1>Preguntas frecuentes</h1>
      <p className={styles.lead}>Si no encuentras tu respuesta, escríbenos por WhatsApp al {site.contact.phone}.</p>

      <div className={styles.faq}>
        {groups.map((g) => (
          <section key={g.title}>
            <h2>{g.title}</h2>
            {g.items.map((it) => (
              <details key={it.q}>
                <summary>{it.q}</summary>
                <p>{it.a}</p>
              </details>
            ))}
          </section>
        ))}
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: groups.flatMap((g) => g.items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a } }))),
        }}
      />
    </div>
  );
}
