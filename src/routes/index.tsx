import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import hero from "@/assets/hero.jpg";
import workshop from "@/assets/workshop.jpg";
import perfume1 from "@/assets/perfume-1.jpg";
import perfume2 from "@/assets/perfume-2.jpg";
import perfume3 from "@/assets/perfume-3.jpg";
import featured from "@/assets/featured.jpg";
import ig1 from "@/assets/ig-1.jpg";
import ig2 from "@/assets/ig-2.jpg";
import ig3 from "@/assets/ig-3.jpg";
import ig4 from "@/assets/ig-4.jpg";
import ig5 from "@/assets/ig-5.jpg";
import ig6 from "@/assets/ig-6.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Natalia Santos — Perfumería de Autor" },
      {
        name: "description",
        content:
          "Fragancias de autor maceradas artesanalmente en Buenos Aires. Perfumes que cuentan tu historia.",
      },
      { property: "og:title", content: "Natalia Santos — Perfumería de Autor" },
      {
        property: "og:description",
        content:
          "Fragancias de autor maceradas artesanalmente en Buenos Aires.",
      },
      { property: "og:image", content: hero },
    ],
  }),
  component: Index,
});

type Family = "Amaderados" | "Florales" | "Cítricos" | "Orientales";
const families: Array<"Todos" | Family> = [
  "Todos",
  "Amaderados",
  "Florales",
  "Cítricos",
  "Orientales",
];

type Product = {
  name: string;
  family: Family;
  gender: string;
  notes: string;
  price: number;
  img: string;
};

const products: Product[] = [
  {
    name: "Bruma pampeana",
    family: "Amaderados",
    gender: "Unisex",
    notes: "Sándalo, Cardamomo, Cedro de Virginia",
    price: 85000,
    img: perfume1,
  },
  {
    name: "Jardín secreto",
    family: "Florales",
    gender: "Femenino",
    notes: "Jazmín del Cabo, Bergamota, Almizcle",
    price: 72500,
    img: perfume2,
  },
  {
    name: "Noche eterna",
    family: "Orientales",
    gender: "Intenso",
    notes: "Incienso, Vainilla negra, Cuero",
    price: 94000,
    img: perfume3,
  },
  {
    name: "Amanecer cítrico",
    family: "Cítricos",
    gender: "Unisex",
    notes: "Pomelo rosado, Mandarina, Neroli",
    price: 78000,
    img: featured,
  },
  {
    name: "Sur profundo",
    family: "Amaderados",
    gender: "Masculino",
    notes: "Vetiver, Pino, Tierra húmeda",
    price: 88500,
    img: perfume3,
  },
  {
    name: "Flor de invierno",
    family: "Florales",
    gender: "Femenino",
    notes: "Tuberosa, Iris, Musgo blanco",
    price: 76000,
    img: perfume2,
  },
  {
    name: "Ámbar de oriente",
    family: "Orientales",
    gender: "Unisex",
    notes: "Ámbar gris, Benjuí, Mirra",
    price: 96500,
    img: perfume1,
  },
  {
    name: "Mediodía de limonero",
    family: "Cítricos",
    gender: "Unisex",
    notes: "Limón Siciliano, Verbena, Albahaca",
    price: 69000,
    img: featured,
  },
];

const sortOptions = [
  { value: "destacados", label: "Destacados" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "alfabetico", label: "Alfabético (A-Z)" },
] as const;

type SortKey = (typeof sortOptions)[number]["value"];

const formatPrice = (n: number) =>
  `$${n.toLocaleString("es-AR")} ARS`;

const igGrid = [ig1, ig2, ig3, ig4, ig5, ig6];


