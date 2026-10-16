"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Trash2 } from "lucide-react";
import { GenreChoices } from "@/app/components/genre-choices";
import { saveBookAction, deleteBookAction } from "./actions";

export function BookForm({ book, genres, selected = [] }: {
  book?: { id: string; title: string; author: string; cover: string; description: string; gutenbergId: number };
  genres: { id: string; name: string }[];
  selected?: string[];
}) {
  const [chosen, setChosen] = useState(selected);
  const [state, action, pending] = useActionState(saveBookAction.bind(null, book?.id ?? null), { error: "" });
  const [deletion, deleteAction, deleting] = useActionState(deleteBookAction.bind(null, book?.id ?? ""), { error: "" });
  const [confirmed, setConfirmed] = useState(false);
  return <>
    <form className="profile-edit-form" action={action} onReset={(event) => event.preventDefault()}>
      <fieldset disabled={pending || deleting}>
        <legend className="sr-only">Data buku</legend>
        <div className="form-field"><label htmlFor="book-title">Judul buku</label><input id="book-title" name="title" defaultValue={book?.title} maxLength={200} required /></div>
        <div className="form-field"><label htmlFor="book-author">Penulis</label><input id="book-author" name="author" defaultValue={book?.author} maxLength={200} required /></div>
        <div className="form-field"><label htmlFor="book-cover">Alamat sampul</label><input id="book-cover" name="cover" defaultValue={book?.cover} maxLength={2048} aria-describedby="book-cover-hint" required /><p className="field-hint" id="book-cover-hint">URL HTTPS gambar atau alamat sampul yang tersedia, misalnya /books/pride-and-prejudice.jpg.</p></div>
        <div className="form-field"><label htmlFor="book-description">Deskripsi</label><textarea id="book-description" name="description" defaultValue={book?.description} rows={6} maxLength={10000} required /></div>
        <div className="form-field"><label htmlFor="book-gutenberg">ID Project Gutenberg</label><input id="book-gutenberg" name="gutenbergId" type="number" min={1} max={2147483647} step={1} defaultValue={book?.gutenbergId} aria-describedby="book-gutenberg-hint" required /><p className="field-hint" id="book-gutenberg-hint">Angka pada tautan edisi lengkap, misalnya 1342 untuk gutenberg.org/ebooks/1342.</p></div>
        <fieldset className="profile-genre-fieldset"><legend>Genre buku</legend><GenreChoices genres={genres} chosen={chosen} onChange={setChosen} />{!genres.length && <p className="empty-notes">Belum ada genre yang tersedia.</p>}</fieldset>
      </fieldset>
      {state.error && <p className="form-error" role="alert">{state.error}</p>}
      <div className="profile-form-actions"><button className="button button-primary" type="submit" disabled={pending || deleting || !chosen.length}>{pending && <LoaderCircle className="loading-icon" size={18} aria-hidden="true" />}{pending ? "Menyimpan…" : book ? "Simpan perubahan" : "Tambah buku"}</button><Link className="button button-secondary" href="/admin#admin-catalog">Batal</Link></div>
    </form>
    {book && <details className="admin-delete-book">
      <summary>Hapus buku</summary>
      <form action={deleteAction}>
        <fieldset disabled={pending || deleting}>
          <legend className="sr-only">Konfirmasi penghapusan</legend>
          <p id="delete-book-warning">Buku “{book.title}” beserta seluruh catatan baca, penilaian, dan ulasannya akan dihapus permanen.</p>
          <label className="profile-visibility"><input type="checkbox" name="confirmDelete" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} aria-describedby="delete-book-warning" required /><span>Saya memahami dan ingin menghapus buku ini.</span></label>
          <button className="button button-primary" type="submit" disabled={!confirmed || pending || deleting}>{deleting ? <LoaderCircle className="loading-icon" size={18} aria-hidden="true" /> : <Trash2 size={17} aria-hidden="true" />}{deleting ? "Menghapus…" : "Hapus buku"}</button>
        </fieldset>
        {deletion.error && <p className="form-error" role="alert">{deletion.error}</p>}
      </form>
    </details>}
  </>;
}
