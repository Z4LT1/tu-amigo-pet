# Puesta en producción

Pasos para llevar el prototipo a un sitio público operado por el negocio. Cada punto indica quién es el titular, porque el dominio, las cuentas de pago y los datos de clientes deben quedar **a nombre del negocio**, no del desarrollador.

## 1. Dominio `.cl`

- Registro en [NIC Chile](https://www.nic.cl) a nombre del RUT de la empresa o del dueño. Ejemplo: `tuamigopet.cl`. La renovación es anual.
- Conviene registrar también variantes de error frecuente (`tuamigopet.com` y `tu-amigo-pet.cl`) para redirigirlas al dominio principal.
- DNS: apuntar el dominio al hosting y configurar los registros de correo (MX, SPF, DKIM y DMARC) para que los correos de pedidos no lleguen a spam.

## 2. Hosting y base de datos

| Componente | Opción recomendada | Notas |
|---|---|---|
| Aplicación | Vercel | Despliegue automático desde GitHub, HTTPS incluido |
| Base de datos | PostgreSQL administrado (Neon o Supabase) | Cambiar `provider = "postgresql"` en `prisma/schema.prisma` |
| Imágenes | Almacenamiento de objetos (Vercel Blob o S3) | Para las fotos que suba el local |
| Respaldos | Copia diaria automática de la base de datos | Incluida en los planes pagados |

Variables de producción: `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL=https://www.tuamigopet.cl`, un `AUTH_SECRET` nuevo y una contraseña de administrador robusta. El limitador de intentos en memoria se reemplaza por uno distribuido (Upstash Redis) si el sitio corre en más de una instancia.

## 3. Pagos

- **Webpay Plus (Transbank).** El comercio firma el contrato con Transbank y obtiene su código de comercio. La integración usa el SDK oficial (`transbank-sdk`) y reemplaza la pasarela simulada:
  1. Al confirmar el pedido se crea la transacción y se redirige al formulario de Webpay.
  2. Al volver se confirma (`commit`) la transacción y el pedido pasa a "Pagado".
  3. Si se rechaza, el pedido queda pendiente para reintentar, como ya funciona en el prototipo.

  Transbank exige aprobar un proceso de validación en su ambiente de integración antes de pasar a producción.
- **Transferencia.** Reemplazar los datos bancarios de `src/config/site.ts` por los de la cuenta del negocio.
- **Pago en tienda.** Se puede desactivar con `payments.payOnPickup` en la misma configuración.

## 4. Boleta electrónica

Las ventas online requieren boleta electrónica del SII. Lo práctico es usar un proveedor certificado (por ejemplo, el sistema que ya use el local en caja) y emitir la boleta cuando el pedido pasa a "Pagado".

## 5. Correos transaccionales

Servicio de envío (Resend, Postmark o Amazon SES) con el dominio propio para enviar:

- confirmación de pedido y datos de transferencia;
- aviso de "pedido listo para retiro" y de "pedido enviado";
- confirmación y recordatorio de la hora veterinaria o de guardería.

## 6. SEO local y visibilidad

- **Google Search Console**: verificar el dominio y enviar `https://www.tuamigopet.cl/sitemap.xml`.
- **Perfil de Empresa en Google**: categoría principal "Veterinaria" y secundarias "Tienda de mascotas" y "Guardería de mascotas". Usar el mismo nombre, dirección y teléfono del sitio, con fotos de la fachada y de la guardería, y enlazar a `/servicios/agendar`.
- **Datos estructurados**: el sitio ya publica `PetStore` + `VeterinaryCare`. Validar con la [prueba de resultados enriquecidos](https://search.google.com/test/rich-results) una vez publicado.
- **Contenido**: publicar un artículo de consejos al mes, sobre las preguntas que más se repiten en el mesón.
- **Reseñas**: pedir reseñas en Google después de cada atención o compra.

## 7. Analítica y privacidad

- Analítica liviana y sin cookies (Plausible o Umami), o Google Analytics 4 con aviso de cookies.
- Revisar la política de privacidad con un abogado antes de publicar, considerando la Ley 21.719 de protección de datos personales.

## 8. Checklist de lanzamiento

- [ ] Datos reales del negocio en `src/config/site.ts` (dirección, horario, teléfono, redes y datos bancarios).
- [ ] Catálogo real cargado y fotos propias en lugar de las de referencia.
- [ ] Servicios y precios confirmados por el veterinario.
- [ ] Webpay en producción y prueba de compra real de bajo monto.
- [ ] Correos transaccionales configurados.
- [ ] Términos, privacidad y política de cambios revisados.
- [ ] Search Console y Perfil de Empresa en Google configurados.
- [ ] Contraseña de administrador cambiada y respaldos activos.
