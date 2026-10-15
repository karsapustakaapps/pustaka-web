import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Daftar — Pustaka" };
export default function SignupPage() {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka Pustaka…</p>}><SignupContent /></Suspense>;
}

async function SignupContent() {
  const session = await getSession();
  if (session) redirect(session.user.role === "admin" ? "/admin" : "/pustakaku");
  return <AuthForm mode="daftar" />;
}
