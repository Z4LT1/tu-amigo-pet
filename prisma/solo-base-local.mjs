/**
 * Freno de seguridad para `npm run db:seed` y `npm run db:reset`: esos comandos BORRAN
 * los datos, así que se detienen si DATABASE_URL apunta a una base que no es local.
 * Para hacerlo a propósito en una base remota, definir CONFIRMAR_BASE_REMOTA=si.
 */
import { existsSync } from "node:fs";

if (existsSync(".env")) process.loadEnvFile(".env");

const url = process.env.DATABASE_URL ?? "";
const isLocal = /(@|\/\/)(localhost|127\.0\.0\.1)[:/]/.test(url);

if (!isLocal && process.env.CONFIRMAR_BASE_REMOTA !== "si") {
  console.error("\nDetenido: DATABASE_URL no apunta a una base local y este comando borra los datos.");
  console.error("Si de verdad quieres borrar esa base, define CONFIRMAR_BASE_REMOTA=si y repite el comando.\n");
  process.exit(1);
}
