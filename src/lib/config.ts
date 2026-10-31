import aguachileNegro from "@/assets/aguachile-negro.jpg";
import todologo from "@/assets/todologo.jpg";

/**
 * Configuración central de FRESCA MAREA.
 * Edita aquí productos, precios, zonas, horarios, dirección y WhatsApp.
 * Campos vacíos ("") o listas vacías se muestran como "por confirmar".
 */

export type ProductExtra = { id: string; name: string; price: number };

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  extras: ProductExtra[];
  popular?: boolean;
};

export const PRODUCTS: Product[] = [
  {
    id: "aguachile-negro",
    name: "Aguachile Negro",
    description: "Nuestro aguachile en salsa negra, preparado al momento.",
    price: 190,
    image: aguachileNegro,
    ingredients: [], // Por confirmar
    extras: [], // Por confirmar
    popular: true,
  },
  {
    id: "todologo",
    name: "Todólogo",
    description: "Una combinación de mariscos frescos para compartir.",
    price: 239,
    image: todologo,
    ingredients: [],
    extras: [],
    popular: true,
  },
];

export type Zone = { id: string; name: string; cost: number; eta: string };

export const DELIVERY_ZONES: Zone[] = [
  { id: "centro", name: "Zona Centro", cost: 30, eta: "30–45 min" },
  { id: "otras", name: "Otras zonas", cost: 50, eta: "45–70 min" },
];

/** Códigos promocionales: código en MAYÚSCULAS → descuento en % (0-100). */
export const PROMO_CODES: Record<string, number> = {};

export type Promotion = { title: string; description: string };
export const PROMOTIONS: Promotion[] = [];

export const BUSINESS = {
  name: "FRESCA MAREA",
  tagline: "Mariscos · Aguachiles · Frescura",
  /** Número en formato internacional sin "+" ni espacios, ej. 526621234567 */
  whatsapp: "",
  address: "",
  phone: "",
  email: "",
  hours: [] as { days: string; time: string }[],
  socials: [] as { name: string; url: string }[],
};

export type PaymentMethodId = "efectivo" | "transferencia" | "tarjeta" | "paypal";

export const PAYMENT_METHODS: {
  id: PaymentMethodId;
  name: string;
  description: string;
  available: boolean;
  note?: string;
}[] = [
  { id: "efectivo", name: "Efectivo", description: "Pagas al recibir tu pedido.", available: true },
  {
    id: "transferencia",
    name: "Transferencia bancaria",
    description: "Te compartimos nuestros datos después de confirmar.",
    available: true,
  },
  {
    id: "tarjeta",
    name: "Tarjeta de débito/crédito",
    description: "Pago en línea.",
    available: false,
    note: "Próximamente — aún no disponible.",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Pago en línea.",
    available: false,
    note: "Próximamente — aún no disponible.",
  },
];

/** Datos bancarios: se muestran solo si están configurados. */
export const BANK_DETAILS = { bank: "", holder: "", clabe: "" };
