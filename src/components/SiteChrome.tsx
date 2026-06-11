import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import type { ReactNode } from "react";
import { useAuth, useIsAdmin } from "@/hooks/useAuth";
import { useSiteContent, pickString } from "@/lib/site-content";

export function SiteChrome({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { data: isAdmin } = useIsAdmin();
  const { data: content } = useSiteContent();
  const c = content ?? {};
  const brand = (c.brand ?? {}) as Record<string, string>;
  const contact = (c.contact ?? {}) as Record<string, string>;
  const footer = (c.footer ?? {}) as Record<string, string>;
  const shipping = (c.shipping_bar ?? {}) as Record<string, string>;

  const brandName = pickString(brand.name, "NATALIA SANTOS");
  const email = pickString(contact.email, "hola@nataliasantos.com.ar");
  const city = pickString(contact.city, "Buenos Aires, Argentina");
  const igUrl = pickString(contact.instagram, "https://www.instagram.com/nataliasantos.1701");
  const igHandle = pickString(contact.instagram_handle, "@nataliasantos.1701");
  const whatsappNum = pickString(contact.whatsapp, "5491100000000");
  const whatsappMsg = encodeURIComponent(pickString(contact.whatsapp_message, "Hola, me gustaría una asesoría de aromas"));

  return (
    <div className="bg-background text-foreground font-[var(--font-body)]">
      <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-5 bg-background/80 backdrop-blur-md border-b border-border">
        <Link to="/" className="font-[var(--font-display)] text-xl tracking-tight">
          {brandName}
        </Link>
        <div className="hidden md:flex gap-10 text-[11px] uppercase tracking-[0.2em] font-medium">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Inicio</Link>
          <Link to="/catalogo" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Catálogo</Link>
          <Link to="/esencia" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Nuestra Esencia</Link>
          <Link to="/destacado" activeProps={{ className: "text-primary" }} className="hover:text-primary transition-colors">Destacado</Link>
        </div>
        <div className="flex items-center gap-4 text-[11px] uppercase tracking-widest">
          {isAdmin && <Link to="/admin" className="hover:text-primary transition-colors">Admin</Link>}
          {!user && <Link to="/auth" className="hover:text-primary transition-colors">Ingresar</Link>}
        </div>
      </nav>

      {children}

      <section className="bg-primary/15 py-6 border-y border-border">
        <p className="text-center font-[var(--font-mono)] text-[11px] uppercase tracking-[0.25em]">
          {pickString(shipping.text, "Envíos seguros a todo el país vía Correo Argentino")}
        </p>
      </section>

      <footer className="bg-foreground text-background/80 py-20 px-6 md:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <span className="font-[var(--font-display)] text-3xl text-background tracking-tight block mb-6">
                {brandName}
              </span>
              <p className="text-sm max-w-sm leading-relaxed">
                {pickString(footer.description, "Fragancias de autor maceradas artesanalmente en Buenos Aires. Suscribite para enterarte de cada lanzamiento.")}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-background mb-6">
                {pickString(footer.info_title, "Información")}
              </h4>
              <ul className="space-y-3 text-xs">
                <li><span className="hover:text-background transition-colors">{pickString(footer.info_link_1, "Envíos y Devoluciones")}</span></li>
                <li><span className="hover:text-background transition-colors">{pickString(footer.info_link_2, "Cuidado del perfume")}</span></li>
                <li><span className="hover:text-background transition-colors">{pickString(footer.info_link_3, "Preguntas Frecuentes")}</span></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-widest text-background mb-6">Contacto</h4>
              <p className="text-xs mb-3">{email}</p>
              <p className="text-xs mb-3">{city}</p>
              <a href={igUrl} target="_blank" rel="noreferrer noopener" className="text-xs underline-offset-4 hover:underline">
                {igHandle}
              </a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between pt-12 border-t border-background/10 gap-6">
            <div className="flex flex-wrap gap-6">
              <span className="text-[9px] uppercase tracking-widest opacity-50">Mercado Pago</span>
              <span className="text-[9px] uppercase tracking-widest opacity-50">Visa / Mastercard</span>
              <span className="text-[9px] uppercase tracking-widest opacity-50">Transferencia</span>
              <span className="text-[9px] uppercase tracking-widest opacity-50">Correo Argentino</span>
            </div>
            <p className="text-[9px] uppercase tracking-widest opacity-30 text-center">
              © {new Date().getFullYear()} {brandName}
            </p>
          </div>
        </div>
      </footer>

      <a
        href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
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
