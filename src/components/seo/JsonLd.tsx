/** Inserta datos estructurados schema.org (JSON-LD) para buscadores. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // El contenido es generado por el servidor; se escapa "<" para evitar cierre de etiqueta
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
