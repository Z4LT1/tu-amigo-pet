import { APPOINTMENT_STATUS, ORDER_STATUS } from "@/lib/constants";
import styles from "@/app/admin/admin.module.css";

export function StatusBadge({ status, kind = "order" }: { status: string; kind?: "order" | "appointment" }) {
  const map = kind === "order" ? ORDER_STATUS : APPOINTMENT_STATUS;
  const s = map[status as keyof typeof map] as { label: string; tone: string } | undefined;
  return (
    <span className={styles.status} data-tone={s?.tone ?? "slate"}>
      {s?.label ?? status}
    </span>
  );
}
