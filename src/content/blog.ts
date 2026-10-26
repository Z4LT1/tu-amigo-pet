import { photos } from "./media";

export type Block = { type: "p"; text: string } | { type: "h2"; text: string } | { type: "ul"; items: string[] } | { type: "tip"; text: string };

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Perros" | "Gatos" | "Salud" | "Guardería";
  date: string;
  readMinutes: number;
  cover: string;
  author: string;
  related?: { label: string; href: string };
  body: Block[];
};

export const posts: Post[] = [
  {
    slug: "cuando-esterilizar-a-tu-gata-o-perra",
    title: "¿Cuándo esterilizar a tu gata o perra?",
    excerpt: "La edad recomendada, cómo prepararla para la cirugía y qué cuidados necesita los días siguientes.",
    category: "Salud",
    date: "2026-10-14",
    readMinutes: 5,
    cover: photos.vetExam,
    author: "Equipo veterinario",
    related: { label: "Agendar evaluación de esterilización", href: "/servicios/esterilizacion" },
    body: [
      { type: "p", text: "Esterilizar a tu mascota previene camadas no deseadas, reduce el riesgo de tumores mamarios e infecciones uterinas y disminuye conductas como el marcaje o las escapadas en celo. Es una de las decisiones de salud más importantes de su vida." },
      { type: "h2", text: "La edad recomendada" },
      { type: "ul", items: ["Gatas: desde los 5 a 6 meses, idealmente antes del primer celo.", "Perras pequeñas y medianas: entre los 6 y 9 meses.", "Perras de razas grandes: se evalúa caso a caso, a veces conviene esperar a que termine su crecimiento."] },
      { type: "h2", text: "Antes de la cirugía" },
      { type: "p", text: "Hacemos una evaluación previa con examen físico y, según la edad, exámenes de sangre. La noche anterior tu mascota debe estar en ayuno de alimento (el agua se retira unas horas antes). Te damos las indicaciones exactas al agendar." },
      { type: "h2", text: "Los días después" },
      { type: "ul", items: ["Usa el collar isabelino todo el tiempo para que no se lama la herida.", "Reposo: nada de saltos ni carreras durante 10 días.", "Revisa la herida a diario: debe estar seca y sin enrojecimiento.", "El control y retiro de puntos es a los 10 días, incluido en el valor."] },
      { type: "tip", text: "Después de esterilizada, su gasto de energía baja. Cambiar a un alimento para esterilizados ayuda a mantener su peso ideal." },
    ],
  },
  {
    slug: "calendario-de-vacunas-para-cachorros",
    title: "Calendario de vacunas para cachorros en Chile",
    excerpt: "Qué vacunas necesita tu cachorro, a qué edad se ponen y por qué no debe salir a la calle antes de completarlas.",
    category: "Perros",
    date: "2026-09-30",
    readMinutes: 4,
    cover: photos.vetVaccine,
    author: "Equipo veterinario",
    related: { label: "Agendar vacunación", href: "/servicios/vacunacion" },
    body: [
      { type: "p", text: "Los primeros meses son clave: el cachorro va perdiendo la protección que recibió de su madre y las vacunas son las que toman el relevo. Este es el esquema que usamos en la consulta." },
      { type: "h2", text: "Esquema base" },
      { type: "ul", items: ["6 a 8 semanas: primera dosis de vacuna séxtuple u óctuple.", "10 a 12 semanas: segunda dosis.", "14 a 16 semanas: tercera dosis y antirrábica.", "Cada año: refuerzo de óctuple y antirrábica."] },
      { type: "p", text: "La antirrábica es obligatoria en Chile. Con cada vacuna registramos la dosis en el carnet de tu perro, que también sirve para viajar o entrar a la guardería." },
      { type: "h2", text: "¿Cuándo puede salir a pasear?" },
      { type: "p", text: "Recomendamos esperar una semana después de la última dosis del esquema. Antes de eso puede socializar en casa con perros vacunados y conocidos." },
      { type: "tip", text: "Desparasita a tu cachorro antes de cada vacuna: los parásitos intestinales pueden bajar la respuesta del sistema inmune." },
    ],
  },
  {
    slug: "como-elegir-la-arena-para-tu-gato",
    title: "Cómo elegir la arena para tu gato",
    excerpt: "Aglomerante, sílica o pellet de madera: diferencias, cuánto rinde cada una y cuál conviene según tu casa.",
    category: "Gatos",
    date: "2026-09-12",
    readMinutes: 3,
    cover: photos.catChair,
    author: "Equipo de tienda",
    related: { label: "Ver arenas sanitarias", href: "/categoria/arenas-sanitarias" },
    body: [
      { type: "p", text: "Un gato que rechaza su arenero puede empezar a hacer sus necesidades fuera de él. Muchas veces el problema no es el gato, sino la arena." },
      { type: "h2", text: "Los tres tipos más comunes" },
      { type: "ul", items: ["Aglomerante: forma bolitas fáciles de retirar. Es la favorita de la mayoría de los gatos por su textura fina.", "Sílica: absorbe mucho y casi no deja olor; se cambia completa una vez al mes.", "Pellet de madera o eco: biodegradable y sin polvo, ideal si alguien en casa tiene alergias."] },
      { type: "h2", text: "¿Cuánta arena necesito?" },
      { type: "p", text: "Para un gato, un saco de 10 kg de aglomerante dura aproximadamente un mes. Mantén unos 5 a 7 cm de profundidad y retira los desechos todos los días." },
      { type: "tip", text: "Si vas a cambiar de tipo de arena, hazlo de a poco: mezcla la nueva con la anterior durante una semana." },
    ],
  },
  {
    slug: "primer-dia-en-la-guarderia",
    title: "El primer día de tu perro en la guardería",
    excerpt: "Qué traer, cómo es la evaluación de convivencia y cómo saber si tu perro disfruta su día con nosotros.",
    category: "Guardería",
    date: "2026-08-28",
    readMinutes: 3,
    cover: photos.twoDogsPlaying,
    author: "Equipo de guardería",
    related: { label: "Conocer la guardería de día", href: "/servicios/guarderia-de-dia" },
    body: [
      { type: "p", text: "La guardería de día es para perros que pasan muchas horas solos en casa. Juegan, salen a pasear, descansan y vuelven contigo cansados y tranquilos." },
      { type: "h2", text: "Antes del primer día" },
      { type: "ul", items: ["Vacunas al día (óctuple, antirrábica y KC).", "Desparasitación interna y externa vigente.", "Una evaluación de convivencia de 30 minutos para conocer su carácter."] },
      { type: "h2", text: "Qué traer" },
      { type: "ul", items: ["Su porción de alimento del día, si come en el horario de guardería.", "Correa y collar con placa.", "Sus remedios, con las indicaciones por escrito."] },
      { type: "p", text: "Durante el día te enviamos fotos por WhatsApp. Si es su primera vez, recomendamos empezar con medias jornadas." },
      { type: "tip", text: "Un perro que llega a casa con sueño y relajado tuvo un buen día. ¡Es normal que duerma toda la tarde!" },
    ],
  },
];

export const getPost = (slug: string) => posts.find((p) => p.slug === slug);
