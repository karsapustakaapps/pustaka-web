import type { Metadata } from "next";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { genres, userGenres } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { GenreForm } from "./genre-form";

export const metadata: Metadata = { title: "Pilih minat bacaan — Pustaka" };
export default function InterestsPage() {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka Pustaka…</p>}><InterestsContent /></Suspense>;
}

async function InterestsContent() {
  const user = await requireUser();
  const available = await db.select().from(genres).all();
  const chosen = await db.select().from(userGenres).where(eq(userGenres.userId, user.id)).all();
  return <section className="interests-panel">
    <div className="auth-heading">
      <h1>Minat bacaan</h1>
    </div>
    <GenreForm key={chosen.map((genre) => genre.genreId).join(",")} genres={available} selected={chosen.map((genre) => genre.genreId)} />
  </section>;
}
