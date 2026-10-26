"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Link2, Trash2 } from "lucide-react";
import styles from "@/app/admin/admin.module.css";

const MAX_SIDE = 1600;

/** Reduce la foto en el navegador (las del celular pesan varios MB) y la entrega como WebP o JPEG. */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const toBlob = (type: string) => new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.82));
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("No se pudo procesar la imagen.");
  return jpeg;
}

export function ImageUploader({ initialUrl, fallback }: { initialUrl?: string | null; fallback: React.ReactNode }) {
  const [url, setUrl] = useState(initialUrl ?? "");
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [message, setMessage] = useState("");
  const [showLink, setShowLink] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    setStatus("uploading");
    setMessage("");
    try {
      const blob = await shrink(file);
      const body = new FormData();
      body.append("file", blob, blob.type === "image/webp" ? "foto.webp" : "foto.jpg");
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "No se pudo subir la foto.");
      setUrl(data.url);
      setStatus("idle");
      setMessage("Foto lista. Pulsa “Guardar cambios” para dejarla en la tienda.");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "No se pudo subir la foto.");
    } finally {
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className={styles.uploader}>
      <input type="hidden" name="imageUrl" value={url} />
      <div className={styles.uploaderPreview} aria-busy={status === "uploading"}>
        {url ? <Image src={url} alt="Foto del producto" fill sizes="180px" className={styles.uploaderImg} /> : fallback}
        {status === "uploading" && <span className={styles.uploaderOverlay}>Subiendo…</span>}
      </div>

      <div className={styles.uploaderActions}>
        <input
          ref={input}
          id="photo-file"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/*"
          className="visually-hidden"
          onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
        />
        <label htmlFor="photo-file" className="btn btn--primary btn--sm" aria-disabled={status === "uploading"}>
          <Camera /> {url ? "Cambiar foto" : "Subir foto"}
        </label>
        {url && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setUrl("")}>
            <Trash2 /> Quitar foto
          </button>
        )}
        <button type="button" className={styles.linkToggle} onClick={() => setShowLink((v) => !v)}>
          <Link2 /> {showLink ? "Ocultar enlace" : "Usar un enlace"}
        </button>
        <p className="muted">Desde el celular puedes tomar la foto en el momento. Se ajusta sola al tamaño de la tienda.</p>
        {message && <p className={status === "error" ? "field-error" : styles.okText}>{message}</p>}
      </div>

      {showLink && (
        <div className={`field ${styles.span2}`}>
          <label htmlFor="imageLink">Dirección de la imagen</label>
          <input id="imageLink" className="input" type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value.trim())} />
        </div>
      )}
    </div>
  );
}
