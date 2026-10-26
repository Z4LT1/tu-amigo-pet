import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { BookingForm } from "@/components/services/BookingForm";
import { getServices } from "@/lib/catalog";
import { nowInChile } from "@/lib/agenda";
import styles from "./booking.module.css";

export const metadata: Metadata = {
  title: "Agendar hora veterinaria o guardería",
  description: "Elige el servicio, el día y la hora disponible. Recibirás la confirmación por correo.",
  alternates: { canonical: "/servicios/agendar" },
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ servicio?: string }> };

export default async function BookingPage({ searchParams }: Props) {
  const [{ servicio }, services] = await Promise.all([searchParams, getServices()]);
  const preselected = services.find((s) => s.slug === servicio)?.id;

  return (
    <div className={styles.page}>
      <div className="container">
        <Breadcrumbs items={[{ label: "Veterinaria y guardería", href: "/servicios" }, { label: "Agendar" }]} />
        <h1 className={styles.title}>Agendar hora</h1>
        <p className={styles.lead}>Elige el servicio, el día y la hora. Te confirmamos por correo y WhatsApp antes de tu visita.</p>
        <BookingForm
          today={nowInChile().date}
          preselected={preselected}
          services={services.map((s) => ({ id: s.id, name: s.name, summary: s.summary, priceFrom: s.priceFrom, kind: s.kind, icon: s.icon, durationMin: s.durationMin }))}
        />
      </div>
    </div>
  );
}
