"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";

const errorMessages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email atau kata sandi tidak sesuai. Silakan coba lagi.",
  USER_ALREADY_EXISTS: "Email ini sudah terdaftar. Silakan masuk ke akunmu.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Email ini sudah terdaftar. Silakan masuk ke akunmu.",
  PASSWORD_TOO_SHORT: "Kata sandi minimal 8 karakter.",
  PASSWORD_TOO_LONG: "Kata sandi maksimal 128 karakter.",
  INVALID_EMAIL: "Masukkan alamat email yang valid.",
};

export function AuthForm({ mode, returnTo }: { mode: "masuk" | "daftar"; returnTo?: string }) {
  const signup = mode === "daftar";
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    setPending(true);
    setError("");
    const credentials = { email: String(form.get("email")).trim().toLowerCase(), password: String(form.get("password")) };
    if (signup && form.get("passwordConfirmation") !== credentials.password) {
      setError("Konfirmasi kata sandi tidak sama.");
      setPending(false);
      return;
    }
    const signupData = { ...credentials, name: String(form.get("name")).trim(), username: String(form.get("username")).trim().toLowerCase(), phoneNumber: String(form.get("phoneNumber")).trim(), passwordConfirmation: String(form.get("passwordConfirmation")) };
    try {
      const result = signup
        ? await authClient.signUp.email(signupData)
        : await authClient.signIn.email(credentials);
      if (result.error) {
        setError(result.error.status === 429
          ? "Terlalu banyak percobaan. Tunggu satu menit, lalu coba lagi."
          : errorMessages[result.error.code || ""] || (result.error.message?.match(/^(Nama|Username|Nomor|Masukkan|Kata sandi|Konfirmasi)/) ? result.error.message : "Permintaan belum berhasil. Periksa isianmu lalu coba lagi."));
        setPending(false);
        return;
      }
      formElement.reset();
      setShowPassword(false);
      setPending(false);
      router.replace(signup ? "/minat" : returnTo || (result.data?.user.role === "admin" ? "/admin" : "/pustakaku"));
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksimu dan coba lagi.");
      setPending(false);
    }
  }

  return <div className="auth-panel">
    <div className="auth-heading">
      <h1>{signup ? "Daftar" : "Masuk"}</h1>
    </div>
    <form className="auth-form" method="post" onSubmit={submit} aria-label={signup ? "Buat akun Pustaka" : "Masuk ke Pustaka"}>
      {signup && <div className="form-field">
        <label htmlFor={`${mode}-name`}>Nama lengkap</label>
        <input id={`${mode}-name`} name="name" autoComplete="name" placeholder="Nama lengkapmu" minLength={2} maxLength={100} required disabled={pending} />
      </div>}
      {signup && <div className="form-field">
        <label htmlFor="daftar-username">Username</label>
        <input id="daftar-username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="namapembaca" minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" aria-describedby="daftar-username-hint" required disabled={pending} />
        <p className="field-hint" id="daftar-username-hint">3–30 karakter: huruf, angka, atau garis bawah.</p>
      </div>}
      <div className="form-field">
        <label htmlFor={`${mode}-email`}>Alamat email</label>
        <input id={`${mode}-email`} name="email" type="email" autoComplete="email" placeholder="kamu@contoh.com" maxLength={254} required disabled={pending} />
      </div>
      {signup && <div className="form-field">
        <label htmlFor={`${mode}-phoneNumber`}>Nomor telepon</label>
        <input id={`${mode}-phoneNumber`} name="phoneNumber" type="tel" autoComplete="tel" placeholder="08xxxxxxxxxx" pattern="\+?[0-9\s\(\)\-]{8,24}" maxLength={24} required disabled={pending} />
      </div>}
      <div className="form-field">
        <label htmlFor={`${mode}-password`}>Kata sandi</label>
        <div className="password-field">
          <input id={`${mode}-password`} name="password" type={showPassword ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Minimal 8 karakter" : "Kata sandimu"} minLength={signup ? 8 : 1} maxLength={128} required disabled={pending} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"} aria-pressed={showPassword}>{showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}</button>
        </div>
      </div>
      {signup && <div className="form-field">
        <label htmlFor="daftar-passwordConfirmation">Konfirmasi kata sandi</label>
        <input id="daftar-passwordConfirmation" name="passwordConfirmation" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Ulangi kata sandimu" minLength={8} maxLength={128} required disabled={pending} />
      </div>}
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-primary auth-submit" type="submit" disabled={pending}>{pending && <LoaderCircle className="loading-icon" size={18} aria-hidden="true" />}{pending ? "Memproses…" : signup ? "Daftar" : "Masuk"}</button>
    </form>
    <p className="auth-switch">{signup ? "Sudah punya akun?" : "Belum punya akun?"} <Link href={signup ? "/masuk" : "/daftar"}>{signup ? "Masuk" : "Daftar sekarang"}</Link></p>
  </div>;
}
