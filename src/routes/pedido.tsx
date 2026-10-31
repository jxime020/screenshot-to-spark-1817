import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Bike, Building2, Check, ChevronLeft, ChevronRight, Clock, CreditCard, Crosshair, Loader2, MapPin, MessageCircle, ShoppingBag, Store, Tag, Trash2, Wallet } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { QtyControl } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { BANK_DETAILS, BUSINESS, DELIVERY_ZONES, PAYMENT_METHODS, PROMO_CODES, type PaymentMethodId } from "@/lib/config";
import { computeTotals, isValidPhone, mxn, whatsappUrl } from "@/lib/order";

export const Route = createFileRoute("/pedido")({
  head: () => ({
    meta: [
      { title: "Tu pedido — FRESCA MAREA" },
      { name: "description", content: "Revisa tu carrito, elige entrega y pago, y confirma tu pedido por WhatsApp." },
      { property: "og:title", content: "Tu pedido — FRESCA MAREA" },
      { property: "og:description", content: "Completa tu pedido de mariscos en 4 pasos." },
    ],
  }),
  component: Checkout,
});

type Mode = "domicilio" | "recoger";
type Form = { name: string; phone: string; address: string; colonia: string; cp: string; refs: string; coords: string };
const emptyForm: Form = { name: "", phone: "", address: "", colonia: "", cp: "", refs: "", coords: "" };
const STEPS = ["Tu pedido", "Entrega", "Pago", "Confirmar"];
const STORE_KEY = "fm-checkout-v1";
const payIcons: Record<PaymentMethodId, typeof Banknote> = { efectivo: Banknote, transferencia: Building2, tarjeta: CreditCard, paypal: Wallet };

