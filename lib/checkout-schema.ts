import { z } from "zod";

export const checkoutSchema = z.object({
  customerName: z.string().min(2, "Indica o teu nome completo"),
  customerPhone: z.string().min(9, "Indica um número de telefone válido"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  province: z.string().min(2, "Escolhe a tua província"),
  municipality: z.string().min(2, "Indica o teu município"),
  addressLine: z.string().min(5, "Indica a tua morada"),
  addressNotes: z.string().optional(),
  paymentMethod: z.enum(["STRIPE", "BITPAY_AO"]),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "O teu carrinho está vazio"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
