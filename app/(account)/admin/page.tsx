import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { avg, count, desc, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { books, readingEntries, user } from "@/db/schema";
import { requireAdmin } from "@/lib/session";
import { readingStatusLabels } from "@/lib/reading-options";
import { Stars } from "@/app/components/stars";
import { LogoutButton } from "../pustakaku/logout-button";
import { ChevronRight } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Pustaka" };
export default function AdminPage() {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka dasbor…</p>}><AdminContent /></Suspense>;
}

async function AdminContent() {
  await requireAdmin();
  const catalog = await db.select({ id: books.id, title: books.title, author: books.author, average: avg(readingEntries.rating), ratings: count(readingEntries.rating) })
    .from(books).leftJoin(readingEntries, eq(readingEntries.bookId, books.id)).groupBy(books.id).orderBy(books.title).all();
  const readers = await db.select({ id: user.id, name: user.name, email: user.email, role: user.role }).from(user).orderBy(desc(user.createdAt)).limit(20).all();
  const readerCount = (await db.select({ value: count() }).from(user).where(eq(user.role, "reader")).get())!.value;
  const activity = (await db.select({ entries: count(), ratings: count(readingEntries.rating) }).from(readingEntries).get())!;
  const reviews = await db.select({ userId: user.id, name: user.name, bookId: books.id, title: books.title, rating: readingEntries.rating, status: readingEntries.status, comment: readingEntries.comment })
    .from(readingEntries).innerJoin(user, eq(user.id, readingEntries.userId)).innerJoin(books, eq(books.id, readingEntries.bookId))
    .where(ne(readingEntries.comment, "")).orderBy(desc(readingEntries.updatedAt)).limit(20).all();
  return <div className="admin-panel container">
    <div className="library-welcome"><h1>Admin</h1><LogoutButton /></div>
    <nav className="admin-nav" aria-label="Navigasi admin"><a href="#admin-catalog">Koleksi buku</a><a href="#admin-readers">Pembaca</a><a href="#admin-reviews">Ulasan</a><Link href="/pustakaku">Pustakaku <ChevronRight size={16} aria-hidden="true" /></Link></nav>
    <div className="admin-metrics">
      {[ ["Buku", catalog.length], ["Pembaca", readerCount], ["Catatan baca", activity.entries], ["Penilaian", activity.ratings] ].map(([label, value]) => <div key={label} className="admin-metric"><span>{label}</span><strong>{value}</strong></div>)}
    </div>
    <section className="admin-section" id="admin-catalog"><h2>Koleksi buku</h2>
      <div className="table-scroll"><table className="admin-table"><caption className="sr-only">Koleksi buku dan rata-rata penilaian</caption><thead><tr><th scope="col">Judul buku</th><th scope="col">Penulis</th><th scope="col">Rata-rata</th><th scope="col">Penilaian</th></tr></thead><tbody>{catalog.map((book) => <tr key={book.id}><th scope="row"><Link href={`/buku/${book.id}`}>{book.title}<ChevronRight size={16} aria-hidden="true" /></Link></th><td>{book.author}</td><td>{book.average ? `${Number(book.average).toLocaleString("id-ID", { maximumFractionDigits: 1 })} / 5` : "—"}</td><td>{book.ratings}</td></tr>)}</tbody></table></div>
    </section>
    <section className="admin-section" id="admin-readers"><h2>Akun terbaru</h2>
      <div className="table-scroll"><table className="admin-table"><caption className="sr-only">Akun dan peran pengguna</caption><thead><tr><th scope="col">Nama</th><th scope="col">Email</th><th scope="col">Peran</th></tr></thead><tbody>{readers.map((reader) => <tr key={reader.id}><th scope="row">{reader.name}</th><td>{reader.email}</td><td><span className="role-badge">{reader.role === "admin" ? "Admin" : "Pembaca"}</span></td></tr>)}</tbody></table></div>
    </section>
    <section className="admin-section" id="admin-reviews"><h2>Ulasan terbaru</h2>
      {reviews.length ? <div className="admin-reviews">{reviews.map((review) => <article className="reader-review" key={`${review.userId}-${review.bookId}`}><div className="review-meta"><strong>{review.name}</strong><span>{readingStatusLabels[review.status]}</span></div><Link className="text-link" href={`/buku/${review.bookId}`}>{review.title}<ChevronRight size={16} aria-hidden="true" /></Link>{review.rating && <Stars value={review.rating} />}<p className="review-text">{review.comment}</p></article>)}</div> : <p className="empty-notes">Belum ada ulasan.</p>}
    </section>
  </div>;
}
