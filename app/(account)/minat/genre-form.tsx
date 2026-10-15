"use client";

import { useActionState, useState } from "react";
import { saveInterests } from "./actions";
import { LoaderCircle } from "lucide-react";
import { GenreChoices } from "@/app/components/genre-choices";

export function GenreForm({ genres, selected }: { genres: { id: string; name: string; description: string }[]; selected: string[] }) {
  const [chosen, setChosen] = useState(selected);
  const [state, action, pending] = useActionState(saveInterests, { error: "" });
  return <form action={action} className="genre-form">
    <fieldset disabled={pending}>
      <legend className="sr-only">Pilih genre favoritmu</legend>
      <GenreChoices genres={genres} chosen={chosen} onChange={setChosen} />
    </fieldset>
    <p className="genre-count" role="status">{chosen.length ? `${chosen.length} genre dipilih` : "Pilih minimal satu genre."}</p>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <button className="button button-primary" type="submit" disabled={pending || chosen.length === 0}>{pending && <LoaderCircle className="loading-icon" size={18} aria-hidden="true" />}{pending ? "Menyimpan…" : "Simpan"}</button>
  </form>;
}
