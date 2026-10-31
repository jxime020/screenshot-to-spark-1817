import { Check, Info, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart";
import type { Product } from "@/lib/config";
import { clampQty, mxn } from "@/lib/order";

export function QtyControl({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <button type="button" aria-label="Disminuir" disabled={value <= 1} onClick={() => onChange(clampQty(value - 1))} className="grid h-9 w-9 place-items-center rounded-lg bg-secondary transition hover:bg-muted disabled:opacity-40">
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-lg font-semibold">{value}</span>
      <button type="button" aria-label="Aumentar" onClick={() => onChange(clampQty(value + 1))} className="grid h-9 w-9 place-items-center rounded-lg bg-secondary transition hover:bg-muted">
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [extras, setExtras] = useState<string[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [added, setAdded] = useState(false);
  const unit = product.price + product.extras.filter((e) => extras.includes(e.id)).reduce((s, e) => s + e.price, 0);

  return (
    <article className="card-surface flex flex-col overflow-hidden">
      <img src={product.image} alt={product.name} loading="lazy" width={816} height={816} className="aspect-[4/3] w-full object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-2xl font-bold">{product.name}</h3>
          <span className="shrink-0 font-display text-xl font-bold text-primary">{mxn(product.price)}</span>
        </div>
        <p className="text-sm text-muted-foreground">{product.description}</p>

        <button type="button" onClick={() => setShowInfo((s) => !s)} className="flex items-center gap-1.5 self-start text-sm font-medium text-primary">
          <Info className="h-4 w-4" /> {showInfo ? "Ocultar ingredientes" : "Ver ingredientes"}
        </button>
        {showInfo && (
          <div className="rounded-lg bg-secondary p-3 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-1">
            {product.ingredients.length ? product.ingredients.join(", ") : "Ingredientes por confirmar."}
          </div>
        )}

        {product.extras.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Extras</p>
            {product.extras.map((e) => (
              <label key={e.id} className="flex cursor-pointer items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2">
                  <input type="checkbox" className="accent-primary" checked={extras.includes(e.id)} onChange={(ev) => setExtras((x) => (ev.target.checked ? [...x, e.id] : x.filter((i) => i !== e.id)))} />
                  {e.name}
                </span>
                <span className="text-muted-foreground">+{mxn(e.price)}</span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <QtyControl value={qty} onChange={setQty} />
          <button
            type="button"
            onClick={() => {
              add(product.id, qty, extras);
              setAdded(true);
              setTimeout(() => setAdded(false), 1200);
              toast.success(`${qty} × ${product.name} agregado al carrito`);
              setQty(1);
            }}
            className="flex h-11 items-center gap-2 rounded-xl bg-primary px-5 font-display text-lg font-semibold text-primary-foreground transition active:scale-95 hover:bg-primary/90"
          >
            {added ? <><Check className="h-5 w-5" /> Agregado</> : <>Agregar · {mxn(unit * qty).replace(" MXN", "")}</>}
          </button>
        </div>
      </div>
    </article>
  );
}
