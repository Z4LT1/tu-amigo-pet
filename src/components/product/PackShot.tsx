/**
 * Packshot ilustrado: representa el envase del producto con el color de su marca
 * mientras la tienda no cargue fotografías propias. La forma depende de la categoría.
 */
type Shape = "bag" | "can" | "box" | "bottle";

const shapeByIcon: Record<string, Shape> = {
  bowl: "bag",
  sand: "bag",
  can: "can",
  bone: "box",
  toy: "box",
  drop: "bottle",
  shield: "box",
  pill: "bottle",
  ear: "bottle",
  cross: "box",
};

function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, v));
  const r = clamp((n >> 16) + amount);
  const g = clamp(((n >> 8) & 0xff) + amount);
  const b = clamp((n & 0xff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}

function Paw({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx="-7" cy="-4" rx="3" ry="3.8" />
      <ellipse cx="-2.4" cy="-9" rx="3" ry="3.8" />
      <ellipse cx="2.4" cy="-9" rx="3" ry="3.8" />
      <ellipse cx="7" cy="-4" rx="3" ry="3.8" />
      <path d="M0 9c-7-4-8-9-4-10.5 1.8-.6 3.2.4 4 1.6.8-1.2 2.2-2.2 4-1.6 4 1.5 3 6.5-4 10.5Z" />
    </g>
  );
}

export function PackShot({
  brand,
  color,
  icon,
  presentation,
  title,
  className,
}: {
  brand: string;
  color: string;
  icon?: string | null;
  presentation?: string;
  title?: string;
  className?: string;
}) {
  const shape = shapeByIcon[icon ?? ""] ?? "bag";
  const dark = shade(color, -38);
  const light = shade(color, 40);
  const id = `g${color.slice(1)}${shape}`;
  const font = { fontFamily: "var(--ff-display)" } as const;
  const brandText = brand.toUpperCase();

  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={title ?? brand} className={className}>
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.35" stopColor={color} />
          <stop offset="0.7" stopColor={light} />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="182" rx="58" ry="7" fill="rgb(23 32 51 / 0.12)" />

      {shape === "bag" && (
        <g>
          <path d="M52 40 L148 40 L152 170 Q152 178 144 178 L56 178 Q48 178 48 170 Z" fill={`url(#${id})`} />
          <path d="M52 26 h96 v18 h-96 z" fill={dark} />
          <path d="M52 44 l6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6 6-6 6 6v4H52z" fill={dark} opacity="0.55" />
          <rect x="64" y="70" width="72" height="76" rx="10" fill="#fffcf7" />
          <text x="100" y="88" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={dark} style={font} letterSpacing="0.5">
            {brandText}
          </text>
          <Paw x={100} y={114} s={1.25} fill={color} />
          {presentation && (
            <text x="100" y="140" textAnchor="middle" fontSize="9" fontWeight="700" fill="#4a3d33" style={font}>
              {presentation}
            </text>
          )}
          <path d="M60 52 Q62 120 58 170" stroke="#fff" strokeOpacity="0.25" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      )}

      {shape === "can" && (
        <g>
          <rect x="54" y="60" width="92" height="114" rx="8" fill={`url(#${id})`} />
          <ellipse cx="100" cy="60" rx="46" ry="11" fill={light} />
          <ellipse cx="100" cy="60" rx="38" ry="7" fill={shade(color, 70)} />
          <rect x="54" y="92" width="92" height="52" fill="#fffcf7" />
          <text x="100" y="110" textAnchor="middle" fontSize="10.5" fontWeight="800" fill={dark} style={font}>
            {brandText}
          </text>
          <Paw x={100} y={130} s={0.85} fill={color} />
          <rect x="54" y="88" width="92" height="4" fill={dark} />
          <rect x="54" y="144" width="92" height="4" fill={dark} />
          {presentation && (
            <text x="100" y="164" textAnchor="middle" fontSize="9" fontWeight="700" fill="#fffcf7" style={font}>
              {presentation}
            </text>
          )}
        </g>
      )}

      {shape === "box" && (
        <g>
          <path d="M60 52 L140 52 L156 40 L76 40 Z" fill={light} />
          <path d="M140 52 L156 40 L156 162 L140 176 Z" fill={dark} />
          <rect x="44" y="52" width="96" height="124" rx="4" fill={`url(#${id})`} />
          <rect x="54" y="74" width="76" height="70" rx="8" fill="#fffcf7" />
          <text x="92" y="92" textAnchor="middle" fontSize="10" fontWeight="800" fill={dark} style={font}>
            {brandText}
          </text>
          <Paw x={92} y={118} s={1.05} fill={color} />
          {presentation && (
            <text x="92" y="162" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fffcf7" style={font}>
              {presentation}
            </text>
          )}
        </g>
      )}

      {shape === "bottle" && (
        <g>
          <rect x="84" y="22" width="32" height="22" rx="5" fill={dark} />
          <path d="M80 44 h40 l10 20 v104 q0 10 -10 10 h-40 q-10 0 -10 -10 v-104 z" fill={`url(#${id})`} />
          <rect x="76" y="86" width="48" height="64" rx="7" fill="#fffcf7" />
          <text x="100" y="101" textAnchor="middle" fontSize="8" fontWeight="800" fill={dark} style={font}>
            {brandText}
          </text>
          <Paw x={100} y={124} s={0.85} fill={color} />
          {presentation && (
            <text x="100" y="144" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#4a3d33" style={font}>
              {presentation}
            </text>
          )}
          <path d="M80 70 Q78 120 80 160" stroke="#fff" strokeOpacity="0.3" strokeWidth="4" fill="none" strokeLinecap="round" />
        </g>
      )}
    </svg>
  );
}
