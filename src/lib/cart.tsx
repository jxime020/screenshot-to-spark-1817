import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { PRODUCTS } from "./config";
import { clampQty, type CartLine } from "./order";

type CartCtx = {
  lines: CartLine[];
  count: number;
  add: (productId: string, quantity: number, extraIds?: string[]) => void;
  setQty: (key: string, q: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "fm-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        // Re-validate prices against config
        const parsed = JSON.parse(raw) as CartLine[];
        const valid = parsed.flatMap((l) => {
          const p = PRODUCTS.find((x) => x.id === l.productId);
          if (!p) return [];
          const extras = p.extras.filter((e) => l.extras.includes(e.name));
          return [{ ...l, name: p.name, image: p.image, unitPrice: p.price + extras.reduce((s, e) => s + e.price, 0), quantity: clampQty(l.quantity) }];
        });
        setLines(valid);
      }
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  const add: CartCtx["add"] = (productId, quantity, extraIds = []) => {
    const p = PRODUCTS.find((x) => x.id === productId);
    if (!p) return;
    const extras = p.extras.filter((e) => extraIds.includes(e.id));
    const key = [productId, ...extras.map((e) => e.id).sort()].join("|");
    setLines((prev) => {
      const ex = prev.find((l) => l.key === key);
      if (ex) return prev.map((l) => (l.key === key ? { ...l, quantity: clampQty(l.quantity + quantity) } : l));
      return [
        ...prev,
        {
          key,
          productId,
          name: p.name,
          image: p.image,
          extras: extras.map((e) => e.name),
          unitPrice: p.price + extras.reduce((s, e) => s + e.price, 0),
          quantity: clampQty(quantity),
        },
      ];
    });
  };

  return (
    <Ctx.Provider
      value={{
        lines,
        count: lines.reduce((s, l) => s + l.quantity, 0),
        add,
        setQty: (key, q) => setLines((prev) => prev.map((l) => (l.key === key ? { ...l, quantity: clampQty(q) } : l))),
        remove: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
        clear: () => setLines([]),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
