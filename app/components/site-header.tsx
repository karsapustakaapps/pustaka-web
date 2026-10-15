import Link from "next/link";
import { Brand } from "./brand";
import { AccountNav } from "./account-nav";

export function SiteHeader() {
  return <>
    <a className="skip-link" href="#main">Langsung ke konten</a>
    <header className="site-header">
      <div className="container nav-inner">
        <Brand />
        <nav className="main-nav" aria-label="Navigasi utama">
          <Link href="/">Beranda</Link>
          <Link href="/buku">Jelajahi buku</Link>
          <Link href="/#how-it-works">Cara kerja</Link>
        </nav>
        <AccountNav />
      </div>
    </header>
  </>;
}
