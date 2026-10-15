import { z } from "zod";

export const fullNameSchema = z.string().trim().min(2, "Nama lengkap minimal 2 karakter.").max(100, "Nama maksimal 100 karakter.");
const reservedUsernames = new Set(["admin", "api", "buku", "daftar", "masuk", "minat", "pustakaku", "profil", "_next"]);
export const usernameSchema = z.string().trim().toLowerCase()
  .min(3, "Username minimal 3 karakter.").max(30, "Username maksimal 30 karakter.")
  .regex(/^[a-z0-9_]+$/, "Username hanya boleh berisi huruf, angka, dan garis bawah.")
  .refine((value) => !reservedUsernames.has(value), "Username ini tidak dapat digunakan.");
export const phoneSchema = z.string().trim().max(32, "Nomor telepon terlalu panjang.")
  .regex(/^\+?[\d\s()-]+$/, "Masukkan nomor telepon yang valid.")
  .transform((value) => value.replace(/[\s()-]/g, ""))
  .refine((value) => /^\+?\d{8,15}$/.test(value), "Nomor telepon harus berisi 8–15 angka.");

export const signupSchema = z.object({
  name: fullNameSchema,
  username: usernameSchema,
  email: z.email("Masukkan alamat email yang valid.").max(254).transform((value) => value.toLowerCase()),
  phoneNumber: phoneSchema,
  password: z.string().min(8, "Kata sandi minimal 8 karakter.").max(128, "Kata sandi maksimal 128 karakter."),
  passwordConfirmation: z.string().max(128, "Konfirmasi kata sandi terlalu panjang."),
}).refine((value) => value.password === value.passwordConfirmation, {
  message: "Konfirmasi kata sandi tidak sama.", path: ["passwordConfirmation"],
});
