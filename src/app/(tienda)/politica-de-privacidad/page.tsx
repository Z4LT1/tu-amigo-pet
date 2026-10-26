import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: `Cómo ${site.name} recolecta, usa y protege tus datos personales.`,
  alternates: { canonical: "/politica-de-privacidad" },
};

export default function PrivacyPage() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Política de privacidad" }]} />
      <h1>Política de privacidad</h1>
      <p className={styles.updated}>Última actualización: octubre de 2026</p>

      <div className={`prose ${styles.body}`}>
        <p>
          En {site.legalName} tratamos tus datos personales conforme a la Ley N° 19.628 sobre Protección de la Vida Privada y a la Ley N° 21.719, que la
          reemplaza progresivamente. Solo pedimos los datos necesarios para entregarte tus compras y atender a tu mascota.
        </p>

        <h2>Qué datos recolectamos</h2>
        <ul>
          <li>Al comprar: nombre, correo, celular, RUT (opcional) y dirección de despacho.</li>
          <li>Al agendar: tus datos de contacto y el nombre, especie y edad de tu mascota.</li>
          <li>Al suscribirte: tu correo electrónico.</li>
        </ul>
        <p>No almacenamos datos de tarjetas: los pagos con tarjeta se procesan directamente en la plataforma de pago.</p>

        <h2>Para qué los usamos</h2>
        <ul>
          <li>Procesar, despachar y hacer seguimiento de tus pedidos.</li>
          <li>Confirmar y recordarte las horas agendadas.</li>
          <li>Enviarte ofertas y recordatorios, solo si te suscribiste. Puedes darte de baja cuando quieras.</li>
        </ul>

        <h2>Con quién los compartimos</h2>
        <p>Solo con la empresa de despacho y la plataforma de pago, en lo estrictamente necesario. Nunca vendemos tus datos.</p>

        <h2>Tus derechos</h2>
        <p>
          Puedes solicitar acceso, rectificación, eliminación u oposición al tratamiento de tus datos escribiendo a {site.contact.email}. Respondemos
          dentro de los plazos que establece la ley.
        </p>

        <h2>Almacenamiento en tu navegador</h2>
        <p>
          Guardamos tu carrito y si ya viste un aviso en el almacenamiento local de tu navegador. No usamos cookies de publicidad. La única cookie del sitio
          corresponde a la sesión del panel de administración.
        </p>
      </div>
    </div>
  );
}
