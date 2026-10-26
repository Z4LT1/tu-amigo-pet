# Tu Amigo Pet

E-commerce y sistema de gestión para una tienda y veterinaria de barrio en Santiago de Chile. Reúne en un solo sitio la venta online de alimento y accesorios para mascotas, una farmacia veterinaria, la agenda de la clínica y la guardería de día, y un panel de administración para controlar inventario, pedidos y reservas.

La identidad visual nace del propio local: las cortinas metálicas pintadas a mano, con su azul de fondo, el perro con la pañoleta roja y la veterinaria con el gato. La portada abre con esa cortina, que sube para mostrar la tienda.

> Prototipo funcional. Las marcas, productos, pedidos y datos de contacto incluidos son de demostración.

## Características

### Tienda
- Catálogo por mascota (perros y gatos), categoría, etapa de vida, marca y rango de precio, con orden y paginación.
- Buscador con autocompletado y navegación por teclado.
- Ficha de producto con stock en tiempo real, aviso de últimas unidades y productos relacionados.
- Carrito persistente con medidor de despacho gratis.
- Checkout con despacho a domicilio o retiro en tienda, cálculo de envío por región y validación de RUT y celular chilenos.
- Medios de pago: Webpay (pasarela simulada), transferencia bancaria y pago en caja al retirar, con reserva de 48 horas.
- Página de estado del pedido con línea de tiempo y seguimiento por código y correo.
- Sección de ofertas y aviso de liquidación que se muestra una vez por semana y nunca durante la compra.

### Farmacia veterinaria
- Universo visual propio en celeste, separado de la tienda.
- Los medicamentos con receta se exhiben, pero se bloquea su compra online y se dirige la venta al local.

### Veterinaria y guardería
- Lista de servicios con precios de referencia.
- Agenda online con disponibilidad real: un box de atención por bloque para la clínica y cupos diarios para la guardería.
- La portada muestra la próxima hora disponible, calculada desde la agenda.

### Panel de administración
- Resumen con ventas del mes, pedidos por gestionar, productos bajo el stock mínimo, horas por confirmar y ventas de los últimos 14 días.
- Productos: alta, edición, visibilidad, ofertas y productos destacados.
- Inventario: entradas, salidas y ajustes por conteo físico, con historial de movimientos y valorización a costo y a precio de venta.
- Pedidos: filtros por estado y cambio de estado. Al cancelar un pedido el stock vuelve al inventario automáticamente.
- Agenda: confirmación, cierre o cancelación de las reservas.

### Contenido y SEO
- Blog de consejos de cuidado escrito por el equipo.
- Metadatos por página, URLs canónicas, `sitemap.xml` dinámico, `robots.txt` y manifiesto web.
- Datos estructurados schema.org: `PetStore` + `VeterinaryCare`, `Product`, `Service`, `BreadcrumbList`, `BlogPosting` y `FAQPage`.
- Imagen Open Graph generada para compartir en WhatsApp y redes sociales.
- Contenido en español de Chile (`es-CL`) y precios en CLP con IVA incluido.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Lenguaje | TypeScript |
| Base de datos | Prisma ORM. SQLite en desarrollo y PostgreSQL en producción |
| Estilos | CSS propio con CSS Modules y tokens de diseño, sin framework de UI |
| Tipografía | Archivo (variable, con eje de ancho) |
| Estado del carrito | Zustand con persistencia local |
| Validación | Zod |
| Autenticación | Sesión JWT (jose) en cookie httpOnly y contraseñas con bcrypt |
| Íconos | Lucide |

## Arquitectura

