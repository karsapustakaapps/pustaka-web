import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Masuk — Pustaka" };
export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka Pustaka…</p>}><LoginContent searchParams={searchParams} /></Suspense>;
}

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = (await searchParams).next;
  const returnTo = typeof next === "string" && /^\/buku\/[a-z0-9-]+$/.test(next) ? next : undefined;
  const session = await getSession();
  if (session) redirect(returnTo || (session.user.role === "admin" ? "/admin" : "/pustakaku"));
  return <AuthForm mode="masuk" returnTo={returnTo} />;
}
