"use client";

import Link from "next/link";
import { LoaderCircle, UserRound } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function AccountNav() {
  const { data: session, isPending } = authClient.useSession();
  return <div className="nav-account-actions">
    {isPending ? <span className="nav-profile" role="status" aria-label="Memuat akun"><LoaderCircle className="loading-icon" size={20} aria-hidden="true" /></span> : session ? <>
      {session.user.role === "admin" && <Link className="button button-secondary nav-cta" href="/admin">Admin</Link>}
      <Link className="button button-secondary nav-profile" href="/pustakaku" aria-label="Profil saya" title="Profil saya"><UserRound size={20} aria-hidden="true" /></Link>
    </> : <>
      <Link className="button button-primary nav-cta" href="/masuk">Masuk</Link>
      <Link className="button button-secondary nav-cta" href="/daftar">Daftar</Link>
    </>}
  </div>;
}
