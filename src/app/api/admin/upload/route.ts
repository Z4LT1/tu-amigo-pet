import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "crypto";
import { put } from "@vercel/blob";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

const TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png" };
const MAX_BYTES = 4 * 1024 * 1024;

/**
 * Subida de fotos de producto desde el panel. La imagen llega ya reducida desde el
 * navegador; aquí se valida y se guarda en Vercel Blob. En desarrollo con base de datos
 * local y sin token de Blob, se guarda en /public/uploads para poder probar sin configurar nada.
 */
export async function POST(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: "Tu sesión expiró. Vuelve a ingresar al panel." }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No llegó ninguna imagen." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: "Formato no soportado. Usa una foto JPG, PNG o WebP." }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "La imagen pesa más de 4 MB." }, { status: 413 });

  const name = `producto-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}.${ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`productos/${name}`, file, { access: "public", contentType: file.type });
    return NextResponse.json({ url: blob.url });
  }

  // Solo con base local: con una base compartida (Neon) la ruta local quedaría rota en el sitio publicado
  const localDb = /@(localhost|127\.0\.0\.1)[:/]/.test(process.env.DATABASE_URL ?? "");
  if (process.env.NODE_ENV !== "production" && localDb) {
    const { mkdir, writeFile } = await import("fs/promises");
    const path = await import("path");
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url: `/uploads/${name}` });
  }

  return NextResponse.json(
    { error: "El almacenamiento de fotos no está activado. Falta BLOB_READ_WRITE_TOKEN (Vercel → Storage → Blob)." },
    { status: 503 },
  );
}
