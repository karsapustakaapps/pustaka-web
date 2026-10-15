import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { catalogPageSize, getCatalog } from "@/lib/catalog";
import { CatalogFilters } from "./catalog-filters";
import "./catalog.css";

export const metadata: Metadata = {
  title: "Jelajahi buku — Pustaka",
  description: "Cari buku berdasarkan judul atau penulis, pilih genre, dan temukan buku dengan penilaian pembaca tertinggi.",
};

type CatalogProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default function CatalogPage({ searchParams }: CatalogProps) {
  return <>
    <main id="main" className="container catalog-page" tabIndex={-1}>
      <h1>Jelajahi buku</h1>
      <Suspense fallback={<p className="catalog-loading" role="status">Memuat buku…</p>}>
        <CatalogContent searchParams={searchParams} />
      </Suspense>
    </main>
    <footer className="site-footer"><div className="container footer-bottom"><span>© 2026 Pustaka</span><Link href="/">Beranda</Link></div></footer>
  </>;
}

async function CatalogContent({ searchParams }: CatalogProps) {
  const params = await searchParams;
  const { books, genres, query, genre, sort, total, page, pages } = await getCatalog(params);
  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (genre) params.set("genre", genre);
    if (sort !== "rating") params.set("sort", sort);
    if (target > 1) params.set("page", String(target));
    return `/buku${params.size ? `?${params}` : ""}`;
  }
  const pageNumbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((number) => number >= 1 && number <= pages).sort((a, b) => a - b);

  return <>
    <CatalogFilters query={typeof params.q === "string" ? params.q.slice(0, 120) : ""} genre={genre} sort={sort} genres={genres} />
    <div className="catalog-summary">
      <p role="status">{total ? `${(page - 1) * catalogPageSize + 1}–${Math.min(page * catalogPageSize, total)} dari ${total} buku` : "0 buku"}{query && <> untuk <strong>“{query}”</strong></>}{genre && <> · {genres.find((item) => item.id === genre)?.name}</>}</p>
      {(query || genre || sort !== "rating") && <Link className="catalog-reset" href="/buku">Atur ulang</Link>}
    </div>
    {total ? <>
      <ul className="book-grid catalog-grid" aria-label="Hasil pencarian buku">
        {books.map((book) => <li key={book.id}>
          <Link className="book-card" href={`/buku/${book.id}`}>
            <span className="book-cover"><Image src={book.cover} alt={`Sampul buku ${book.title}`} width={320} height={500} sizes="(max-width: 600px) 44vw, (max-width: 900px) 28vw, (max-width: 1100px) 21vw, 175px" /><span className="cover-action">Lihat buku<ArrowRight size={16} aria-hidden="true" /></span></span>
            <span className="book-title">{book.title}</span>
            <span className="book-author">{book.author}</span>
            <span className={`catalog-rating${book.ratings ? "" : " catalog-unrated"}`}>
              <Star size={14} fill={book.ratings ? "currentColor" : "none"} aria-hidden="true" />
              {book.ratings ? <><strong>{Number(book.average).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}<span className="sr-only"> dari 5 bintang</span></strong><span>({book.ratings}<span className="sr-only"> penilaian</span>)</span></> : "Belum dinilai"}
            </span>
          </Link>
        </li>)}
      </ul>
      <div className="catalog-pagination">
        <p>Halaman {page} dari {pages}</p>
        <nav aria-label="Halaman koleksi buku">
          {page > 1 ? <Link className="page-direction" href={pageHref(page - 1)} aria-label="Halaman sebelumnya"><ChevronLeft size={18} aria-hidden="true" /><span>Sebelumnya</span></Link> : <button className="page-direction" type="button" disabled aria-label="Halaman sebelumnya"><ChevronLeft size={18} aria-hidden="true" /><span>Sebelumnya</span></button>}
          {pageNumbers.map((number, index) => <span className="page-number-group" key={number}>
            {index > 0 && number - pageNumbers[index - 1] > 1 && <span className="pagination-gap">…</span>}
            <Link className="page-number" href={pageHref(number)} aria-label={`Halaman ${number}`} aria-current={number === page ? "page" : undefined}>{number}</Link>
          </span>)}
          {page < pages ? <Link className="page-direction" href={pageHref(page + 1)} aria-label="Halaman berikutnya"><span>Berikutnya</span><ChevronRight size={18} aria-hidden="true" /></Link> : <button className="page-direction" type="button" disabled aria-label="Halaman berikutnya"><span>Berikutnya</span><ChevronRight size={18} aria-hidden="true" /></button>}
        </nav>
      </div>
    </> : <div className="catalog-empty"><BookOpen size={32} aria-hidden="true" /><h2>{query || genre ? "Buku tidak ditemukan" : "Belum ada buku"}</h2><p>{query || genre ? "Coba judul atau penulis lain, atau pilih semua genre." : "Koleksi buku akan tampil di sini."}</p>{(query || genre) && <Link className="button button-secondary" href="/buku">Lihat semua buku</Link>}</div>}
  </>;
}
