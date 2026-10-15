import { eq } from "drizzle-orm";
import { db } from "@/db";
import { user } from "@/db/schema";

export async function isAdminUser(userId: string) {
  return (await db.select({ role: user.role }).from(user).where(eq(user.id, userId)).get())?.role === "admin";
}
