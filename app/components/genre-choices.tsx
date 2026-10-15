"use client";

import { Check, Plus } from "lucide-react";

export function GenreChoices({ genres, chosen, onChange }: {
  genres: { id: string; name: string }[];
  chosen: string[];
  onChange: (ids: string[]) => void;
}) {
  return <div className="genre-grid">
    {genres.map((genre) => <label className="genre-choice" key={genre.id}>
      <input type="checkbox" name="genres" value={genre.id} checked={chosen.includes(genre.id)} onChange={(event) => onChange(event.target.checked ? [...chosen, genre.id] : chosen.filter((id) => id !== genre.id))} />
      <span className="genre-choice-body"><strong>{genre.name}</strong><span className="genre-check" aria-hidden="true">{chosen.includes(genre.id) ? <Check size={16} /> : <Plus size={16} />}</span></span>
    </label>)}
  </div>;
}
