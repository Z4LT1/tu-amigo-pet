/** Estructura de navegación compartida por el header, el menú móvil y el footer. */
export type NavCategory = { slug: string; name: string };

export const petMenus = [
  { key: "perros", label: "Perros", href: "/perros" },
  { key: "gatos", label: "Gatos", href: "/gatos" },
] as const;

export const mainLinks = [
  { label: "Arenas", href: "/categoria/arenas-sanitarias" },
  { label: "Farmacia", href: "/farmacia", tone: "celeste" as const },
  { label: "Veterinaria y guardería", href: "/servicios" },
  { label: "Consejos", href: "/blog" },
  { label: "Ofertas", href: "/ofertas", tone: "sale" as const },
];

export const helpLinks = [
  { label: "Seguimiento de pedido", href: "/seguimiento" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Contacto", href: "/contacto" },
  { label: "Términos y condiciones", href: "/terminos-y-condiciones" },
  { label: "Política de privacidad", href: "/politica-de-privacidad" },
];
