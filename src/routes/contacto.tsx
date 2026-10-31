import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/config";
import { whatsappUrl } from "@/lib/order";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — FRESCA MAREA" },
      { name: "description", content: "Dirección, horarios y contacto de FRESCA MAREA." },
      { property: "og:title", content: "Contacto — FRESCA MAREA" },
      { property: "og:description", content: "Dirección, horarios y contacto de FRESCA MAREA." },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const rows = [
    { icon: MapPin, label: "Dirección", value: BUSINESS.address },
    { icon: Phone, label: "Teléfono", value: BUSINESS.phone },
  ];
  return (
    <section className="mx-auto max-w-3xl px-4 pt-10">
      <h1 className="text-5xl font-bold">Contacto</h1>
      <div className="mt-8 space-y-4">
        {rows.map((r) => (
          <div key={r.label} className="card-surface flex items-center gap-4 p-5">
            <r.icon className="h-6 w-6 shrink-0 text-primary" />
            <div><p className="text-sm text-muted-foreground">{r.label}</p><p className="font-semibold">{r.value || "Por confirmar"}</p></div>
          </div>
        ))}
        <div className="card-surface flex items-start gap-4 p-5">
          <Clock className="h-6 w-6 shrink-0 text-primary" />
          <div>
            <p className="text-sm text-muted-foreground">Horarios</p>
            {BUSINESS.hours.length ? BUSINESS.hours.map((h) => <p key={h.days} className="font-semibold">{h.days}: {h.time}</p>) : <p className="font-semibold">Por confirmar</p>}
          </div>
        </div>
        {BUSINESS.whatsapp && (
          <a href={whatsappUrl(BUSINESS.whatsapp, "Hola FRESCA MAREA")} target="_blank" rel="noreferrer" className="flex h-14 items-center justify-center gap-2 rounded-xl bg-success font-display text-xl font-semibold text-success-foreground">
            <MessageCircle className="h-5 w-5" /> Escríbenos por WhatsApp
          </a>
        )}
      </div>
    </section>
  );
}