function Index() {
  return (
    <div className="bg-background text-foreground font-[var(--font-body)]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border">
        <span className="font-[var(--font-display)] text-xl tracking-tight">
          NATALIA SANTOS
        </span>
        <div className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] font-medium">
          <a href="#coleccion" className="hover:text-primary transition-colors">
            Colección
          </a>
          <a href="#esencia" className="hover:text-primary transition-colors">
            Nuestra Esencia
          </a>
          <a href="#destacado" className="hover:text-primary transition-colors">
            Taller
          </a>
        </div>
        <button className="text-[11px] uppercase tracking-widest hover:text-primary transition-colors">
          Carrito (0)
        </button>
      </nav>

      {/* Hero */}
      <section className="relative h-[90vh] overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0 animate-scale-in">
          <img
            src={hero}
            alt="Frasco ámbar de perfume sobre lino crema"
            width={1920}
            height={1280}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
        <div className="relative z-10 text-center px-6 max-w-3xl animate-fade-up [animation-delay:300ms]">
          <h1 className="font-[var(--font-display)] text-5xl md:text-7xl text-balance mb-8 text-white drop-shadow-sm">
            Fragancias que cuentan tu historia
          </h1>
          <a
            href="#coleccion"
            className="inline-block px-10 py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-all duration-300"
          >
            Comprar ahora
          </a>
        </div>
      </section>

      {/* Esencia */}
      <section id="esencia" className="py-24 md:py-32 px-6 md:px-24">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-7xl mx-auto">
          <img
            src={workshop}
            alt="Taller de perfumería artesanal"
            width={1024}
            height={1280}
            loading="lazy"
            className="aspect-[4/5] w-full object-cover ring-1 ring-black/5 rounded-sm"
          />
          <div className="space-y-6">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
              El Origen
            </span>
            <h2 className="font-[var(--font-display)] text-4xl md:text-5xl">
              Destilado en Buenos Aires
            </h2>
            <p className="text-foreground/70 leading-relaxed text-pretty max-w-[45ch]">
              Nuestra filosofía se basa en el respeto por la materia prima. En
              nuestro taller, cada fragancia es una composición artesanal que
              busca capturar la melancolía del campo y la sofisticación de la
              ciudad.
            </p>
            <p className="text-foreground/70 leading-relaxed text-pretty max-w-[45ch]">
              Utilizamos métodos de extracción lentos para preservar la
              integridad de cada nota olfativa, creando perfumes que evolucionan
              en la piel durante horas.
            </p>
          </div>
        </div>
      </section>

      {/* Colección */}
      <section id="coleccion" className="py-24 md:py-32 bg-muted/40">
        <div className="px-6 md:px-24 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <h2 className="font-[var(--font-display)] text-4xl md:text-5xl mb-4">
                La Colección
              </h2>
              <p className="text-foreground/60 text-sm font-[var(--font-mono)] uppercase tracking-widest">
                Filtrar por familia olfativa
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {families.map((f, i) => (
                <button
                  key={f}
                  className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-colors ${
                    i === 0
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((p) => (
              <article key={p.name} className="group cursor-pointer">
                <div className="relative aspect-[3/4] mb-6 overflow-hidden bg-stone-100 ring-1 ring-black/5">
                  <img
                    src={p.img}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/90 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center px-8 text-center">
                    <p className="font-[var(--font-mono)] text-[9px] uppercase tracking-widest mb-4">
                      Notas principales
                    </p>
                    <p className="text-sm italic font-[var(--font-display)]">
                      {p.notes}
                    </p>
                  </div>
                </div>
                <h3 className="font-[var(--font-display)] text-2xl mb-1">
                  {p.name}
                </h3>
                <p className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/50 mb-4">
                  {p.family}
                </p>
                <p className="text-sm font-medium">{p.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Ficha destacada */}
      <section
        id="destacado"
        className="py-24 md:py-32 px-6 md:px-24 border-t border-border"
      >
        <div className="grid md:grid-cols-2 gap-16 md:gap-24 items-center max-w-7xl mx-auto">
          <div className="order-2 md:order-1">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
              Edición de temporada
            </span>
            <h2 className="font-[var(--font-display)] text-5xl mt-3 mb-8">
              Amanecer Cítrico
            </h2>

            <div className="flex gap-4 mb-12">
              <button className="w-14 h-14 border border-foreground flex items-center justify-center text-[10px] font-[var(--font-mono)]">
                30ml
              </button>
              <button className="w-14 h-14 border border-border flex items-center justify-center text-[10px] font-[var(--font-mono)] text-foreground/40 hover:border-foreground hover:text-foreground transition-colors">
                50ml
              </button>
              <button className="w-14 h-14 border border-border flex items-center justify-center text-[10px] font-[var(--font-mono)] text-foreground/40 hover:border-foreground hover:text-foreground transition-colors">
                100ml
              </button>
            </div>

            <div className="space-y-10">
              {[
                {
                  k: "Salida",
                  v: "Pomelo rosado, Mandarina y Neroli",
                },
                {
                  k: "Corazón",
                  v: "Flor de azahar y Pimienta blanca",
                },
                {
                  k: "Fondo",
                  v: "Vetiver de Haití y Ámbar gris",
                },
              ].map((n) => (
                <div
                  key={n.k}
                  className="relative pl-8 border-l border-primary/30"
                >
                  <span className="block font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary mb-2">
                    {n.k}
                  </span>
                  <p className="text-lg">{n.v}</p>
                </div>
              ))}
            </div>

            <button className="mt-12 w-full py-4 bg-foreground text-background text-[11px] uppercase tracking-[0.2em] font-medium hover:bg-primary transition-colors">
              Agregar al carrito — $78.000 ARS
            </button>
          </div>
          <div className="order-1 md:order-2">
            <img
              src={featured}
              alt="Amanecer Cítrico, fragancia destacada"
              loading="lazy"
              className="aspect-[4/5] w-full object-cover ring-1 ring-black/5 rounded-sm"
            />
          </div>
        </div>
      </section>

      {/* Testimonios estilo IG */}
      <section className="py-24 px-6 md:px-24 bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-primary">
              Reseñas
            </span>
            <h2 className="font-[var(--font-display)] text-4xl mt-3">
              Lo que dicen nuestras clientas
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                t: "Bruma pampeana se convirtió en mi firma. Estela duradera, elegante, no empalaga. Mil gracias Nati.",
                a: "@martinaperez",
              },
              {
                t: "Compré Jardín secreto para mi mamá y lloró. Cada detalle del packaging cuidado al máximo.",
                a: "@sofiagarcia",
              },
              {
                t: "Atención impecable. Me asesoraron por WhatsApp y acerté con el aroma a la primera. Recomendadísimo.",
                a: "@lucia.rmz",
              },
            ].map((r) => (
              <figure
                key={r.a}
                className="bg-background p-8 ring-1 ring-border rounded-sm"
              >
                <blockquote className="font-[var(--font-display)] italic text-lg leading-relaxed mb-6 text-balance">
                  “{r.t}”
                </blockquote>
                <figcaption className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-foreground/50">
                  {r.a}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Feed Instagram */}
      <section className="py-24">
        <div className="px-6 text-center mb-16">
          <h2 className="font-[var(--font-display)] text-3xl mb-2 italic">
            @nataliasantos.1701
          </h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">
            Nuestra comunidad en Instagram
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {igGrid.map((src, i) => (
            <a
              key={i}
              href="https://www.instagram.com/nataliasantos.1701"
              target="_blank"
              rel="noreferrer noopener"
              className="group relative aspect-square overflow-hidden bg-stone-100 ring-1 ring-black/5"
            >
              <img
                src={src}
                alt={`Publicación ${i + 1}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/30 transition-colors duration-300" />
            </a>
          ))}
        </div>
      </section>

      {/* Banner envíos */}
      <section className="bg-primary/15 py-6 border-y border-border">
        <p className="text-center font-[var(--font-mono)] text-[11px] uppercase tracking-[0.25em]">
          Envíos seguros a todo el país vía Correo Argentino
        </p>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background/80 py-20 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <span className="font-[var(--font-display)] text-3xl text-background tracking-tight block mb-6">
                NATALIA SANTOS
              </span>
              <p className="text-sm max-w-sm leading-relaxed">
                Fragancias de autor maceradas artesanalmente en Buenos Aires.
                Suscribite para enterarte de cada lanzamiento.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-background mb-6">
                Información
              </h4>
              <ul className="space-y-3 text-xs">
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Envíos y Devoluciones
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Cuidado del perfume
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background transition-colors">
                    Preguntas Frecuentes
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-background mb-6">
                Contacto
              </h4>
              <p className="text-xs mb-3">hola@nataliasantos.com.ar</p>
              <p className="text-xs mb-3">Buenos Aires, Argentina</p>
              <a
                href="https://www.instagram.com/nataliasantos.1701"
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs underline-offset-4 hover:underline"
              >
                @nataliasantos.1701
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-background/10 gap-6">
            <div className="flex flex-wrap gap-6">
              <span className="text-[9px] uppercase tracking-widest opacity-50">
                Mercado Pago
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-50">
                Visa / Mastercard
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-50">
                Transferencia
              </span>
              <span className="text-[9px] uppercase tracking-widest opacity-50">
                Correo Argentino
              </span>
            </div>
            <p className="text-[9px] uppercase tracking-widest opacity-30 text-center">
              © {new Date().getFullYear()} Natalia Santos — Perfumería de Autor
            </p>
          </div>
        </div>
      </footer>

      {/* FAB WhatsApp */}
      <a
        href="https://wa.me/5491100000000?text=Hola%20Natalia%2C%20me%20gustar%C3%ADa%20una%20asesor%C3%ADa%20de%20aromas"
        target="_blank"
        rel="noreferrer noopener"
        aria-label="Consultar por WhatsApp"
        className="fixed bottom-6 right-6 z-50 size-14 bg-white ring-1 ring-black/5 shadow-2xl rounded-full flex items-center justify-center hover:scale-105 transition-transform"
      >
        <span className="size-11 bg-emerald-600 rounded-full flex items-center justify-center text-white">
          <MessageCircle className="size-5" strokeWidth={2} />
        </span>
      </a>
    </div>
  );
}
