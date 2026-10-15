"use client";

import { useActionState } from "react";
import { readingStatusLabels } from "@/lib/reading-options";
import { saveEntry } from "./actions";
import { LoaderCircle, Star } from "lucide-react";

export function ReadingForm({ bookId, initial }: { bookId: string; initial?: { status: keyof typeof readingStatusLabels; rating: number | null; comment: string } }) {
  const [state, action, pending] = useActionState(saveEntry.bind(null, bookId), { error: "", message: "" });
  // Keep the saved editor values when React resets a successful action form.
  return <form action={action} onReset={(event) => event.preventDefault()} className="reading-form" aria-label="Catatan bacaanmu">
    <h2>Catatan baca</h2>
    <div className="form-field">
      <label htmlFor={`reading-status-${bookId}`}>Status baca</label>
      <select id={`reading-status-${bookId}`} name="status" defaultValue={initial?.status || "want_to_read"} disabled={pending}>
        {Object.entries(readingStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
      </select>
    </div>
    <fieldset className="star-picker" disabled={pending}>
      <legend>Penilaianmu</legend>
      <div className="star-options">
        {[1, 2, 3, 4, 5].map((value) => <label key={value}>
          <input type="radio" name="rating" value={value} defaultChecked={initial?.rating === value} aria-label={`${value} bintang`} />
          <Star size={32} aria-hidden="true" />
        </label>)}
      </div>
      <label className="no-rating"><input type="radio" name="rating" value="0" defaultChecked={!initial?.rating} /> Tanpa nilai</label>
    </fieldset>
    <div className="form-field">
      <label htmlFor={`reading-comment-${bookId}`}>Ulasanmu <span className="optional-label">(opsional)</span></label>
      <textarea id={`reading-comment-${bookId}`} name="comment" rows={4} maxLength={2000} defaultValue={initial?.comment || ""} placeholder="Apa yang berkesan dari buku ini?" disabled={pending} aria-describedby={`review-hint-${bookId}`} />
      <p id={`review-hint-${bookId}`} className="field-hint">Maks. 2.000 karakter. Ulasan dan penilaian bersifat publik.</p>
    </div>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    {!pending && state.message && <p className="form-success" role="status">{state.message}</p>}
    <button className="button button-primary" type="submit" disabled={pending}>{pending && <LoaderCircle className="loading-icon" size={18} aria-hidden="true" />}{pending ? "Menyimpan…" : "Simpan"}</button>
  </form>;
}
