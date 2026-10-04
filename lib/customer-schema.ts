import { z } from "zod";
import { normalizePhone } from "@/lib/angola";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome"),
  email: z.email("O email não parece correto"),
  password: z.string().min(8, "A password tem de ter pelo menos 8 caracteres"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^9\d{8}$/.test(normalizePhone(v)), "O telefone deve ter 9 dígitos e começar por 9"),
});

export const loginSchema = z.object({
  email: z.email("O email não parece correto"),
  password: z.string().min(1, "Indica a tua password"),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome"),
  phone: z
    .string()
    .optional()
    .refine((v) => !v || /^9\d{8}$/.test(normalizePhone(v)), "O telefone deve ter 9 dígitos e começar por 9"),
});

export const changePasswordSchema = z.object({
  // Só obrigatório para quem já tem password definida — validado à parte na rota.
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8, "A nova password tem de ter pelo menos 8 caracteres"),
});
