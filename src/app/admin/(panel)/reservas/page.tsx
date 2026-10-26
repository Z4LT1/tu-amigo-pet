import Link from "next/link";
import { prisma } from "@/lib/db";
import { nowInChile } from "@/lib/agenda";
import { APPOINTMENT_STATUS, SPECIES } from "@/lib/constants";
import { formatYMD } from "@/lib/format";
import { updateAppointmentStatus } from "@/server/admin";
import { StatusBadge } from "@/components/admin/StatusBadge";
import styles from "../../admin.module.css";

export const metadata = { title: "Agenda" };

type Props = { searchParams: Promise<{ ver?: string }> };

export default async function AppointmentsAdmin({ searchParams }: Props) {
  const { ver } = await searchParams;
  const today = nowInChile().date;
  const past = ver === "anteriores";
  const appointments = await prisma.appointment.findMany({
    where: past ? { date: { lt: today } } : { date: { gte: today } },
    orderBy: past ? [{ date: "desc" }, { time: "desc" }] : [{ date: "asc" }, { time: "asc" }],
    include: { service: { select: { name: true, kind: true } } },
    take: 120,
  });

  const byDate = new Map<string, typeof appointments>();
  for (const a of appointments) byDate.set(a.date, [...(byDate.get(a.date) ?? []), a]);

  return (
    <>
      <header className={styles.pageHead}>
        <div>
          <h1>Agenda</h1>
          <p className="muted">Horas de clínica y reservas de guardería solicitadas desde la web.</p>
        </div>
      </header>

      <nav className={styles.tabs} aria-label="Periodo">
        <Link href="/admin/reservas" aria-current={!past ? "page" : undefined}>
          Próximas
        </Link>
        <Link href="/admin/reservas?ver=anteriores" aria-current={past ? "page" : undefined}>
          Anteriores
        </Link>
      </nav>

      {byDate.size === 0 && <p className={styles.emptyRow}>No hay reservas en este periodo.</p>}

      {[...byDate.entries()].map(([date, list]) => (
        <section key={date} className={styles.panel}>
          <h2 className={styles.dayTitle}>
            {date === today ? "Hoy, " : ""}
            {formatYMD(date)}
            <span className="muted">{list.length} reservas</span>
          </h2>
          <ul role="list" className={styles.agenda}>
            {list.map((a) => (
              <li key={a.id} data-status={a.status}>
                <time>{a.time}</time>
                <div>
                  <strong>
                    {a.petName}, {SPECIES[a.species as keyof typeof SPECIES] ?? a.species}
                    {a.petAge ? `, ${a.petAge}` : ""}
                  </strong>
                  <span>
                    {a.service.name}. {a.ownerName}, <a href={`tel:${a.phone}`}>{a.phone}</a>
                  </span>
                  {a.notes && <small>“{a.notes}”</small>}
                </div>
                <form action={updateAppointmentStatus.bind(null, a.id)} className={styles.inlineStatus}>
                  <StatusBadge status={a.status} kind="appointment" />
                  <select name="status" className="select" defaultValue={a.status} aria-label={`Estado de la reserva de ${a.petName}`}>
                    {Object.entries(APPOINTMENT_STATUS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                  <button className="btn btn--sm btn--ghost">Guardar</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
