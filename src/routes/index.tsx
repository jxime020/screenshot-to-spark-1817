import { createFileRoute, Link } from "@tanstack/react-router";
import { Clock, Store, Bike, ArrowRight } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { ProductCard } from "@/components/ProductCard";
import { BUSINESS, DELIVERY_ZONES, PRODUCTS, PROMOTIONS } from "@/lib/config";
import { mxn } from "@/lib/order";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FRESCA MAREA — Aguachiles y mariscos a domicilio" },
      { name: "description", content: "Ordena aguachiles y mariscos frescos de FRESCA MAREA a domicilio o para recoger." },
      { property: "og:title", content: "FRESCA MAREA — El sabor del mar en tu mesa" },
      { property: "og:description", content: "Ordena aguachiles y mariscos frescos a domicilio o para recoger." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Aguachiles y mariscos frescos" width={1600} height={912} className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="hero-fade absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-36">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-primary">Mariscos · Aguachiles</p>
          <h1 className="max-w-xl text-5xl font-bold leading-none md:text-7xl">El sabor del mar en tu mesa</h1>
          <Link to="/menu" className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-8 font-display text-xl font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-95">
            Ordenar ahora <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-4xl font-bold">Populares</h2>
          <Link to="/menu" className="text-sm font-semibold text-primary">Ver menú</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {PRODUCTS.filter((p) => p.popular).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-16">
        <h2 className="mb-6 text-4xl font-bold">Promociones</h2>
        {PROMOTIONS.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {PROMOTIONS.map((p) => (
              <div key={p.title} className="card-surface card-selected p-6">
                <h3 className="text-2xl font-bold">{p.title}</h3>
                <p className="text-muted-foreground">{p.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-surface p-6 text-muted-foreground">Muy pronto tendremos promociones especiales.</div>
        )}
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 pt-16 md:grid-cols-3">
        <div className="card-surface p-6">
          <Clock className="mb-3 h-7 w-7 text-primary" />
          <h3 className="text-2xl font-bold">Horarios</h3>
          {BUSINESS.hours.length ? BUSINESS.hours.map((h) => <p key={h.days} className="text-muted-foreground">{h.days}: {h.time}</p>) : <p className="text-muted-foreground">Por confirmar</p>}
        </div>
        <div className="card-surface p-6">
          <Bike className="mb-3 h-7 w-7 text-primary" />
          <h3 className="text-2xl font-bold">Entrega a domicilio</h3>
          {DELIVERY_ZONES.map((z) => <p key={z.id} className="text-muted-foreground">{z.name}: {mxn(z.cost)}</p>)}
        </div>
        <div className="card-surface p-6">
          <Store className="mb-3 h-7 w-7 text-primary" />
          <h3 className="text-2xl font-bold">Pasar a recoger</h3>
          <p className="text-muted-foreground">{BUSINESS.address || "Dirección por confirmar"}</p>
        </div>
      </section>
    </>
  );
}
