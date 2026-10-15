"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { GenreChoices } from "@/app/components/genre-choices";
import { updateProfile } from "./actions";

export function ProfileForm({ profile, genres, selected }: {
  profile: { name: string; username: string; publicHistory: boolean };
  genres: { id: string; name: string }[];
  selected: string[];
}) {
  const [chosen, setChosen] = useState(selected);
  const [state, action, pending] = useActionState(updateProfile, { error: "" });
  return <form className="profile-edit-form" action={action} onReset={(event) => event.preventDefault()}>
    <fieldset disabled={pending}>
      <legend className="sr-only">Profil pembaca</legend>
      <div className="form-field"><label htmlFor="profile-name">Nama lengkap</label><input id="profile-name" name="name" autoComplete="name" defaultValue={profile.name} minLength={2} maxLength={100} required /></div>
      <div className="form-field"><label htmlFor="profile-username">Username</label><input id="profile-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} defaultValue={profile.username} minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" aria-describedby="profile-username-hint" required /><p className="field-hint" id="profile-username-hint">3–30 karakter: huruf, angka, atau garis bawah. Mengubah username juga mengubah alamat profil.</p></div>
      <fieldset className="profile-genre-fieldset"><legend>Minat baca</legend><GenreChoices genres={genres} chosen={chosen} onChange={setChosen} /></fieldset>
      <label className="profile-visibility"><input type="checkbox" name="publicHistory" defaultChecked={profile.publicHistory} /><span>Tampilkan riwayat di profil publik<span>Ulasan dan penilaian di halaman buku tetap bersifat publik.</span></span></label>
    </fieldset>
    {state.error && <p className="form-error" role="alert">{state.error}</p>}
    <div className="profile-form-actions"><button className="button button-primary" type="submit" disabled={pending || !chosen.length}>{pending && <LoaderCircle className="loading-icon" size={18} aria-hidden="true" />}{pending ? "Menyimpan…" : "Simpan perubahan"}</button><Link className="button button-secondary" href={`/${profile.username}`}>Batal</Link></div>
  </form>;
}
