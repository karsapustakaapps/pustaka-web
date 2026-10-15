"use client";

import Image from "next/image";
import { ArrowRight, ArrowUp, Bookmark, ExternalLink, Pause, Play, Star, X } from "lucide-react";
import Link from "next/link";
import Lenis from "lenis";
import { motion, MotionConfig, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import prideCover from "@/public/books/pride-and-prejudice.jpg";
import gatsbyCover from "@/public/books/the-great-gatsby.jpg";
import littleWomenCover from "@/public/books/little-women.jpg";
import dorianCover from "@/public/books/dorian-gray.jpg";
import janeEyreCover from "@/public/books/jane-eyre.jpg";
import metamorphosisCover from "@/public/books/metamorphosis.jpg";
import emmaCover from "@/public/books/emma.jpg";
import { initialBooks } from "@/lib/catalog-data";
import { Brand } from "@/app/components/brand";

const coverImages = {
  "pride-and-prejudice": prideCover,
  "the-great-gatsby": gatsbyCover,
  "little-women": littleWomenCover,
  "dorian-gray": dorianCover,
  "jane-eyre": janeEyreCover,
  "metamorphosis": metamorphosisCover,
};
const books = initialBooks.map((book) => ({ ...book, cover: coverImages[book.slug] }));

const heroBooks = [
  books[3],
  books[2],
  books[4],
  books[0],
  books[1],
  books[5],
  { slug: "emma", title: "Emma", cover: emmaCover },
];

export default function Home() {
  const [selectedBook, setSelectedBook] = useState<
    (typeof books)[number] | null
  >(null);
  const [marqueePaused, setMarqueePaused] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      autoToggle: true,
      anchors: { offset: -100 },
    });
    return () => lenis.destroy();
  }, []);

  useEffect(() => {
    if (selectedBook) dialog.current?.showModal();
    else dialog.current?.close();
  }, [selectedBook]);

  const reveal = {
    initial: { y: reducedMotion ? 0 : 24 },
    whileInView: { y: 0 },
    viewport: { once: true, amount: 0.15 },
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  };

  return (
    <MotionConfig reducedMotion="user">
      <main id="main" tabIndex={-1}>
        <section className="hero" id="top" aria-labelledby="hero-heading">
          <motion.div className="container hero-copy" {...reveal}>
            <h1 id="hero-heading">
              Platform Literasi Digital Indonesia
            </h1>
            <p className="hero-features">
              Tracking, Rating, Review Buku, &amp; Pelatihan Literasi
            </p>
            <p className="hero-description">
              Ubah kebiasaan membaca menjadi gaya hidup digital yang seru, terarah, dan interaktif literasi generasi muda.
            </p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/daftar">
                Daftar Sekarang <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          </motion.div>
          <div
            className="book-marquee"
            role="region"
            aria-label="Koleksi buku klasik"
          >
            <div className="marquee-track" data-paused={marqueePaused}>
              {[0, 1, 2].map((copy) => (
                <div
                  className="marquee-group"
                  key={copy}
                  aria-hidden={copy > 0}
                >
                  {heroBooks.map((book) => (
                    <div className="marquee-book" key={book.slug}>
                      <Image
                        src={book.cover}
                        alt={copy === 0 ? `Sampul buku ${book.title}` : ""}
                        width={320}
                        height={500}
                        sizes="(max-width: 600px) 156px, (max-width: 1530px) 17vw, 260px"
                        loading="eager"
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <button
              className="marquee-control"
              aria-label={
                marqueePaused ? "Lanjutkan gerakan buku" : "Jeda gerakan buku"
              }
              aria-pressed={marqueePaused}
              onClick={() => setMarqueePaused(!marqueePaused)}
            >
              {marqueePaused ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
            </button>
          </div>
        </section>

        <section
          className="how-section section container"
          id="how-it-works"
          aria-labelledby="how-heading"
        >
          <motion.div className="section-heading" {...reveal}>
            <h2 id="how-heading">Cara kerja</h2>
          </motion.div>
          <div className="feature-grid">
            <motion.article className="feature-card" {...reveal}>
              <h3>Koleksi</h3>
              <p>
                Simpan buku yang ingin atau sedang kamu baca.
              </p>
              <div className="mini-library" aria-hidden="true">
                <div className="mini-library-heading">
                  <span>Koleksi bukuku</span>
                  <Bookmark size={20} aria-hidden="true" />
                </div>
                {books.slice(0, 3).map((book, index) => (
                  <div className="mini-library-row" key={book.slug}>
                    <Image src={book.cover} alt="" width={32} height={48} />
                    <div>
                      <strong>{book.title}</strong>
                      <span>{book.author}</span>
                    </div>
                    <span className="library-index">0{index + 1}</span>
                  </div>
                ))}
              </div>
            </motion.article>
            <motion.article className="feature-card" {...reveal}>
              <h3>Baca</h3>
              <p>
                Pratinjau buku sebelum mulai membaca.
              </p>
              <div className="mini-reader">
                <span className="reader-toolbar">
                  <span>{books[0].title}</span>
                </span>
                <span className="reader-chapter">Bab satu</span>
                <span className="reader-text">{books[0].excerpt}</span>
                <span className="reader-bottom">
                  <button
                    className="reader-preview-button"
                    onClick={() => setSelectedBook(books[0])}
                    aria-label="Buka pratinjau bacaan Pride and Prejudice"
                  >
                    Buka cuplikan <ArrowRight size={20} aria-hidden="true" />
                  </button>
                </span>
              </div>
            </motion.article>
            <motion.article className="feature-card" {...reveal}>
              <h3>Nilai dan ulas</h3>
              <p>
                Beri bintang dan tulis ulasan untuk setiap buku.
              </p>
              <div className="mini-rating">
                <div className="rating-book">
                  <Image
                    src={gatsbyCover}
                    alt="Sampul buku The Great Gatsby"
                    width={46}
                    height={70}
                  />
                  <div>
                    <strong>The Great Gatsby</strong>
                    <span>F. Scott Fitzgerald</span>
                  </div>
                </div>
                <Link
                  className="rating-stars"
                  href="/buku/the-great-gatsby"
                  aria-label="Beri penilaian untuk The Great Gatsby"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <span className="rating-star" key={value}>
                      <Star size={20} aria-hidden="true" />
                    </span>
                  ))}
                </Link>
              </div>
            </motion.article>
          </div>
        </section>

      </main>

      <footer className="site-footer">
        <div className="container footer-main">
          <div>
            <Brand />
          </div>
          <nav aria-label="Navigasi bagian bawah">
            <Link href="/buku">Jelajahi buku</Link>
            <a href="#how-it-works">Cara kerja</a>
          </nav>
          <a className="footer-back" href="#top">
            Kembali ke atas <ArrowUp size={16} aria-hidden="true" />
          </a>
        </div>
        <div className="container footer-bottom">
          <span>© 2026 Pustaka</span>
        </div>
      </footer>

      <dialog
        ref={dialog}
        className="book-dialog"
        aria-labelledby="preview-title"
        onClose={() => {
          setSelectedBook(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        data-lenis-prevent
      >
        {selectedBook && (
          <div className="dialog-content">
            <button
              className="dialog-close"
              aria-label="Tutup pratinjau buku"
              onClick={() => dialog.current?.close()}
            >
              <X size={20} aria-hidden="true" />
            </button>
            <div className="preview-book">
              <Image
                src={selectedBook.cover}
                alt={`Sampul buku ${selectedBook.title}`}
                width={110}
                height={170}
              />
              <div>
                <p className="preview-meta">
                  {selectedBook.category} · {selectedBook.year}
                </p>
                <h2 id="preview-title">{selectedBook.title}</h2>
                <p>{selectedBook.author}</p>
              </div>
            </div>
            <p className="preview-description">{selectedBook.description}</p>
            <Link className="text-link preview-reviews-link" href={`/buku/${selectedBook.slug}`} onClick={() => dialog.current?.close()}>Ulasan pembaca <ArrowRight size={16} aria-hidden="true" /></Link>
            <div className="preview-excerpt">
              <span className="preview-label">Cuplikan pembuka</span>
              <p>{selectedBook.excerpt}</p>
            </div>
            <a
              className="button button-primary"
              href={`https://www.gutenberg.org/ebooks/${selectedBook.gutenberg}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Baca edisi Inggris di Project Gutenberg (tab baru)"
            >
              Baca buku <ExternalLink size={17} aria-hidden="true" />
            </a>
            <p className="preview-note">
              Cuplikan terjemahan. Edisi lengkap berbahasa Inggris di Project Gutenberg.
            </p>
          </div>
        )}
      </dialog>
    </MotionConfig>
  );
}
