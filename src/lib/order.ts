export type CartLine = {
  key: string;
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  extras: string[];
  image: string;
};

export const MAX_QTY = 99;

export function clampQty(q: number) {
  if (!Number.isFinite(q)) return 1;
  return Math.min(MAX_QTY, Math.max(1, Math.floor(q)));
}

export function subtotal(lines: CartLine[]) {
  return lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
}

export function computeTotals(
  lines: CartLine[],
  opts: { mode: "domicilio" | "recoger"; zoneCost: number | null; discountPct: number },
) {
  const sub = subtotal(lines);
  const discount = Math.round((sub * Math.min(100, Math.max(0, opts.discountPct))) / 100);
  const shipping = opts.mode === "domicilio" ? (opts.zoneCost ?? 0) : 0;
  return { subtotal: sub, discount, shipping, total: sub - discount + shipping };
}

export const mxn = (n: number) => `$${n.toLocaleString("es-MX")} MXN`;

export function whatsappUrl(phone: string, message: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}

export function isValidPhone(p: string) {
  return p.replace(/\D/g, "").length === 10;
}
