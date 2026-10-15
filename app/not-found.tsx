import Link from "next/link";

export default function NotFound() {
  return <main id="main" className="not-found-page container" tabIndex={-1}><h1>Halaman tidak ditemukan.</h1><Link className="button button-primary" href="/">Kembali ke Pustaka</Link></main>;
}