function Checkout() {
  const cart = useCart();
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<Mode>("domicilio");
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [form, setForm] = useState<Form>(emptyForm);
  const [payment, setPayment] = useState<PaymentMethodId | null>(null);
  const [promo, setPromo] = useState({ open: false, input: "", applied: "", error: "" });
  const [errors, setErrors] = useState<Partial<Record<"name"|"phone"|"address"|"colonia"|"cp"|"zone"|"payment"|"geo", string>>>({});
  const [locating, setLocating] = useState(false);
  const [sent, setSent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (s) { setMode(s.mode); setZoneId(s.zoneId); setForm({ ...emptyForm, ...s.form }); setPayment(s.payment); }
    } catch {}
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORE_KEY, JSON.stringify({ mode, zoneId, form, payment }));
  }, [mode, zoneId, form, payment, loaded]);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  const zone = DELIVERY_ZONES.find((z) => z.id === zoneId) ?? null;
  const t = computeTotals(cart.lines, { mode, zoneCost: zone?.cost ?? null, discountPct: promo.applied ? PROMO_CODES[promo.applied] : 0 });
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function validateDelivery() {
    const e: typeof errors = {};
    if (form.name.trim().length < 3) e.name = "Escribe tu nombre completo.";
    if (!isValidPhone(form.phone)) e.phone = "Escribe un teléfono de 10 dígitos.";
    if (mode === "domicilio") {
      if (!form.address.trim()) e.address = "La dirección es obligatoria.";
      if (!form.colonia.trim()) e.colonia = "La colonia es obligatoria.";
      if (!/^\d{5}$/.test(form.cp.trim())) e.cp = "Código postal de 5 dígitos.";
      if (!zone) e.zone = "Selecciona tu zona de entrega.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function next() {
    if (step === 0 && cart.lines.length === 0) return;
    if (step === 1 && !validateDelivery()) return;
    if (step === 2) {
      const m = PAYMENT_METHODS.find((p) => p.id === payment);
      if (!m || !m.available) { setErrors({ payment: "Selecciona un método de pago disponible." }); return; }
      setErrors({});
    }
    setStep((s) => Math.min(3, s + 1));
  }

  function locate() {
    if (!("geolocation" in navigator)) { setErrors((e) => ({ ...e, geo: "Tu navegador no permite obtener la ubicación." })); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setForm((f) => ({ ...f, coords: `${p.coords.latitude.toFixed(6)},${p.coords.longitude.toFixed(6)}` })); setLocating(false); setErrors((e) => ({ ...e, geo: "" })); },
      () => { setLocating(false); setErrors((e) => ({ ...e, geo: "No pudimos obtener tu ubicación. Revisa los permisos." })); },
      { timeout: 10000 },
    );
  }

  function buildMessage() {
    const pm = PAYMENT_METHODS.find((p) => p.id === payment)!;
    const L = [
      `*Nuevo pedido — ${BUSINESS.name}*`, "",
      ...cart.lines.map((l) => `• ${l.quantity} × ${l.name}${l.extras.length ? ` (${l.extras.join(", ")})` : ""} — ${mxn(l.unitPrice * l.quantity)}`), "",
      `Subtotal: ${mxn(t.subtotal)}`,
      ...(t.discount ? [`Descuento (${promo.applied}): -${mxn(t.discount)}`] : []),
      mode === "domicilio" ? `Envío (${zone?.name}): ${mxn(t.shipping)}` : "Envío: Pasa a recoger",
      `*Total: ${mxn(t.total)}*`, "",
      `Cliente: ${form.name.trim()}`, `Teléfono: ${form.phone.trim()}`,
      mode === "domicilio" ? `Entrega a domicilio: ${form.address.trim()}, Col. ${form.colonia.trim()}, CP ${form.cp.trim()}` : "Modalidad: Pasar a recoger",
      ...(mode === "domicilio" && form.refs.trim() ? [`Referencias: ${form.refs.trim()}`] : []),
      ...(mode === "domicilio" && form.coords ? [`Ubicación: https://maps.google.com/?q=${form.coords}`] : []),
      `Pago: ${pm.name}`, "", "Estado: pendiente de confirmación",
    ];
    return L.join("\n");
  }

  if (sent) {
    return (
      <Shell>
        <div className="card-surface p-8 text-center animate-in fade-in zoom-in-95">
          <Clock className="mx-auto h-12 w-12 text-primary" />
          <h1 className="mt-4 text-4xl font-bold">Pedido pendiente de confirmación</h1>
          <p className="mt-2 text-muted-foreground">Enviamos tu resumen por WhatsApp. Tu pedido quedará confirmado cuando FRESCA MAREA lo acepte.</p>
          <Link to="/menu" onClick={() => cart.clear()} className="mt-6 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-display text-lg font-semibold text-primary-foreground">Hacer otro pedido</Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Stepper step={step} />
      <div key={step} className="animate-in fade-in slide-in-from-right-4 duration-300">
        {step === 0 && (
          <>
            <Title title="Tu pedido" sub="Revisa tus platillos y continúa con los datos de entrega." />
            {cart.lines.length === 0 ? (
              <div className="card-surface p-8 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-primary" />
                <p className="mt-3 text-xl font-semibold">Tu carrito está vacío</p>
                <p className="text-muted-foreground">Descubre nuestros aguachiles y mariscos.</p>
                <Link to="/menu" className="mt-5 inline-flex h-12 items-center rounded-xl bg-primary px-6 font-display text-lg font-semibold text-primary-foreground">Explorar menú</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.lines.map((l) => (
                  <div key={l.key} className="card-surface flex gap-4 p-3">
                    <img src={l.image} alt={l.name} width={816} height={816} className="h-28 w-28 shrink-0 rounded-lg object-cover" />
                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="truncate font-display text-xl font-semibold">{l.name}</p>
                        {l.extras.length > 0 && <p className="text-xs text-muted-foreground">{l.extras.join(", ")}</p>}
                        <p className="font-display text-lg text-primary">{mxn(l.unitPrice * l.quantity)}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <QtyControl value={l.quantity} onChange={(n) => cart.setQty(l.key, n)} />
                        <button aria-label={`Eliminar ${l.name}`} onClick={() => cart.remove(l.key)} className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:text-primary"><Trash2 className="h-5 w-5" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="card-surface p-4">
                  <button onClick={() => setPromo((p) => ({ ...p, open: !p.open }))} className="flex w-full items-center gap-3 text-left">
                    <Tag className="h-5 w-5" /><span className="flex-1">{promo.applied ? `Código aplicado: ${promo.applied}` : "¿Tienes un código de promoción?"}</span><ChevronRight className={`h-5 w-5 transition ${promo.open ? "rotate-90" : ""}`} />
                  </button>
                  {promo.open && (
                    <div className="mt-3 flex gap-2">
                      <input value={promo.input} onChange={(e) => setPromo((p) => ({ ...p, input: e.target.value }))} placeholder="Código" className="h-11 min-w-0 flex-1 rounded-lg border bg-secondary px-3 uppercase outline-none focus:border-primary" />
                      <button onClick={() => { const c = promo.input.trim().toUpperCase(); setPromo((p) => (c in PROMO_CODES ? { ...p, applied: c, error: "" } : { ...p, applied: "", error: "Código no válido." })); }} className="h-11 rounded-lg bg-secondary px-4 font-semibold hover:bg-muted">Aplicar</button>
                    </div>
                  )}
                  {promo.error && <p className="mt-2 text-sm text-primary">{promo.error}</p>}
                </div>
                <Totals t={t} shippingLabel="Por calcular" showShipping={false} />
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Title title="¿Cómo quieres tu pedido?" sub="Elige si prefieres entrega a domicilio o pasar a recoger." />
            <div className="grid grid-cols-2 gap-3">
              {([["domicilio", Bike, "Entrega a domicilio", "Te lo llevamos hasta tu puerta."], ["recoger", Store, "Pasar a recoger", "Te avisamos cuando esté listo."]] as const).map(([id, Icon, name, d]) => (
                <button key={id} onClick={() => setMode(id)} className={`card-surface relative p-4 text-center transition ${mode === id ? "card-selected" : "hover:border-muted-foreground"}`}>
                  {mode === id && <Check className="absolute right-2 top-2 h-5 w-5 rounded-full bg-primary p-0.5 text-primary-foreground" />}
                  <Icon className={`mx-auto h-10 w-10 ${mode === id ? "text-primary" : ""}`} />
                  <p className="mt-2 font-display text-lg font-semibold">{name}</p>
                  <p className="text-sm text-muted-foreground">{d}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-semibold"><MapPin className="h-5 w-5" /> {mode === "domicilio" ? "Dirección de entrega" : "Tus datos"}</h2>
              {mode === "domicilio" && (
                <button onClick={locate} disabled={locating} className="flex items-center gap-1.5 text-sm font-medium text-primary">
                  {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crosshair className="h-4 w-4" />} {form.coords ? "Ubicación agregada" : "Usar mi ubicación"}
                </button>
              )}
            </div>
            {errors.geo && <p className="mt-1 text-sm text-primary">{errors.geo}</p>}
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Nombre completo" error={errors.name} value={form.name} onChange={set("name")} autoComplete="name" />
              <Field label="Teléfono" error={errors.phone} value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
              {mode === "domicilio" && (
                <>
                  <Field className="col-span-2" label="Dirección" error={errors.address} value={form.address} onChange={set("address")} autoComplete="street-address" />
                  <Field label="Colonia" error={errors.colonia} value={form.colonia} onChange={set("colonia")} />
                  <Field label="Código postal" error={errors.cp} value={form.cp} onChange={set("cp")} inputMode="numeric" maxLength={5} autoComplete="postal-code" />
                  <Field className="col-span-2" label="Referencias (opcional)" placeholder="Ej. Casa blanca con portón negro" value={form.refs} onChange={set("refs")} />
                </>
              )}
            </div>

            {mode === "domicilio" ? (
              <>
                <h2 className="mt-6 flex items-center gap-2 text-xl font-semibold"><Bike className="h-5 w-5" /> Costo de envío</h2>
                <div className="mt-3 space-y-3">
                  {DELIVERY_ZONES.map((z) => (
                    <button key={z.id} onClick={() => setZoneId(z.id)} className={`card-surface flex w-full items-center gap-3 p-4 text-left transition ${zoneId === z.id ? "card-selected" : ""}`}>
                      <Radio on={zoneId === z.id} />
                      <div className="flex-1"><p className="font-semibold">{z.name}</p><p className="text-sm text-muted-foreground">Tiempo estimado: {z.eta}</p></div>
                      <span className="font-display text-lg font-semibold">{mxn(z.cost)}</span>
                    </button>
                  ))}
                  {errors.zone && <p className="text-sm text-primary">{errors.zone}</p>}
                </div>
              </>
            ) : (
              <div className="card-surface mt-6 space-y-1 p-4">
                <p className="font-semibold">Dirección del establecimiento</p>
                <p className="text-muted-foreground">{BUSINESS.address || "Por confirmar — te la compartimos por WhatsApp."}</p>
                <p className="pt-2 font-semibold">Horarios</p>
                {BUSINESS.hours.length ? BUSINESS.hours.map((h) => <p key={h.days} className="text-muted-foreground">{h.days}: {h.time}</p>) : <p className="text-muted-foreground">Por confirmar</p>}
              </div>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Title title="Método de pago" sub="Elige cómo quieres pagar tu pedido." />
            <div className="space-y-3">
              {PAYMENT_METHODS.map((m) => {
                const Icon = payIcons[m.id];
                return (
                  <button key={m.id} disabled={!m.available} onClick={() => setPayment(m.id)} className={`card-surface flex w-full items-center gap-4 p-4 text-left transition disabled:opacity-50 ${payment === m.id ? "card-selected" : ""}`}>
                    <Radio on={payment === m.id} />
                    <Icon className="h-8 w-8 shrink-0 text-primary" />
                    <div><p className="font-display text-lg font-semibold">{m.name}</p><p className="text-sm text-muted-foreground">{m.available ? m.description : m.note}</p></div>
                  </button>
                );
              })}
              {errors.payment && <p className="text-sm text-primary">{errors.payment}</p>}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Title title="Confirmar pedido" sub="Revisa que todo esté correcto antes de enviarlo." />
            <div className="flex items-center justify-between"><h2 className="text-2xl font-semibold">Resumen del pedido</h2><button onClick={() => setStep(0)} className="text-sm font-medium text-primary">Editar</button></div>
            <div className="mt-3 space-y-3">
              {cart.lines.map((l) => (
                <div key={l.key} className="card-surface flex items-center gap-3 p-3">
                  <img src={l.image} alt="" width={816} height={816} className="h-16 w-16 rounded-lg object-cover" />
                  <p className="flex-1 font-display text-lg font-semibold">{l.name}</p>
                  <div className="text-right"><p className="font-semibold">{mxn(l.unitPrice * l.quantity)}</p><p className="text-sm text-muted-foreground">{l.quantity} × ${l.unitPrice}</p></div>
                </div>
              ))}
              <div className="card-surface space-y-1 p-4 text-sm">
                <p><span className="text-muted-foreground">Entrega: </span>{mode === "domicilio" ? `${form.address}, Col. ${form.colonia}, CP ${form.cp}` : "Pasar a recoger"}</p>
                <p><span className="text-muted-foreground">Cliente: </span>{form.name} · {form.phone}</p>
                <p><span className="text-muted-foreground">Pago: </span>{PAYMENT_METHODS.find((p) => p.id === payment)?.name}</p>
                {payment === "transferencia" && (
                  <p className="pt-1 text-muted-foreground">{BANK_DETAILS.clabe ? `${BANK_DETAILS.bank} · ${BANK_DETAILS.holder} · CLABE ${BANK_DETAILS.clabe}` : "Te compartiremos los datos bancarios por WhatsApp al confirmar."}</p>
                )}
              </div>
              <Totals t={t} showShipping shippingLabel={mode === "domicilio" ? `Envío (${zone?.name})` : "Envío (recoger)"} />
            </div>

            {!BUSINESS.whatsapp ? (
              <p className="card-surface mt-5 p-4 text-sm text-muted-foreground">El número de WhatsApp del negocio aún no está configurado, por lo que los pedidos todavía no se pueden enviar.</p>
            ) : confirming ? (
              <div className="card-surface mt-5 space-y-3 p-4">
                <p className="font-semibold">¿Enviar tu pedido por {mxn(t.total)}?</p>
                <p className="text-sm text-muted-foreground">Se abrirá WhatsApp con el resumen. No se realiza ningún cobro en línea.</p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirming(false)} className="h-12 flex-1 rounded-xl bg-secondary font-semibold">Cancelar</button>
                  <a href={whatsappUrl(BUSINESS.whatsapp, buildMessage())} target="_blank" rel="noreferrer" onClick={() => setSent(true)} className="flex h-12 flex-1 items-center justify-center rounded-xl bg-success font-semibold text-success-foreground">Sí, enviar</a>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirming(true)} className="mt-5 flex w-full items-center gap-4 rounded-xl bg-success p-4 text-left text-success-foreground transition active:scale-[0.99]">
                <MessageCircle className="h-8 w-8 shrink-0" />
                <span><span className="block font-display text-xl font-semibold">Confirmar pedido por WhatsApp</span><span className="text-sm opacity-90">Te enviaremos un resumen de tu pedido.</span></span>
              </button>
            )}
          </>
        )}
      </div>

      {!(step === 0 && cart.lines.length === 0) && step < 3 && (
        <button onClick={next} className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary font-display text-xl font-semibold text-primary-foreground transition hover:bg-primary/90 active:scale-[0.99]">
          Continuar <ChevronRight className="h-5 w-5" />
        </button>
      )}
      <div className="mt-4 text-center">
        {step === 0 ? (
          cart.lines.length > 0 && <Link to="/menu" className="inline-flex items-center gap-2 py-2"><ChevronLeft className="h-4 w-4" /> Seguir comprando</Link>
        ) : (
          <button onClick={() => { setErrors({}); setConfirming(false); setStep((s) => s - 1); }} className="inline-flex items-center gap-2 py-2"><ChevronLeft className="h-4 w-4" /> Volver a {(STEPS[step - 1] ?? "").toLowerCase()}</button>
        )}
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return <section className="mx-auto max-w-xl px-4 pt-6">{children}</section>;
}

function Stepper({ step }: { step: number }) {
  return (
    <ol className="mb-6 grid grid-cols-4">
      {STEPS.map((s, i) => (
        <li key={s} className="relative flex flex-col items-center gap-1">
          {i > 0 && <span className={`absolute right-1/2 top-4 h-0.5 w-full -translate-x-4 ${i <= step ? "bg-primary" : "bg-border"}`} />}
          <span className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border text-sm font-semibold transition ${i <= step ? "border-primary bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</span>
          <span className={`text-xs sm:text-sm ${i === step ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

function Title({ title, sub }: { title: string; sub: string }) {
  return (<div className="mb-5"><h1 className="text-4xl font-bold">{title}</h1><p className="text-muted-foreground">{sub}</p></div>);
}

function Radio({ on }: { on: boolean }) {
  return <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${on ? "border-primary" : "border-muted-foreground"}`}>{on && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}</span>;
}

function Field({ label, error, className = "", ...props }: { label: string; error?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className}`}>
      <span className={`card-surface block px-3 py-2 focus-within:border-primary ${error ? "border-primary" : ""}`}>
        <span className="block text-xs text-muted-foreground">{label}</span>
        <input {...props} className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground/60" />
      </span>
      {error && <span className="mt-1 block text-xs text-primary">{error}</span>}
    </label>
  );
}

function Totals({ t, showShipping, shippingLabel }: { t: ReturnType<typeof computeTotals>; showShipping: boolean; shippingLabel: string }) {
  return (
    <div className="card-surface space-y-2 p-4">
      <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{mxn(t.subtotal)}</span></div>
      {t.discount > 0 && <div className="flex justify-between"><span className="text-muted-foreground">Descuento</span><span>-{mxn(t.discount)}</span></div>}
      <div className="flex justify-between"><span className="text-muted-foreground">{showShipping ? shippingLabel : "Envío"}</span><span>{showShipping ? mxn(t.shipping) : shippingLabel}</span></div>
      <div className="flex justify-between border-t pt-2 font-display text-2xl font-bold"><span>{showShipping ? "Total a pagar" : "Total"}</span><span className="text-primary">{mxn(showShipping ? t.total : t.subtotal - t.discount)}</span></div>
    </div>
  );
}
