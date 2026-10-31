import { createFileRoute, Link } from "@tanstack/react-router";
import { PROMOTIONS } from "@/lib/config";

export const Route = createFileRoute("/promociones")({
  head: () => ({
    meta: [
      { title: "Promociones — FRESCA MAREA" },
      { name: "description", content: "Promociones vigentes de FRESCA MAREA en aguachiles y mariscos." },
      { property: "og:title", content: "Promociones — FRESCA MAREA" },
      { property: "og:description", content: "Promociones vigentes en aguachiles y mariscos." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="text-5xl font-bold">Promociones</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {PROMOTIONS.length ? (
          PROMOTIONS.map((p) => (
            <div key={p.title} className="card-surface card-selected p-6">
              <h2 className="text-2xl font-bold">{p.title}</h2>
              <p className="text-muted-foreground">{p.description}</p>
            </div>
          ))
        ) : (
          <div className="card-surface p-6 sm:col-span-2">
            <p className="text-muted-foreground">Por ahora no hay promociones activas. ¡Vuelve pronto!</p>
            <Link to="/menu" className="mt-4 inline-block font-semibold text-primary">Ver menú →</Link>
          </div>
        )}
      </div>
    </section>
  ),
});
