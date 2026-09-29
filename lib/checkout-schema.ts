import { z } from "zod";
import { isAngolaProvince, normalizePhone } from "@/lib/angola";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Indica o teu nome completo"),
  customerPhone: z
    .string()
    .refine((v) => /^9\d{8}$/.test(normalizePhone(v)), "Indica um número de telefone angolano (9 dígitos, começa por 9)"),
  customerEmail: z.email("O email não parece correto").optional().or(z.literal("")),
  province: z.string().refine(isAngolaProvince, "Escolhe a tua província"),
  municipality: z.string().trim().min(2, "Indica o teu município"),
  bairro: z.string().trim().min(2, "Indica o teu bairro"),
  addressLine: z.string().trim().min(5, "Indica a tua morada"),
  addressNotes: z.string().max(500).optional(),
  paymentMethod: z.enum(["STRIPE", "BITPAY_AO"], "Escolhe como queres pagar"),
  bitpayMethod: z.enum(["multicaixa_express", "multicaixa_reference"]).optional(),
  // Número Multicaixa Express, se for diferente do telefone de entrega.
  bitpayMobile: z
    .string()
    .optional()
    .refine((v) => !v || /^9\d{8}$/.test(normalizePhone(v)), "O número Multicaixa Express deve ter 9 dígitos e começar por 9"),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive().max(20),
      }),
    )
    .min(1, "O teu carrinho está vazio"),
})
  .refine((d) => d.paymentMethod !== "BITPAY_AO" || d.bitpayMethod, {
    message: "Escolhe Multicaixa Express ou Referência Multicaixa",
    path: ["bitpayMethod"],
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
