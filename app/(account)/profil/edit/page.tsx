import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { genres, user, userGenres } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Edit profil — Pustaka" };

export default function EditProfilePage() {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka profil…</p>}><EditProfileContent /></Suspense>;
}

async function EditProfileContent() {
  const sessionUser = await requireUser();
  const profile = (await db.select({ name: user.name, username: user.username, publicHistory: user.publicHistory })
    .from(user).where(eq(user.id, sessionUser.id)).get())!;
  const available = await db.select({ id: genres.id, name: genres.name }).from(genres).all();
  const selected = (await db.select({ id: userGenres.genreId }).from(userGenres).where(eq(userGenres.userId, sessionUser.id)).all()).map((genre) => genre.id);
  return <section className="profile-edit-panel">
    <Link className="text-link" href={`/${profile.username}`}><ArrowLeft size={16} aria-hidden="true" />Profil</Link>
    <h1>Edit profil</h1>
    <ProfileForm key={`${profile.name}-${profile.username}-${profile.publicHistory}-${selected.join(",")}`} profile={profile} genres={available} selected={selected} />
  </section>;
}
