"use client";

import { useOptimistic, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search } from "lucide-react";

type Filters = { query: string; genre: string; sort: string };

export function CatalogFilters({ query, genre, sort, genres }: Filters & { genres: { id: string; name: string }[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useOptimistic({ query, genre, sort });

  function search(next: Filters) {
    const params = new URLSearchParams();
    if (next.query) params.set("q", next.query);
    if (next.genre) params.set("genre", next.genre);
    if (next.sort !== "rating") params.set("sort", next.sort);
    startTransition(() => {
      setFilters(next);
      router.replace(`/buku${params.size ? `?${params}` : ""}`, { scroll: false });
    });
  }

  return <form action="/buku" method="get" className="catalog-filters" role="search" aria-label="Cari dan saring buku" aria-busy={pending} onSubmit={(event) => { event.preventDefault(); search(filters); }}>
    <div className="catalog-field catalog-search">
      <label htmlFor="book-query">Cari judul atau penulis</label>
      <div className="catalog-search-input"><Search size={20} aria-hidden="true" /><input id="book-query" name="q" type="search" placeholder="Judul buku atau nama penulis" value={filters.query} maxLength={120} onChange={(event) => search({ ...filters, query: event.target.value })} /></div>
    </div>
    <div className="catalog-field"><label htmlFor="book-genre">Genre</label><select id="book-genre" name="genre" value={filters.genre} onChange={(event) => search({ ...filters, genre: event.target.value })}><option value="">Semua genre</option>{genres.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
    <div className="catalog-field"><label htmlFor="book-sort">Urutkan</label><select id="book-sort" name="sort" value={filters.sort} onChange={(event) => search({ ...filters, sort: event.target.value })}><option value="rating">Rating tertinggi</option><option value="ratings">Penilaian terbanyak</option></select></div>
    <button className="button button-primary" type="submit">{pending ? <LoaderCircle className="loading-icon" size={18} aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}Cari</button>
    <span className="sr-only" role="status">{pending ? "Mencari buku…" : ""}</span>
  </form>;
}
