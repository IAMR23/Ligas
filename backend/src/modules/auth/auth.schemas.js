import { z } from "zod";

const passwordSchema = z.string().min(8, "La contrasena debe tener minimo 8 caracteres");

export const registerSchema = z.object({
  body: z
    .object({
      fullName: z.string().trim().min(3),
      username: z.string().trim().min(3).max(40),
      email: z.string().trim().email().toLowerCase(),
      password: passwordSchema,
      confirmPassword: passwordSchema.optional()
    })
    .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
      message: "Las contrasenas no coinciden",
      path: ["confirmPassword"]
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().trim().min(3),
    password: z.string().min(1),
    deviceId: z.string().optional(),
    platform: z.string().optional()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(64)
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email().toLowerCase()
  }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(64),
      password: passwordSchema,
      confirmPassword: passwordSchema.optional()
    })
    .refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
      message: "Las contrasenas no coinciden",
      path: ["confirmPassword"]
    }),
  params: z.object({}).optional(),
  query: z.object({}).optional()
});
