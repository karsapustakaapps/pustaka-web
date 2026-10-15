import { eq } from "drizzle-orm";
import { db } from "@/db";
import { session, user } from "@/db/schema";
import { auth } from "./auth";
import { signupSchema } from "./auth-validation";

export async function createInitialAdmin(input: unknown) {
  const credentials = signupSchema.parse(input);
  const existing = await db.select({ id: user.id, role: user.role }).from(user).where(eq(user.email, credentials.email)).get();
  if (existing) {
    if (existing.role !== "admin") throw new Error("Email ini sudah digunakan pembaca. Pilih ADMIN_EMAIL lain; akun pembaca tidak diubah.");
    return { id: existing.id, created: false };
  }
  const result = await auth.api.signUpEmail({ body: credentials });
  await db.transaction(async (tx) => {
    await tx.update(user).set({ role: "admin", onboardingCompleted: true, updatedAt: new Date() }).where(eq(user.id, result.user.id)).run();
    await tx.delete(session).where(eq(session.userId, result.user.id)).run();
  });
  return { id: result.user.id, created: true };
}
