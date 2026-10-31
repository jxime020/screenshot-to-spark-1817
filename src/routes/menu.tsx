import { createFileRoute } from "@tanstack/react-router";
import { ProductCard } from "@/components/ProductCard";
import { PRODUCTS } from "@/lib/config";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menú — FRESCA MAREA" },
      { name: "description", content: "Aguachiles y mariscos de FRESCA MAREA. Elige tus platillos y ordena." },
      { property: "og:title", content: "Menú — FRESCA MAREA" },
      { property: "og:description", content: "Aguachiles y mariscos frescos. Ordena en línea." },
    ],
  }),
  component: () => (
    <section className="mx-auto max-w-6xl px-4 pt-10">
      <h1 className="text-5xl font-bold">Menú</h1>
      <p className="mt-2 text-muted-foreground">Elige tus platillos favoritos y agrégalos a tu pedido.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  ),
});
