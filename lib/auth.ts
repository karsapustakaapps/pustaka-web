import { betterAuth } from "better-auth/minimal";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { fullNameSchema, phoneSchema, signupSchema, usernameSchema } from "./auth-validation";

export const auth = betterAuth({
  appName: "Pustaka",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  emailAndPassword: { enabled: true, minPasswordLength: 8, maxPasswordLength: 128 },
  session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24 },
  user: {
    additionalFields: {
      phoneNumber: { type: "string", required: true, validator: { input: phoneSchema } },
      username: { type: "string", required: true, validator: { input: usernameSchema } },
      publicHistory: { type: "boolean", required: false, defaultValue: false, input: false },
      onboardingCompleted: { type: "boolean", required: false, defaultValue: false, input: false },
      role: { type: ["reader", "admin"], required: false, defaultValue: "reader", input: false },
    },
    changeEmail: { enabled: false },
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
      "/sign-up/email": { window: 60, max: 5 },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-up/email") {
        const result = signupSchema.safeParse(ctx.body);
        if (!result.success) throw new APIError("BAD_REQUEST", { message: result.error.issues[0].message });
        if (await db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.username, result.data.username)).get()) {
          throw new APIError("BAD_REQUEST", { message: "Username ini sudah digunakan." });
        }
        return { context: { body: { ...ctx.body, ...result.data } } };
      }
      if (ctx.path === "/update-user" && (ctx.body?.username !== undefined || ctx.body?.publicHistory !== undefined)) {
        throw new APIError("BAD_REQUEST", { message: "Gunakan halaman edit profil untuk mengubah username dan privasi." });
      }
      if (ctx.path === "/update-user" && ctx.body?.name !== undefined) {
        const result = fullNameSchema.safeParse(ctx.body.name);
        if (!result.success) throw new APIError("BAD_REQUEST", { message: result.error.issues[0].message });
        return { context: { body: { ...ctx.body, name: result.data } } };
      }
    }),
  },
});
