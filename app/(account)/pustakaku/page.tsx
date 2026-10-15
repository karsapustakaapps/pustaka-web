import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Pustakaku — Pustaka" };
export default function MyLibraryPage() {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka profil…</p>}><MyLibraryContent /></Suspense>;
}

async function MyLibraryContent() {
  const user = await requireUser();
  if (!user.onboardingCompleted) redirect("/minat");
  return redirect(`/${user.username}`);
}
