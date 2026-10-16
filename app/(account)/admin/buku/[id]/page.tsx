import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { books, bookGenres, genres } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { BookForm } from "../book-form";

export const metadata: Metadata = { title: "Kelola buku — Pustaka" };

export default function AdminBookPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka formulir buku…</p>}><AdminBookContent params={params} /></Suspense>;
}

async function AdminBookContent({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const book = id === "baru" ? undefined : await db.select().from(books).where(eq(books.id, id)).get();
  if (id !== "baru" && !book) notFound();
  const available = await db.select({ id: genres.id, name: genres.name }).from(genres).orderBy(genres.name).all();
  const selected = book ? await db.select({ id: bookGenres.genreId }).from(bookGenres).where(eq(bookGenres.bookId, book.id)).all() : [];
  return <div className="profile-edit-panel">
    <Link className="text-link" href="/admin#admin-catalog"><ArrowLeft size={16} aria-hidden="true" />Koleksi buku</Link>
    <h1>{book ? "Edit buku" : "Tambah buku"}</h1>
    <BookForm key={id} book={book} genres={available} selected={selected.map((genre) => genre.id)} />
  </div>;
}
