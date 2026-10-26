import Image from "next/image";
import Link from "next/link";
import { daycareToday } from "@/content/media";
import styles from "./ShutterHero.module.css";

/**
 * Portada: la cortina metálica azul del local. En la primera visita de la sesión
 * la cortina sube y deja ver la tienda abierta; es la única animación automática del sitio.
 */
export function ShutterHero() {
  return (
    <section className={styles.hero} aria-labelledby="hero-title">
      <script
        // Se ejecuta antes del primer pintado: si ya se vio la apertura en esta sesión, no se repite
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem('tap-cortina'))document.documentElement.dataset.cortina='vista';else sessionStorage.setItem('tap-cortina','1')}catch(e){}`,
        }}
      />
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <h1 id="hero-title" className={styles.title}>
            Alimento, farmacia y veterinario a la vuelta de la esquina
          </h1>
          <p className={styles.lead}>
            Compra online y te lo llevamos, o pasa a retirarlo. Si tu perro necesita control, vacuna o un día de guardería, también lo
            vemos aquí.
          </p>
          <div className={styles.actions}>
            <Link href="/perros" className="btn btn--light">
              Comprar para perro
            </Link>
            <Link href="/gatos" className="btn btn--light">
              Comprar para gato
            </Link>
            <Link href="/servicios/agendar" className={`btn ${styles.book}`}>
              Agendar hora veterinaria
            </Link>
          </div>
        </div>

        <aside className={styles.daycare} aria-label="Hoy en la guardería">
          <p className={styles.daycareTitle}>Hoy en la guardería</p>
          <ul role="list" className={styles.photos}>
            {daycareToday.map((g, i) => (
              <li key={g.name} className={styles.photo} style={{ "--i": i } as React.CSSProperties}>
                <Image src={g.photo} alt={`${g.name} en la guardería`} fill sizes="(max-width: 860px) 60vw, 300px" priority={i === 0} />
                <p className={styles.caption}>
                  <strong>{g.name}</strong>
                  <span>{g.note}</span>
                </p>
              </li>
            ))}
          </ul>
          <Link href="/servicios/guarderia-de-dia" className={styles.daycareLink}>
            Cómo funciona la guardería
          </Link>
        </aside>
      </div>

      <div className={styles.shutter} aria-hidden>
        <span className={styles.handle} />
      </div>
    </section>
  );
}
