import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { site } from "@/config/site";
import styles from "../info.module.css";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: `Condiciones de compra, despacho, retracto y uso del sitio de ${site.name}.`,
  alternates: { canonical: "/terminos-y-condiciones" },
};

export default function TermsPage() {
  return (
    <div className={`container ${styles.page}`}>
      <Breadcrumbs items={[{ label: "Términos y condiciones" }]} />
      <h1>Términos y condiciones</h1>
      <p className={styles.updated}>Última actualización: octubre de 2026</p>

      <div className={`prose ${styles.body}`}>
        <p>
          Estos términos regulan las compras realizadas en este sitio, operado por {site.legalName} (en adelante, “la tienda”). Al comprar aceptas estas
          condiciones, que se rigen por la Ley N° 19.496 sobre Protección de los Derechos de los Consumidores.
        </p>

        <h2>Precios y stock</h2>
        <p>
          Los precios se expresan en pesos chilenos e incluyen IVA. Las ofertas son válidas mientras dure el stock informado. Si un producto se agota
          después de tu compra, te contactaremos para ofrecerte un reemplazo o la devolución total del dinero.
        </p>

        <h2>Medios de pago</h2>
        <p>
          Aceptamos Webpay (débito, crédito y prepago), transferencia bancaria y, para pedidos con retiro en tienda, pago en caja. Los pedidos con
          transferencia se preparan una vez confirmado el pago. Las reservas con pago en caja se mantienen por {site.payments.pickupHoldHours} horas.
        </p>

        <h2>Despacho y retiro</h2>
        <p>
          Los plazos de despacho se cuentan en días hábiles desde la confirmación del pago. El costo se informa antes de pagar. En el retiro en tienda,
          debes presentar el número de pedido y tu documento de identidad.
        </p>

        <h2>Derecho a retracto, cambios y devoluciones</h2>
        <ul>
          <li>Puedes retractarte de tu compra dentro de 10 días desde que recibes el producto, siempre que esté sellado y sin uso.</li>
          <li>Por razones sanitarias no se aceptan devoluciones de alimentos abiertos, medicamentos ni productos de higiene usados.</li>
          <li>Si un producto llega dañado o con fallas, lo cambiamos sin costo. Avísanos dentro de las 48 horas siguientes a la entrega.</li>
        </ul>

        <h2>Medicamentos veterinarios</h2>
        <p>Los medicamentos que requieren receta se venden solo en el local, presentando la receta del médico veterinario.</p>

        <h2>Servicios veterinarios y guardería</h2>
        <p>
          Las horas solicitadas por la web quedan confirmadas cuando te contactamos. Los valores publicados son referenciales y el valor final depende de
          la evaluación. Si no puedes asistir, avísanos con al menos 3 horas de anticipación.
        </p>

        <h2>Contacto</h2>
        <p>
          Para cualquier consulta o reclamo escríbenos a {site.contact.email} o al {site.contact.phone}.
        </p>
      </div>
    </div>
  );
}
