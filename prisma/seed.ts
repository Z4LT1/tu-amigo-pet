/**
 * Datos de demostración: catálogo, servicios, pedidos y reservas de ejemplo.
 * Las marcas y productos son ficticios; el catálogo real se carga desde el
 * panel de administración.
 */
import { PrismaClient, type Product, type Service } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const categories = [
  { slug: "alimento-seco", name: "Alimento seco", icon: "bowl", section: "TIENDA", description: "Alimento completo y balanceado para cada etapa de vida." },
  { slug: "alimento-humedo", name: "Alimento húmedo", icon: "can", section: "TIENDA", description: "Latas, sachets y pouches llenos de sabor e hidratación." },
  { slug: "snacks-y-premios", name: "Snacks y premios", icon: "bone", section: "TIENDA", description: "Premios para entrenar, consentir y cuidar la salud dental." },
  { slug: "arenas-sanitarias", name: "Arenas sanitarias", icon: "sand", section: "TIENDA", description: "Arenas aglomerantes, de sílica y biodegradables." },
  { slug: "juguetes-y-accesorios", name: "Juguetes y accesorios", icon: "toy", section: "TIENDA", description: "Collares, camas, comederos, rascadores y juguetes." },
  { slug: "higiene-y-cuidado", name: "Higiene y cuidado", icon: "drop", section: "TIENDA", description: "Shampoo, toallitas, bolsas sanitarias y cepillos." },
  { slug: "antiparasitarios", name: "Antiparasitarios", icon: "shield", section: "FARMACIA", description: "Pipetas, comprimidos y collares contra pulgas, garrapatas y parásitos internos." },
  { slug: "suplementos-y-vitaminas", name: "Suplementos y vitaminas", icon: "pill", section: "FARMACIA", description: "Articulaciones, piel y pelaje, digestión y sistema inmune." },
  { slug: "dermatologia-y-oidos", name: "Dermatología y oídos", icon: "ear", section: "FARMACIA", description: "Limpiadores óticos, shampoos medicados y cicatrizantes." },
  { slug: "medicamentos", name: "Medicamentos", icon: "cross", section: "FARMACIA", description: "Productos de uso veterinario. Algunos requieren receta." },
];

const brands = [
  { name: "NutriCan", color: "#B3261E" },
  { name: "Felinia", color: "#6B2FA0" },
  { name: "Andes Natural", color: "#2E6B3A" },
  { name: "Prime Paws", color: "#1D4E9E" },
  { name: "Arenix", color: "#0F7C74" },
  { name: "VetPlus", color: "#0B79B8" },
  { name: "Mordisco", color: "#D9640B" },
  { name: "Pelusa", color: "#B0306A" },
];

type SeedProduct = {
  name: string;
  brand: string;
  category: string;
  species: "PERRO" | "GATO" | "AMBOS" | "OTROS";
  lifeStage?: "CACHORRO" | "ADULTO" | "SENIOR" | "TODAS";
  presentation: string;
  weightKg?: number;
  price: number;
  compareAtPrice?: number;
  stock: number;
  minStock?: number;
  featured?: boolean;
  rx?: boolean;
  short: string;
};

