import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "./auth";
import { isAdminUser } from "./roles";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/masuk");
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!await isAdminUser(user.id)) notFound();
  return user;
}
