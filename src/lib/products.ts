import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import featured from "@/assets/featured.jpg";

export type Family = "Amaderados" | "Florales" | "Cítricos" | "Orientales";

export const families: Array<"Todos" | Family> = [
  "Todos",
  "Amaderados",
  "Florales",
  "Cítricos",
  "Orientales",
];

export type Review = {
  author: string;
  rating: number;
  text: string;
  date: string;
};

export type Product = {
  slug: string;
  name: string;
  family: Family;
  gender: string;
  notes: string;
  price: number;
  stock: number;
  img: string;
  images?: string[];
  description: string;
  reviews: Review[];
};

const r = (author: string, rating: number, text: string, date: string): Review => ({ author, rating, text, date });

export const products: Product[] = [
  {
    slug: "bruma-pampeana",
    name: "Bruma pampeana", family: "Amaderados", gender: "Unisex",
    notes: "Sándalo, Cardamomo, Cedro de Virginia", price: 85000, stock: 12, img: perfume1,
    description: "Una caricia de madera tibia y especias suaves. Bruma pampeana evoca el amanecer en el campo: cardamomo fresco abriendo paso al sándalo cremoso y al cedro de Virginia que persiste como un abrazo seco y elegante.",
    reviews: [
      r("Luciana M.", 5, "Es mi nuevo perfume diario. Dura horas y recibo cumplidos siempre.", "Mar 2026"),
      r("Tomás R.", 4, "Muy elegante, perfecto para la oficina. Esperaba un poco más de proyección.", "Feb 2026"),
    ],
  },
  {
    slug: "jardin-secreto",
    name: "Jardín secreto", family: "Florales", gender: "Femenino",
    notes: "Jazmín del Cabo, Bergamota, Almizcle", price: 72500, stock: 8, img: perfume2,
    description: "Floral luminoso y sensual. El jazmín del Cabo se enciende con un toque cítrico de bergamota y aterriza en un fondo de almizcle limpio, íntimo y duradero.",
    reviews: [
      r("Carolina V.", 5, "Florales me suelen marear y este es absolutamente perfecto. Femenino sin ser empalagoso.", "Abr 2026"),
      r("Sofía L.", 5, "Lo compré para una boda y todo el mundo me preguntaba qué llevaba.", "Ene 2026"),
    ],
  },
  {
    slug: "noche-eterna",
    name: "Noche eterna", family: "Orientales", gender: "Intenso",
    notes: "Incienso, Vainilla negra, Cuero", price: 94000, stock: 5, img: perfume3,
    description: "Una fragancia hipnótica y profunda. Incienso ahumado, vainilla negra densa y un cuero suave que aparece a las horas. Pensada para la noche, para los rituales.",
    reviews: [
      r("Martín G.", 5, "Adictivo. Muy intenso, mejor aplicar poco. Para invierno es ideal.", "May 2026"),
    ],
  },
  {
    slug: "amanecer-citrico",
    name: "Amanecer cítrico", family: "Cítricos", gender: "Unisex",
    notes: "Pomelo rosado, Mandarina, Neroli", price: 78000, stock: 20, img: featured,
    description: "El pomelo rosado y la mandarina explotan al primer spray como un trago helado. El neroli aporta una elegancia floral que sostiene la frescura durante todo el día.",
    reviews: [
      r("Julia P.", 5, "Verano embotellado. Lo regalé tres veces.", "Feb 2026"),
      r("Diego F.", 4, "Muy lindo, fresco y limpio. Dura unas 5-6 horas en mí.", "Mar 2026"),
      r("Camila S.", 5, "Mi favorito de la casa, sin dudas.", "Abr 2026"),
    ],
  },
  {
    slug: "sur-profundo",
    name: "Sur profundo", family: "Amaderados", gender: "Masculino",
    notes: "Vetiver, Pino, Tierra húmeda", price: 88500, stock: 7, img: perfume3,
    description: "El bosque después de la lluvia. Vetiver terroso, pino fresco y una nota de tierra húmeda que lo vuelve casi mineral. Carácter sereno y muy contemporáneo.",
    reviews: [
      r("Federico A.", 5, "Increíble. Te transporta a la Patagonia. Muy original.", "Ene 2026"),
    ],
  },
  {
    slug: "flor-de-invierno",
    name: "Flor de invierno", family: "Florales", gender: "Femenino",
    notes: "Tuberosa, Iris, Musgo blanco", price: 76000, stock: 10, img: perfume2,
    description: "Floral blanco con un alma fría y aterciopelada. La tuberosa cremosa convive con el iris empolvado sobre un fondo de musgo blanco luminoso.",
    reviews: [
      r("Renata B.", 5, "Sofisticado, no parece un perfume de nicho económico. Encantada.", "Mar 2026"),
    ],
  },
  {
    slug: "ambar-de-oriente",
    name: "Ámbar de oriente", family: "Orientales", gender: "Unisex",
    notes: "Ámbar gris, Benjuí, Mirra", price: 96500, stock: 4, img: perfume1,
    description: "Resinas nobles entrelazadas. El ámbar gris dorado, el benjuí cálido y la mirra balsámica componen un oriental clásico, hipnótico y muy duradero.",
    reviews: [
      r("Valentina C.", 5, "Una joya. Sale caro pero rinde muchísimo y proyecta un montón.", "Feb 2026"),
    ],
  },
  {
    slug: "mediodia-de-limonero",
    name: "Mediodía de limonero", family: "Cítricos", gender: "Unisex",
    notes: "Limón Siciliano, Verbena, Albahaca", price: 69000, stock: 15, img: featured,
    description: "Cítrico mediterráneo, verde y vibrante. Limón siciliano jugoso, verbena aromática y un toque de albahaca fresca: la frescura del verano en piel.",
    reviews: [
      r("Andrés M.", 4, "Fresco y muy lindo, ideal para días de calor. La duración es la justa.", "Abr 2026"),
    ],
  },
];

export const findProduct = (slug: string) => products.find((p) => p.slug === slug);

export const formatPrice = (n: number) => `$${n.toLocaleString("es-AR")} ARS`;
