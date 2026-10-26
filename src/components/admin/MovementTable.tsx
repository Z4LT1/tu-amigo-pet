import type { InventoryMovement } from "@prisma/client";
import { MOVEMENT_TYPES } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import styles from "@/app/admin/admin.module.css";

type Row = InventoryMovement & { product: { name: string } };

export function MovementTable({ movements, compact = false }: { movements: Row[]; compact?: boolean }) {
  if (movements.length === 0) return <p className="muted">Sin movimientos registrados.</p>;
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Fecha</th>
            {!compact && <th>Producto</th>}
            <th>Tipo</th>
            <th className={styles.num}>Cant.</th>
            <th className={styles.num}>Stock</th>
            {!compact && <th>Detalle</th>}
          </tr>
        </thead>
        <tbody>
          {movements.map((m) => (
            <tr key={m.id}>
              <td className={styles.nowrap}>{formatDateTime(m.createdAt)}</td>
              {!compact && <td>{m.product.name}</td>}
              <td>{MOVEMENT_TYPES[m.type as keyof typeof MOVEMENT_TYPES] ?? m.type}</td>
              <td className={`${styles.num} ${m.quantity > 0 ? styles.plus : styles.minus}`}>
                {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
              </td>
              <td className={styles.num}>{m.stockAfter}</td>
              {!compact && (
                <td>
                  {m.reason ?? m.reference ?? ""}
                  {m.createdBy && <small>{m.createdBy}</small>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
