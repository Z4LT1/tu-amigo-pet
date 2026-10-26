import Link from "next/link";
import { CalendarDays, ChevronDown, Menu, PawPrint, Truck } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { site } from "@/config/site";
import { formatCLP } from "@/lib/format";
import { getCategories } from "@/lib/catalog";
import { mainLinks, petMenus } from "./nav";
import { SearchBox } from "./SearchBox";
import { CartButton, MenuButton } from "./HeaderButtons";
import styles from "./SiteHeader.module.css";

const stages = [
  { label: "Cachorros", etapa: "cachorro" },
  { label: "Adultos", etapa: "adulto" },
  { label: "Seniors", etapa: "senior" },
];

export async function SiteHeader() {
  const categories = await getCategories("TIENDA");
  const forPet = {
    perros: categories.filter((c) => c.slug !== "arenas-sanitarias"),
    gatos: categories,
  };

  const messages = [
    { icon: <Truck />, text: `Despacho gratis en RM sobre ${formatCLP(site.shipping.metropolitanFreeFrom)}` },
    { icon: <CalendarDays />, text: "Agenda tu hora veterinaria online" },
    { icon: <PawPrint />, text: "Guardería de día de lunes a viernes" },
  ];

  return (
    <>
      <div className={styles.announce} role="region" aria-label="Avisos">
        <div className={`container ${styles.announceInner}`}>
          {messages.map((m, i) => (
            <p key={i} className={styles.announceItem} style={{ "--i": i } as React.CSSProperties}>
              {m.icon}
              {m.text}
            </p>
          ))}
        </div>
      </div>

      <header className={styles.header}>
        <div className={`container ${styles.bar}`}>
          <MenuButton className={styles.menuBtn}>
            <Menu />
          </MenuButton>
          <Logo />
          <div className={styles.search}>
            <SearchBox />
          </div>
          <div className={styles.actions}>
            <Link href="/servicios/agendar" className={`btn btn--sm btn--ghost ${styles.book}`}>
              <CalendarDays />
              Agendar hora
            </Link>
            <CartButton />
          </div>
        </div>

        <nav className={styles.nav} aria-label="Principal">
          <ul role="list" className={`container ${styles.navList}`}>
            {petMenus.map((menu) => (
              <li key={menu.key} className={styles.hasMenu}>
                <Link href={menu.href} className={styles.navLink}>
                  {menu.label}
                  <ChevronDown className={styles.chev} />
                </Link>
                <div className={styles.mega}>
                  <div className={styles.megaCol}>
                    <p className={styles.megaTitle}>Categorías</p>
                    <ul role="list">
                      {forPet[menu.key].map((c) => (
                        <li key={c.slug}>
                          <Link href={`${menu.href}?categoria=${c.slug}`}>{c.name}</Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.megaCol}>
                    <p className={styles.megaTitle}>Por etapa</p>
                    <ul role="list">
                      {stages.map((s) => (
                        <li key={s.etapa}>
                          <Link href={`${menu.href}?etapa=${s.etapa}`}>{menu.key === "gatos" && s.etapa === "cachorro" ? "Gatitos" : s.label}</Link>
                        </li>
                      ))}
                      <li>
                        <Link href={`${menu.href}?ofertas=1`}>En oferta</Link>
                      </li>
                    </ul>
                  </div>
                  <Link
                    href={menu.key === "perros" ? "/servicios/guarderia-de-dia" : "/categoria/arenas-sanitarias"}
                    className={`${styles.megaPromo} ${menu.key === "gatos" ? styles.megaPromoAlt : ""}`}
                  >
                    <span className="eyebrow">{menu.key === "perros" ? "Nuevo" : "Lo más pedido"}</span>
                    <strong>{menu.key === "perros" ? "Guardería de día" : "Arenas sanitarias"}</strong>
                    <span>{menu.key === "perros" ? "Juego, paseos y supervisión mientras trabajas." : "Aglomerantes, sílica y ecológicas."}</span>
                  </Link>
                </div>
              </li>
            ))}
            {mainLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className={`${styles.navLink} ${l.tone === "celeste" ? styles.navCeleste : ""} ${l.tone === "sale" ? styles.navSale : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </>
  );
}
