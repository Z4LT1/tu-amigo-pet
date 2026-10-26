import Image from "next/image";
import { PackShot } from "./PackShot";

/** Miniatura cuadrada: la foto del producto si existe, si no el envase ilustrado. */
export function ProductThumb({
  name,
  brand,
  color,
  icon,
  imageUrl,
  size = 96,
}: {
  name: string;
  brand: string;
  color: string;
  icon?: string | null;
  imageUrl?: string | null;
  size?: number;
}) {
  return (
    <span style={{ position: "relative", display: "block", aspectRatio: "1", width: "100%" }}>
      {imageUrl ? (
        <Image src={imageUrl} alt={name} fill sizes={`${size}px`} style={{ objectFit: "contain", padding: "8%" }} />
      ) : (
        <PackShot brand={brand} color={color} icon={icon} title={name} />
      )}
    </span>
  );
}
