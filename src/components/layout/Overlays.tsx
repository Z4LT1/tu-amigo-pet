"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ArrowRight, CalendarDays, ChevronRight, ShoppingBag, Trash2, Truck, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ProductThumb } from "@/components/product/ProductThumb";
import { QuantityStepper } from "@/components/product/QuantityStepper";
import { site } from "@/config/site";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatCLP } from "@/lib/format";
import { useUI } from "@/lib/ui-store";
import { useMounted } from "@/lib/use-mounted";
import { helpLinks, mainLinks, petMenus, type NavCategory } from "./nav";
import { SearchBox } from "./SearchBox";
import styles from "./Panels.module.css";

/** Bloquea el scroll del documento y cierra con Escape mientras un panel está abierto. */
function useSheet(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
}

function CloseOnNavigate() {
  const pathname = usePathname();
  const closeUI = useUI((s) => s.close);
  const closeCart = useCart((s) => s.close);
  useEffect(() => {
    closeUI();
    closeCart();
  }, [pathname, closeUI, closeCart]);
  return null;
}

export function FreeShippingMeter({ subtotal }: { subtotal: number }) {
  const goal = site.shipping.metropolitanFreeFrom;
  const missing = Math.max(0, goal - subtotal);
  const pct = Math.min(100, Math.round((subtotal / goal) * 100));
  return (
    <div className={styles.meter}>
      <p>
        <Truck />
        {missing > 0 ? (
          <span>
            Te faltan <strong>{formatCLP(missing)}</strong> para despacho gratis en RM
          </span>
        ) : (
          <span>
            <strong>¡Tienes despacho gratis</strong> en la Región Metropolitana!
          </span>
        )}
      </p>
      <div className={styles.meterTrack} aria-hidden>
        <span style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function CartDrawer() {
  const { items, isOpen, close, setQuantity, remove } = useCart();
  const mounted = useMounted();
  useSheet(isOpen, close);
  const subtotal = cartSubtotal(items);

  return (
    <div className={styles.layer} data-open={isOpen} inert={!isOpen}>
      <div className={styles.scrim} onClick={close} />
      <aside className={`${styles.sheet} ${styles.right}`} role="dialog" aria-modal="true" aria-label="Carrito de compras">
        <header className={styles.sheetHead}>
          <h2>Tu carrito</h2>
          <button type="button" className={styles.iconBtn} onClick={close} aria-label="Cerrar carrito">
            <X />
          </button>
        </header>

        {!mounted || items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>
              <ShoppingBag />
            </span>
            <p>Tu carrito está vacío.</p>
            <p className="muted">Tu amigo merece algo rico hoy.</p>
            <Link href="/tienda" className="btn btn--primary" onClick={close}>
              Ir a la tienda <ArrowRight />
            </Link>
          </div>
        ) : (
          <>
            <FreeShippingMeter subtotal={subtotal} />
            <ul role="list" className={styles.lines}>
              {items.map((item) => (
                <li key={item.productId} className={styles.line}>
                  <Link href={`/producto/${item.slug}`} onClick={close} className={styles.lineThumb}>
                    <ProductThumb name={item.name} brand={item.brand} color={item.packColor} icon={item.categoryIcon} imageUrl={item.imageUrl} size={76} />
                  </Link>
                  <div className={styles.lineBody}>
                    <Link href={`/producto/${item.slug}`} onClick={close} className={styles.lineName}>
                      {item.name}
                    </Link>
                    <span className={styles.lineSub}>{item.presentation}</span>
                    <div className={styles.lineFoot}>
                      <QuantityStepper size="sm" value={item.quantity} max={item.stock} onChange={(n) => setQuantity(item.productId, n)} />
                      <strong>{formatCLP(item.price * item.quantity)}</strong>
                    </div>
                  </div>
                  <button type="button" className={styles.remove} onClick={() => remove(item.productId)} aria-label={`Quitar ${item.name}`}>
                    <Trash2 />
                  </button>
                </li>
              ))}
            </ul>
            <footer className={styles.sheetFoot}>
              <div className={styles.total}>
                <span>Subtotal</span>
                <strong>{formatCLP(subtotal)}</strong>
              </div>
              <p className={styles.note}>El despacho se calcula en el siguiente paso.</p>
              <Link href="/checkout" className="btn btn--primary btn--block" onClick={close}>
                Ir a pagar <ArrowRight />
              </Link>
              <Link href="/carrito" className="btn btn--ghost btn--block" onClick={close}>
                Ver carrito
              </Link>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const { panel, close } = useUI();
  const open = panel === "menu";
  useSheet(open, close);

  return (
    <div className={styles.layer} data-open={open} inert={!open}>
      <div className={styles.scrim} onClick={close} />
      <aside className={`${styles.sheet} ${styles.left}`} role="dialog" aria-modal="true" aria-label="Menú">
        <header className={styles.sheetHead}>
          <Logo compact />
          <button type="button" className={styles.iconBtn} onClick={close} aria-label="Cerrar menú">
            <X />
          </button>
        </header>
        <nav className={styles.menuBody} aria-label="Menú móvil">
          <div className={styles.petTiles}>
            {petMenus.map((m) => (
              <Link key={m.key} href={m.href} className={`${styles.petTile} ${m.key === "gatos" ? styles.petTileAlt : ""}`}>
                <span>{m.label}</span>
                <ArrowRight />
              </Link>
            ))}
          </div>

          <p className={styles.menuTitle}>Categorías</p>
          <ul role="list" className={styles.menuList}>
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`}>
                  {c.name}
                  <ChevronRight />
                </Link>
              </li>
            ))}
          </ul>

          <p className={styles.menuTitle}>Tienda y veterinaria</p>
          <ul role="list" className={styles.menuList}>
            {mainLinks
              .filter((l) => l.href !== "/categoria/arenas-sanitarias")
              .map((l) => (
                <li key={l.href}>
                  <Link href={l.href} data-tone={l.tone}>
                    {l.label}
                    <ChevronRight />
                  </Link>
                </li>
              ))}
          </ul>

          <Link href="/servicios/agendar" className="btn btn--primary btn--block">
            <CalendarDays /> Agendar hora
          </Link>

          <p className={styles.menuTitle}>Ayuda</p>
          <ul role="list" className={styles.menuListPlain}>
            {helpLinks.slice(0, 3).map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

function SearchOverlay() {
  const { panel, close } = useUI();
  const open = panel === "search";
  useSheet(open, close);
  return (
    <div className={styles.layer} data-open={open} inert={!open}>
      <div className={styles.scrim} onClick={close} />
      <div className={`${styles.sheet} ${styles.top}`} role="dialog" aria-modal="true" aria-label="Buscar">
        <div className={styles.searchHead}>
          {open && <SearchBox autoFocus onNavigate={close} id="buscador-movil" />}
          <button type="button" className={styles.iconBtn} onClick={close} aria-label="Cerrar búsqueda">
            <X />
          </button>
        </div>
        <p className={styles.menuTitle}>Búsquedas frecuentes</p>
        <div className={styles.chips}>
          {["Arena aglomerante", "Cachorro", "Antipulgas", "Senior", "Sachet", "Snacks dentales"].map((t) => (
            <Link key={t} href={`/tienda?q=${encodeURIComponent(t.split(" ")[0])}`} className={styles.chip}>
              {t}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Overlays({ categories }: { categories: NavCategory[] }) {
  return (
    <>
      <CloseOnNavigate />
      <CartDrawer />
      <MobileMenu categories={categories} />
      <SearchOverlay />
    </>
  );
}