const products: SeedProduct[] = [
  // Alimento seco perro
  { name: "NutriCan Adulto Razas Medianas", brand: "NutriCan", category: "alimento-seco", species: "PERRO", lifeStage: "ADULTO", presentation: "15 kg", weightKg: 15, price: 52990, compareAtPrice: 59990, stock: 24, featured: true, short: "Proteína de pollo y arroz con omega 3 y 6 para un pelaje brillante." },
  { name: "NutriCan Cachorro Razas Pequeñas", brand: "NutriCan", category: "alimento-seco", species: "PERRO", lifeStage: "CACHORRO", presentation: "3 kg", weightKg: 3, price: 18990, stock: 18, featured: true, short: "Croqueta pequeña con DHA para el desarrollo cerebral y visual." },
  { name: "Andes Natural Grain Free Cordero", brand: "Andes Natural", category: "alimento-seco", species: "PERRO", lifeStage: "ADULTO", presentation: "12 kg", weightKg: 12, price: 74990, stock: 9, featured: true, short: "Sin granos, con cordero patagónico y vegetales seleccionados." },
  { name: "Prime Paws Senior 7+", brand: "Prime Paws", category: "alimento-seco", species: "PERRO", lifeStage: "SENIOR", presentation: "10 kg", weightKg: 10, price: 46990, stock: 4, short: "Glucosamina y condroitina para cuidar las articulaciones." },
  { name: "Prime Paws Light Control de Peso", brand: "Prime Paws", category: "alimento-seco", species: "PERRO", lifeStage: "ADULTO", presentation: "15 kg", weightKg: 15, price: 55990, compareAtPrice: 62990, stock: 13, short: "Menos calorías y L-carnitina para mantener el peso ideal." },
  { name: "Mordisco Clásico Carne y Cereales", brand: "Mordisco", category: "alimento-seco", species: "PERRO", lifeStage: "ADULTO", presentation: "21 kg", weightKg: 21, price: 32990, stock: 30, short: "Nutrición completa al mejor precio para perros adultos." },
  // Alimento seco gato
  { name: "Felinia Adulto Salmón", brand: "Felinia", category: "alimento-seco", species: "GATO", lifeStage: "ADULTO", presentation: "7,5 kg", weightKg: 7.5, price: 41990, compareAtPrice: 46990, stock: 16, featured: true, short: "Con salmón real, taurina y control de bolas de pelo." },
  { name: "Felinia Gatito", brand: "Felinia", category: "alimento-seco", species: "GATO", lifeStage: "CACHORRO", presentation: "1,5 kg", weightKg: 1.5, price: 12990, stock: 22, short: "Alta energía y proteína para gatitos de 2 a 12 meses." },
  { name: "Felinia Esterilizado Urinary", brand: "Felinia", category: "alimento-seco", species: "GATO", lifeStage: "ADULTO", presentation: "3 kg", weightKg: 3, price: 21990, stock: 3, featured: true, short: "Ayuda a mantener el tracto urinario sano en gatos esterilizados." },
  { name: "Andes Natural Gato Pollo y Pavo", brand: "Andes Natural", category: "alimento-seco", species: "GATO", lifeStage: "ADULTO", presentation: "6 kg", weightKg: 6, price: 49990, stock: 8, short: "Receta natural alta en proteína, sin colorantes artificiales." },
  // Húmedo
  { name: "Felinia Sachet Atún en Salsa", brand: "Felinia", category: "alimento-humedo", species: "GATO", lifeStage: "ADULTO", presentation: "85 g", weightKg: 0.085, price: 990, stock: 140, minStock: 30, short: "Trozos jugosos de atún en salsa. Pack individual." },
  { name: "Felinia Pack 12 Sachets Mix", brand: "Felinia", category: "alimento-humedo", species: "GATO", lifeStage: "ADULTO", presentation: "12 x 85 g", price: 10990, compareAtPrice: 11880, stock: 25, featured: true, short: "Variedad de pollo, carne y pescado para gatos exigentes." },
  { name: "NutriCan Lata Pollo y Verduras", brand: "NutriCan", category: "alimento-humedo", species: "PERRO", lifeStage: "ADULTO", presentation: "340 g", weightKg: 0.34, price: 2490, stock: 60, minStock: 15, short: "Paté con trozos de pollo y verduras, ideal como topper." },
  { name: "Andes Natural Pouch Cordero", brand: "Andes Natural", category: "alimento-humedo", species: "PERRO", lifeStage: "TODAS", presentation: "100 g", weightKg: 0.1, price: 1590, stock: 0, minStock: 20, short: "Cordero en su jugo, sin granos ni conservantes." },
  // Snacks
  { name: "Mordisco Huesitos Dentales", brand: "Mordisco", category: "snacks-y-premios", species: "PERRO", presentation: "7 unidades", price: 4990, compareAtPrice: 5990, stock: 45, featured: true, short: "Reducen el sarro y refrescan el aliento." },
  { name: "Mordisco Premios de Entrenamiento", brand: "Mordisco", category: "snacks-y-premios", species: "PERRO", presentation: "200 g", price: 3990, stock: 38, short: "Bocados pequeños y blandos, perfectos para adiestramiento." },
  { name: "Felinia Snack Cremoso Pollo", brand: "Felinia", category: "snacks-y-premios", species: "GATO", presentation: "4 x 15 g", price: 2990, stock: 52, short: "Snack cremoso para dar en la mano. Irresistible." },
  // Arenas
  { name: "Arenix Aglomerante Lavanda", brand: "Arenix", category: "arenas-sanitarias", species: "GATO", presentation: "10 kg", weightKg: 10, price: 11990, compareAtPrice: 13990, stock: 35, featured: true, short: "Forma bloques firmes y neutraliza olores por hasta 7 días." },
  { name: "Arenix Sílica Cristales", brand: "Arenix", category: "arenas-sanitarias", species: "GATO", presentation: "3,8 L", price: 9990, stock: 20, short: "Alta absorción, cero polvo y rendimiento de un mes." },
  { name: "Arenix Eco Pellet de Madera", brand: "Arenix", category: "arenas-sanitarias", species: "GATO", presentation: "15 kg", weightKg: 15, price: 14990, stock: 2, short: "100% biodegradable, compostable y libre de químicos." },
  { name: "Arenix Aglomerante Sin Aroma", brand: "Arenix", category: "arenas-sanitarias", species: "GATO", presentation: "20 kg", weightKg: 20, price: 19990, stock: 14, short: "Fórmula hipoalergénica para gatos sensibles." },
  // Accesorios
  { name: "Pelusa Cama Redonda Antiestrés", brand: "Pelusa", category: "juguetes-y-accesorios", species: "AMBOS", presentation: "Talla M · 60 cm", price: 24990, compareAtPrice: 32990, stock: 7, featured: true, short: "Borde elevado y relleno suave que ayuda a relajarse." },
  { name: "Pelusa Rascador Torre 3 Niveles", brand: "Pelusa", category: "juguetes-y-accesorios", species: "GATO", presentation: "90 cm", price: 34990, stock: 5, short: "Postes de sisal, plataformas y casita para descansar." },
  { name: "Prime Paws Collar Reflectante", brand: "Prime Paws", category: "juguetes-y-accesorios", species: "PERRO", presentation: "Talla M", price: 7990, stock: 26, short: "Nylon resistente con costuras reflectantes para paseos nocturnos." },
  { name: "Mordisco Pelota Mordedora", brand: "Mordisco", category: "juguetes-y-accesorios", species: "PERRO", presentation: "7 cm", price: 4490, stock: 40, short: "Caucho natural ultra resistente, apta para rellenar con premios." },
  { name: "Pelusa Comedero Doble Acero", brand: "Pelusa", category: "juguetes-y-accesorios", species: "AMBOS", presentation: "2 x 400 ml", price: 9990, stock: 11, short: "Acero inoxidable con base antideslizante." },
  // Higiene
  { name: "Pelusa Shampoo Avena Piel Sensible", brand: "Pelusa", category: "higiene-y-cuidado", species: "AMBOS", presentation: "500 ml", price: 8990, stock: 19, short: "pH balanceado con avena coloidal y aloe vera." },
  { name: "Prime Paws Bolsas Sanitarias", brand: "Prime Paws", category: "higiene-y-cuidado", species: "PERRO", presentation: "8 rollos", price: 4990, stock: 48, short: "Bolsas resistentes y biodegradables con dispensador." },
  { name: "Pelusa Toallitas Húmedas", brand: "Pelusa", category: "higiene-y-cuidado", species: "AMBOS", presentation: "100 unidades", price: 5490, stock: 4, short: "Limpieza rápida de patitas, ojos y pelaje." },
  // Farmacia
  { name: "VetPlus Pipeta Antipulgas Perro 10-20 kg", brand: "VetPlus", category: "antiparasitarios", species: "PERRO", presentation: "1 pipeta", price: 12990, compareAtPrice: 14990, stock: 33, featured: true, short: "Protección de 30 días contra pulgas, garrapatas y piojos." },
  { name: "VetPlus Pipeta Antipulgas Gato", brand: "VetPlus", category: "antiparasitarios", species: "GATO", presentation: "1 pipeta", price: 10990, stock: 21, short: "Acción rápida y duradera para gatos desde 8 semanas." },
  { name: "VetPlus Antiparasitario Interno", brand: "VetPlus", category: "antiparasitarios", species: "AMBOS", presentation: "4 comprimidos", price: 8990, stock: 6, short: "Amplio espectro contra parásitos intestinales." },
  { name: "VetPlus Collar Antiparasitario 8 meses", brand: "VetPlus", category: "antiparasitarios", species: "PERRO", presentation: "Talla grande", price: 29990, stock: 10, short: "Liberación prolongada contra pulgas y garrapatas." },
  { name: "VetPlus Articular Forte", brand: "VetPlus", category: "suplementos-y-vitaminas", species: "PERRO", presentation: "60 comprimidos", price: 19990, stock: 12, featured: true, short: "Glucosamina, MSM y colágeno para articulaciones sanas." },
  { name: "VetPlus Omega Piel y Pelaje", brand: "VetPlus", category: "suplementos-y-vitaminas", species: "AMBOS", presentation: "250 ml", price: 15990, stock: 9, short: "Aceite de pescado rico en EPA y DHA." },
  { name: "VetPlus Probiótico Digestivo", brand: "VetPlus", category: "suplementos-y-vitaminas", species: "AMBOS", presentation: "30 sobres", price: 13990, stock: 1, short: "Restablece la flora intestinal tras diarreas o tratamientos." },
  { name: "VetPlus Limpiador Ótico", brand: "VetPlus", category: "dermatologia-y-oidos", species: "AMBOS", presentation: "120 ml", price: 9490, stock: 15, short: "Remueve cerumen y previene otitis." },
  { name: "VetPlus Spray Cicatrizante", brand: "VetPlus", category: "dermatologia-y-oidos", species: "AMBOS", presentation: "100 ml", price: 8490, stock: 17, short: "Protege heridas superficiales y acelera la cicatrización." },
  { name: "VetPlus Antiinflamatorio Oral", brand: "VetPlus", category: "medicamentos", species: "PERRO", presentation: "20 comprimidos", price: 17990, stock: 8, rx: true, short: "Uso bajo prescripción médico veterinaria." },
  { name: "VetPlus Antibiótico Amplio Espectro", brand: "VetPlus", category: "medicamentos", species: "AMBOS", presentation: "10 comprimidos", price: 14990, stock: 6, rx: true, short: "Venta exclusiva con receta médico veterinaria." },
];