```
prisma/
  schema.prisma        Modelo de datos
  seed.ts              Datos de demostración
src/
  app/
    (tienda)/          Sitio público: inicio, catálogo, producto, farmacia,
                       servicios, agenda, blog, carrito, checkout y pedidos
    admin/             Panel protegido: resumen, productos, inventario,
                       pedidos y agenda
    api/               Endpoints de búsqueda y disponibilidad de horarios
    sitemap.ts, robots.ts, manifest.ts, opengraph-image.tsx
  components/          Componentes por dominio (layout, product, catalog,
                       checkout, services, admin, ui)
  config/site.ts       Datos del negocio: nombre, contacto, horarios,
                       despacho y medios de pago
  content/             Artículos del blog y fotografías de referencia
  lib/                 Acceso a datos, agenda, validaciones, sesión y utilidades
  server/              Server Actions: pedidos, reservas y administración
  middleware.ts        Protección de las rutas /admin
```

### Modelo de datos

- **Product**, **Category**, **Brand**: catálogo, con categorías separadas por sección (tienda o farmacia).
- **InventoryMovement**: registro de cada cambio de stock (entrada, salida, ajuste, venta y devolución) con el stock resultante.
- **Order**, **OrderItem**: pedidos con precios congelados al momento de la compra.
- **Service**, **Appointment**: servicios de clínica y guardería, y sus reservas.
- **AdminUser**, **Subscriber**: usuarios del panel y suscriptores del boletín.

### Decisiones relevantes

- **Sin sobreventa.** El stock se descuenta dentro de una transacción con una actualización condicional (`stock >= cantidad`). Si dos clientes compran la última unidad al mismo tiempo, solo uno lo logra.
- **El servidor es la fuente de verdad.** Precios, costos de despacho y disponibilidad se recalculan en el servidor. El carrito del navegador solo guarda la selección.
- **Trazabilidad del inventario.** El stock solo cambia mediante movimientos, nunca editándolo directamente, para que el dueño pueda auditar cada diferencia.
- **Configuración central.** Los datos del negocio viven en `src/config/site.ts`. Cambiarlos actualiza textos, pie de página, datos estructurados y checkout.
- **Accesibilidad.** Contraste AA, foco visible, navegación por teclado, `prefers-reduced-motion` respetado y estados que nunca dependen solo del color.
- **Diseño móvil propio.** Barra de navegación inferior, filtros en panel deslizable, botón de compra fijo en la ficha de producto y carruseles táctiles.

## Ejecutar localmente

Requisitos: Node.js 20 o superior.

```bash
npm install
cp .env.example .env      # completar AUTH_SECRET y ADMIN_PASSWORD
npm run db:push
npm run db:seed
npm run dev
```

El sitio queda en `http://localhost:3000` y el panel en `/admin`, con el usuario definido en `.env`.

### Variables de entorno

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a la base de datos |
| `NEXT_PUBLIC_SITE_URL` | URL pública, usada en canónicas, sitemap y Open Graph |
| `AUTH_SECRET` | Secreto de al menos 32 caracteres para firmar la sesión del panel |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Usuario administrador creado por el seed |

### Scripts

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` / `npm run typecheck` | Calidad de código |
| `npm run db:push` | Sincroniza el esquema con la base de datos |
| `npm run db:seed` | Carga los datos de demostración |
| `npm run db:reset` | Reinicia la base y vuelve a cargar los datos |
| `npm run db:studio` | Explorador visual de la base de datos |

## Hoja de ruta

- Integración real con Transbank Webpay Plus.
- Correos transaccionales de confirmación de pedido y de reserva.
- Emisión de boleta electrónica (SII) mediante un proveedor certificado.
- Carga de fotografías de productos y de la guardería desde el panel.
- Cuentas de cliente con historial y recompra rápida.

El detalle del paso a producción (dominio `.cl`, hosting, pagos, SEO local y analítica) está en [`docs/puesta-en-produccion.md`](docs/puesta-en-produccion.md).

## Créditos

Fotografías de referencia: [Unsplash](https://unsplash.com), bajo la licencia de Unsplash. Se reemplazan por fotografías propias del local antes de publicar.

## Derechos

El diseño, la marca y el contenido pertenecen a sus respectivos titulares. Se publica como muestra de trabajo y no autoriza la reutilización de la marca "Tu Amigo Pet".
