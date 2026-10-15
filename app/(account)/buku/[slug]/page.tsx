import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { books, bookGenres, genres, readingEntries } from "@/db/schema";
import { getSession } from "@/lib/session";
import { getBookRating, getBookReviews } from "@/lib/reading";
import { readingStatusLabels } from "@/lib/reading-options";
import { Stars } from "@/app/components/stars";
import { ReadingForm } from "./reading-form";
import { ArrowLeft, ExternalLink, Star } from "lucide-react";

export const metadata: Metadata = { title: "Buku dan ulasan — Pustaka" };
export default function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka buku…</p>}><BookContent params={params} /></Suspense>;
}

async function BookContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await db.select().from(books).where(eq(books.id, slug)).get();
  if (!book) notFound();
  const session = await getSession();
  const rating = await getBookRating(slug);
  const reviews = await getBookReviews(slug);
  const tags = await db.select({ name: genres.name }).from(genres).innerJoin(bookGenres, eq(bookGenres.genreId, genres.id)).where(eq(bookGenres.bookId, slug)).all();
  const entry = session ? await db.select().from(readingEntries).where(and(eq(readingEntries.bookId, slug), eq(readingEntries.userId, session.user.id))).get() : undefined;
  return <div className="book-page container">
    <Link className="text-link" href="/buku"><ArrowLeft size={16} aria-hidden="true" />Jelajahi buku</Link>
    <section className="book-detail" aria-labelledby="book-title">
      <Image className="detail-cover" src={book.cover} alt={`Sampul buku ${book.title}`} width={300} height={469} sizes="(max-width:600px) 160px, 260px" />
      <div className="detail-copy">
        <div className="interest-tags">{tags.map((tag) => <span key={tag.name}>{tag.name}</span>)}</div>
        <h1 id="book-title">{book.title}</h1><p className="detail-author">{book.author}</p>
        <div className="book-rating-summary" aria-label="Penilaian pembaca"><Star size={21} fill="currentColor" aria-hidden="true" /><strong>{rating.average ? Number(rating.average).toLocaleString("id-ID", { maximumFractionDigits: 1 }) : "—"}</strong><span>{rating.count ? `${rating.count} penilaian` : "Belum ada penilaian"}</span></div>
        <p className="detail-description">{book.description}</p>
        <a className="button button-primary" href={`https://www.gutenberg.org/ebooks/${book.gutenbergId}`} target="_blank" rel="noopener noreferrer" aria-label="Baca buku di Project Gutenberg (bahasa Inggris, tab baru)">Baca buku <ExternalLink size={17} aria-hidden="true" /></a>
        <p className="field-hint">Edisi Inggris gratis · Project Gutenberg</p>
      </div>
    </section>
    <div className="book-community">
      <section className="reviews-section" aria-labelledby="reviews-heading">
        <h2 id="reviews-heading">Ulasan</h2>
        {reviews.length ? <div className="reviews-list">{reviews.map((review) => <article className="reader-review" key={review.userId}>
          <div className="review-meta"><strong><Link className="text-link" href={`/${review.username}`}>{review.name}</Link></strong><span>{readingStatusLabels[review.status]}</span></div>
          {review.rating && <Stars value={review.rating} />}
          <p className="review-text">{review.comment}</p>
        </article>)}</div> : <div className="empty-notes">Belum ada ulasan.</div>}
      </section>
      <aside className="reading-card">
        {session ? <ReadingForm key={`${slug}-${session.user.id}`} bookId={slug} initial={entry} /> : <div className="signin-to-review"><h2>Penilaianmu</h2><Link className="button button-primary" href={`/masuk?next=/buku/${slug}`}>Masuk untuk menilai</Link></div>}
      </aside>
    </div>
  </div>;
}