const services = [
  { name: "Guardería de día", kind: "GUARDERIA", icon: "home", priceFrom: 12000, durationMin: 480, summary: "Tu perro acompañado, jugando y supervisado mientras trabajas.", description: "Jornada diurna con supervisión permanente, paseos, juego en grupo según temperamento, descanso y alimentación según tus indicaciones. Ingreso por la mañana y retiro hasta el cierre. Se requiere vacunas al día y evaluación previa de convivencia." },
  { name: "Consulta veterinaria", icon: "stethoscope", priceFrom: 18000, durationMin: 30, summary: "Evaluación general, diagnóstico y plan de tratamiento.", description: "Atención médica completa: examen físico, revisión de historial, diagnóstico y recomendaciones de tratamiento y alimentación." },
  { name: "Esterilización", icon: "scissors", priceFrom: 45000, durationMin: 60, summary: "Cirugía programada con evaluación previa y control post operatorio.", description: "Incluye evaluación pre quirúrgica, anestesia inhalatoria, cirugía, collar isabelino y control a los 10 días. Valor final según especie, sexo y peso." },
  { name: "Vacunación", icon: "syringe", priceFrom: 15000, durationMin: 20, summary: "Óctuple, antirrábica, triple felina y calendario completo.", description: "Aplicación de vacunas según el calendario de tu mascota, con registro en su carnet sanitario." },
  { name: "Control sano y desparasitación", icon: "heart", priceFrom: 12000, durationMin: 20, summary: "Chequeo preventivo, peso y desparasitación interna y externa.", description: "Control preventivo periódico ideal para cachorros, adultos y seniors. Incluye control de peso y recomendación antiparasitaria." },
  { name: "Peluquería y baño", icon: "bath", priceFrom: 15000, durationMin: 60, summary: "Baño, secado, corte higiénico, limpieza de oídos y uñas.", description: "Servicio de estética con productos dermatológicos suaves. Valor según tamaño y tipo de pelaje." },
  { name: "Microchip e inscripción", icon: "chip", priceFrom: 15000, durationMin: 15, summary: "Implantación de microchip y registro en Ley 21.020.", description: "Implantación de microchip y apoyo en la inscripción en el Registro Nacional de Mascotas (Ley de Tenencia Responsable 21.020)." },
];

