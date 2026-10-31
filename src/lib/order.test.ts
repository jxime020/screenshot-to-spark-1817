import { describe, it, expect } from "vitest";
import { computeTotals, clampQty, whatsappUrl, type CartLine } from "./order";
import { DELIVERY_ZONES } from "./config";

const lines: CartLine[] = [
  { key: "a", productId: "aguachile-negro", name: "Aguachile Negro", unitPrice: 190, quantity: 1, extras: [], image: "" },
  { key: "b", productId: "todologo", name: "Todólogo", unitPrice: 239, quantity: 1, extras: [], image: "" },
];

describe("order rules", () => {
  it("Zona Centro adds $30: 429 + 30 = 459", () => {
    const centro = DELIVERY_ZONES.find((z) => z.id === "centro")!;
    expect(computeTotals(lines, { mode: "domicilio", zoneCost: centro.cost, discountPct: 0 }).total).toBe(459);
  });
  it("Otras zonas cost $50", () => {
    expect(DELIVERY_ZONES.find((z) => z.id === "otras")!.cost).toBe(50);
  });
  it("pickup has no shipping", () => {
    expect(computeTotals(lines, { mode: "recoger", zoneCost: 50, discountPct: 0 }).total).toBe(429);
  });
  it("quantities never go below 1", () => {
    expect(clampQty(-3)).toBe(1);
  });
  it("whatsapp link is URL-encoded", () => {
    expect(whatsappUrl("+52 662 123", "Hola & total $5")).toBe("https://wa.me/52662123?text=Hola%20%26%20total%20%245");
  });
});
