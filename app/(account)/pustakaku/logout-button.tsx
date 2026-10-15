"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { LoaderCircle, LogOut } from "lucide-react";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <div className="logout-control">
    <button className="button button-secondary" disabled={pending} onClick={async () => {
      setPending(true);
      try {
        const result = await authClient.signOut();
        if (result.error) throw new Error("signout");
        router.replace("/");
        router.refresh();
      } catch {
        setError("Belum berhasil keluar. Coba lagi.");
        setPending(false);
      }
    }}>{pending ? <LoaderCircle className="loading-icon" size={16} aria-hidden="true" /> : <LogOut size={16} aria-hidden="true" />}{pending ? "Keluar…" : "Keluar"}</button>
    {error && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
