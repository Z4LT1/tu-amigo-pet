import { ImageResponse } from "next/og";
import { site } from "@/config/site";

const LOGO = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <defs><clipPath id="c"><rect width="48" height="48" rx="13"/></clipPath></defs>
  <g clip-path="url(#c)">
    <rect width="48" height="48" fill="#2a5da8"/>
    <path d="M11 12c-5 2-7 9-5 15 1 2 4 2 5 0l3-10Z" fill="#172033"/>
    <path d="M37 12c5 2 7 9 5 15-1 2-4 2-5 0l-3-10Z" fill="#172033"/>
    <path d="M24 9c8 0 13 6 13 13 0 7-5 12-13 12s-13-5-13-12C11 15 16 9 24 9Z" fill="#fff"/>
    <path d="M27 14c4-1 7 2 7 6s-3 6-6 5c-3-1-4-3-4-6 0-2 1-4 3-5Z" fill="#172033"/>
    <circle cx="18.5" cy="20" r="1.8" fill="#172033"/>
    <circle cx="29" cy="20" r="1.8" fill="#fff"/>
    <circle cx="29.3" cy="20.3" r="0.9" fill="#172033"/>
    <path d="M24 29.5c-3-1.8-3.6-4-2-4.7.9-.3 1.6.2 2 .8.4-.6 1.1-1.1 2-.8 1.6.7 1 2.9-2 4.7Z" fill="#172033"/>
    <path d="M9 33h30l-15 15Z" fill="#d42e2e"/>
    <g fill="#fff"><circle cx="17" cy="37" r="1.3"/><circle cx="24" cy="41" r="1.3"/><circle cx="31" cy="37" r="1.3"/></g>
  </g>
</svg>`)}`;

export const alt = `${site.name}, ${site.kind}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen para compartir en WhatsApp, Facebook e Instagram: la cortina azul del local. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#fff",
          backgroundColor: "#2a5da8",
          backgroundImage: "repeating-linear-gradient(180deg, rgba(255,255,255,0) 0px, rgba(255,255,255,0) 26px, rgba(255,255,255,0.12) 26px, rgba(255,255,255,0.12) 28px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 40, fontWeight: 800 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} width={84} height={84} alt="" style={{ borderRadius: 20, border: "4px solid #fff" }} />
          {site.name}
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 800, lineHeight: 1.02, maxWidth: 960 }}>
          Alimento, farmacia y veterinario a la vuelta de la esquina
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 30 }}>
          <span style={{ background: "#ffe14d", color: "#172033", padding: "6px 16px", fontWeight: 700 }}>Despacho en Santiago</span>
          <span style={{ background: "#d42e2e", padding: "6px 16px", fontWeight: 700 }}>Agenda online</span>
        </div>
      </div>
    ),
    size,
  );
}
