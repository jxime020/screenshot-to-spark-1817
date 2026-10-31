import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { BUSINESS } from "@/lib/config";
import logoAsset from "@/assets/logo.svg.asset.json";

export function Brand() {
  return (
    <Link to="/" className="flex min-w-0 items-center gap-2" aria-label={BUSINESS.name}>
      <img src={logoAsset.url} alt={`Logotipo de ${BUSINESS.name}`} className="h-14 w-auto shrink-0" />
    </Link>
  );
}

const nav = [
  { to: "/", label: "Inicio" },
  { to: "/menu", label: "Menú" },
  { to: "/promociones", label: "Promociones" },
  { to: "/contacto", label: "Contacto" },
] as const;

export function SiteHeader() {
  const { count } = useCart();
  const [bump, setBump] = useState(false);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
    return undefined;
  }, [count]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 md:flex md:justify-between">
        <Brand />
        <nav className="hidden gap-6 md:flex">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="font-display text-lg font-semibold transition-colors hover:text-primary">
              {n.label}
            </Link>
          ))}
        </nav>
        <Link to="/pedido" aria-label={`Carrito, ${count} productos`} className="relative grid h-11 w-11 place-items-center rounded-full hover:bg-secondary">
          <ShoppingCart className="h-6 w-6" />
          {count > 0 && (
            <span className={`absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground ${bump ? "pop-in" : ""}`}>
              {count}
            </span>
          )}
        </Link>
      </div>
      <nav className="flex justify-around border-t px-2 py-2 md:hidden">
        {nav.map((n) => (
          <Link key={n.to} to={n.to} activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="font-display text-base font-semibold">
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <Brand />
          <p className="mt-3 text-sm text-muted-foreground">El sabor del mar en tu mesa.</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 text-lg font-semibold">Contacto</h4>
          <p className="text-muted-foreground">{BUSINESS.address || "Dirección por confirmar"}</p>
          <p className="text-muted-foreground">{BUSINESS.phone || "Teléfono por confirmar"}</p>
        </div>
        <div className="text-sm">
          <h4 className="mb-2 text-lg font-semibold">Redes sociales</h4>
          {BUSINESS.socials.length ? (
            BUSINESS.socials.map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noreferrer" className="block text-muted-foreground hover:text-primary">{s.name}</a>
            ))
          ) : (
            <p className="text-muted-foreground">Próximamente</p>
          )}
        </div>
      </div>
    </footer>
  );
}
