/**
 * Fotografías de referencia (Unsplash, licencia libre) usadas mientras el local
 * no entregue fotos propias. Reemplazar por imágenes del negocio en /public.
 */
const u = (id: string, w = 1200) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;

export const photos = {
  dogAndCat: u("photo-1450778869180-41d0601e046e"),
  dogCatGrass: u("photo-1623387641168-d9803ddd3f35"),
  dogCatTiles: u("photo-1563460716037-460a3ad24ba9"),
  catChair: u("photo-1514888286974-6c03e2ca1dba"),
  catLongHair: u("photo-1592194996308-7b43878e84a6"),
  kitten: u("photo-1533743983669-94fa5c4338ec"),
  vetExam: u("photo-1770836037793-95bdbf190f71"),
  vetVaccine: u("photo-1770836037275-38b44e4b101f"),
  vetTeeth: u("photo-1770836037816-4445dbd449fd"),
  pomeranianBlue: u("photo-1588626863948-1d7978596f17"),
  twoDogsSun: u("photo-1768019102235-d18c8ad29214"),
  twoDogsPlaying: u("photo-1760530327971-f8523426c60a"),
  twoDogsFlowers: u("photo-1782022491533-267c13b410bf"),
  goldenAndCat: u("photo-1765382119933-77efd0ee2921"),
};

/** "Hoy en la guardería": en producción lo actualiza el local desde el panel. */
export const daycareToday = [
  { name: "Rocky y Toby", note: "Llegaron 8:30, ya salieron a pasear", photo: photos.twoDogsPlaying },
  { name: "Canela", note: "Durmiendo siesta después del juego", photo: photos.twoDogsSun },
  { name: "Bruno y Maite", note: "Primer día juntos, se cayeron bien", photo: photos.twoDogsFlowers },
];
