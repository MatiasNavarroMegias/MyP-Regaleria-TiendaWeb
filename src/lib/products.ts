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

export type Product = {
  name: string;
  family: Family;
  gender: string;
  notes: string;
  price: number;
  img: string;
};

export const products: Product[] = [
  { name: "Bruma pampeana", family: "Amaderados", gender: "Unisex", notes: "Sándalo, Cardamomo, Cedro de Virginia", price: 85000, img: perfume1 },
  { name: "Jardín secreto", family: "Florales", gender: "Femenino", notes: "Jazmín del Cabo, Bergamota, Almizcle", price: 72500, img: perfume2 },
  { name: "Noche eterna", family: "Orientales", gender: "Intenso", notes: "Incienso, Vainilla negra, Cuero", price: 94000, img: perfume3 },
  { name: "Amanecer cítrico", family: "Cítricos", gender: "Unisex", notes: "Pomelo rosado, Mandarina, Neroli", price: 78000, img: featured },
  { name: "Sur profundo", family: "Amaderados", gender: "Masculino", notes: "Vetiver, Pino, Tierra húmeda", price: 88500, img: perfume3 },
  { name: "Flor de invierno", family: "Florales", gender: "Femenino", notes: "Tuberosa, Iris, Musgo blanco", price: 76000, img: perfume2 },
  { name: "Ámbar de oriente", family: "Orientales", gender: "Unisex", notes: "Ámbar gris, Benjuí, Mirra", price: 96500, img: perfume1 },
  { name: "Mediodía de limonero", family: "Cítricos", gender: "Unisex", notes: "Limón Siciliano, Verbena, Albahaca", price: 69000, img: featured },
];

export const formatPrice = (n: number) => `$${n.toLocaleString("es-AR")} ARS`;