const firstNames = ["Camila", "Matías", "Valentina", "Benjamín", "Javiera", "Tomás", "Fernanda", "Diego", "Catalina", "Felipe", "Antonia", "Joaquín", "Isidora", "Sebastián", "Constanza"];
const lastNames = ["González", "Muñoz", "Rojas", "Díaz", "Pérez", "Soto", "Contreras", "Silva", "Martínez", "Sepúlveda", "Morales", "Fuentes"];
const comunas = ["Providencia", "Ñuñoa", "Las Condes", "Maipú", "La Florida", "Santiago", "Puente Alto", "Macul", "Peñalolén", "San Miguel"];
const petNames = ["Luna", "Simón", "Maite", "Rocky", "Canela", "Milo", "Olivia", "Toby", "Nala", "Bruno"];

let seedState = 42;
const rand = () => {
  seedState = (seedState * 16807) % 2147483647;
  return (seedState - 1) / 2147483646;
};
const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

async function main() {
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.inventoryMovement.deleteMany(),
    prisma.appointment.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.service.deleteMany(),
    prisma.subscriber.deleteMany(),
  ]);

  const categoryIds: Record<string, string> = {};
  for (const [i, c] of categories.entries()) {
    const row = await prisma.category.create({ data: { ...c, sortOrder: i } });
    categoryIds[c.slug] = row.id;
  }

  const brandRows: Record<string, { id: string; color: string }> = {};
  for (const b of brands) {
    const row = await prisma.brand.create({ data: { ...b, slug: slugify(b.name) } });
    brandRows[b.name] = { id: row.id, color: row.color };
  }

  const createdProducts: Product[] = [];
  for (const [i, p] of products.entries()) {
    const brand = brandRows[p.brand];
    const created = await prisma.product.create({
      data: {
        sku: `TAP-${String(1001 + i)}`,
        name: p.name,
        slug: slugify(p.name),
        shortDescription: p.short,
        description: `${p.short}\n\nFormulado para entregar una nutrición y cuidado de calidad a tu mascota. Revisa siempre las indicaciones del envase y, ante cualquier duda, consulta con nuestro equipo veterinario.`,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        cost: Math.round(p.price * 0.62),
        stock: p.stock,
        minStock: p.minStock ?? 5,
        species: p.species,
        lifeStage: p.lifeStage ?? "TODAS",
        presentation: p.presentation,
        weightKg: p.weightKg ?? null,
        requiresPrescription: p.rx ?? false,
        isFeatured: p.featured ?? false,
        packColor: brand.color,
        categoryId: categoryIds[p.category],
        brandId: brand.id,
      },
    });
    createdProducts.push(created);
  }

  // Movimiento inicial de stock (carga de inventario)
  const now = new Date();
  const stockStart = new Date(now.getTime() - 45 * 86400000);
  const runningStock: Record<string, number> = {};
  for (const p of createdProducts) {
    const initial = p.stock + 20;
    runningStock[p.id] = initial;
    await prisma.inventoryMovement.create({
      data: { productId: p.id, type: "ENTRADA", quantity: initial, stockAfter: initial, reason: "Carga inicial de inventario", createdBy: "Sistema", createdAt: stockStart },
    });
  }

  // Pedidos de ejemplo en los últimos 30 días
  const statuses = ["ENTREGADO", "ENTREGADO", "ENTREGADO", "ENVIADO", "PREPARANDO", "PAGADO", "PENDIENTE", "CANCELADO"];
  for (let i = 0; i < 34; i++) {
    const daysAgo = Math.floor(rand() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 86400000 - Math.floor(rand() * 36000000));
    const lines = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => pick(createdProducts));
    const unique = [...new Map(lines.map((l) => [l.id, l])).values()];
    const items = unique.map((p) => ({ product: p, quantity: 1 + Math.floor(rand() * 2) }));
    const subtotal = items.reduce((s, it) => s + it.product.price * it.quantity, 0);
    const delivery = rand() > 0.3 ? "DESPACHO" : "RETIRO";
    const shippingCost = delivery === "RETIRO" || subtotal >= 39990 ? 0 : 3990;
    const status = daysAgo > 6 ? pick(["ENTREGADO", "ENTREGADO", "ENTREGADO", "CANCELADO"]) : pick(statuses);
    const name = `${pick(firstNames)} ${pick(lastNames)}`;
    const code = `TAP-${ymd(createdAt).replace(/-/g, "").slice(2)}-${String(100 + i)}`;

    await prisma.order.create({
      data: {
        code,
        customerName: name,
        email: `${slugify(name).replace("-", ".")}@ejemplo.cl`,
        phone: `+569${Math.floor(10000000 + rand() * 89999999)}`,
        deliveryMethod: delivery,
        address: delivery === "DESPACHO" ? `Av. Ejemplo ${100 + Math.floor(rand() * 900)}` : null,
        comuna: delivery === "DESPACHO" ? pick(comunas) : null,
        region: delivery === "DESPACHO" ? "Región Metropolitana" : null,
        paymentMethod: pick(["WEBPAY", "WEBPAY", "TRANSFERENCIA"]),
        status,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        createdAt,
        items: {
          create: items.map((it) => ({ productId: it.product.id, name: it.product.name, sku: it.product.sku, unitPrice: it.product.price, quantity: it.quantity })),
        },
      },
    });

    if (status !== "CANCELADO") {
      for (const it of items) {
        runningStock[it.product.id] -= it.quantity;
        await prisma.inventoryMovement.create({
          data: { productId: it.product.id, type: "VENTA", quantity: -it.quantity, stockAfter: runningStock[it.product.id], reference: code, createdBy: "Tienda online", createdAt },
        });
      }
    }
  }

  // Ajuste final para cuadrar con el stock declarado del catálogo
  for (const p of createdProducts) {
    const diff = p.stock - runningStock[p.id];
    if (diff !== 0) {
      await prisma.inventoryMovement.create({
        data: { productId: p.id, type: diff > 0 ? "ENTRADA" : "SALIDA", quantity: diff, stockAfter: p.stock, reason: diff > 0 ? "Reposición de proveedor" : "Venta en tienda física", createdBy: "Administrador", createdAt: new Date(now.getTime() - 86400000) },
      });
    }
  }

  // Servicios y reservas
  const serviceRows: Service[] = [];
  for (const [i, s] of services.entries()) {
    serviceRows.push(await prisma.service.create({ data: { ...s, slug: slugify(s.name), sortOrder: i } }));
  }
  const times = ["10:00", "10:30", "11:00", "12:00", "15:00", "16:30", "17:00"];
  for (let i = 0; i < 12; i++) {
    const offset = Math.floor(rand() * 14) - 4;
    const d = new Date(now.getTime() + offset * 86400000);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    const service = pick(serviceRows);
    const daycare = service.kind === "GUARDERIA";
    await prisma.appointment.create({
      data: {
        code: `RES-${String(5000 + i)}`,
        serviceId: service.id,
        ownerName: `${pick(firstNames)} ${pick(lastNames)}`,
        email: `cliente${i}@ejemplo.cl`,
        phone: `+569${Math.floor(10000000 + rand() * 89999999)}`,
        petName: pick(petNames),
        species: daycare ? "PERRO" : pick(["PERRO", "GATO"]),
        petAge: `${1 + Math.floor(rand() * 10)} años`,
        date: ymd(d),
        time: daycare ? pick(["08:00", "08:30", "09:00"]) : pick(times),
        status: offset < 0 ? "COMPLETADA" : pick(["SOLICITADA", "CONFIRMADA"]),
      },
    }).catch(() => undefined);
  }

  // Usuario administrador
  const email = process.env.ADMIN_EMAIL ?? "admin@tuamigopet.cl";
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("Define ADMIN_PASSWORD en .env antes de ejecutar el seed.");
  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash: await bcrypt.hash(password, 10) },
    create: { email, name: "Administrador", passwordHash: await bcrypt.hash(password, 10) },
  });

  console.log(`Seed completo: ${createdProducts.length} productos, ${serviceRows.length} servicios.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
