import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BookOpen, LockKeyhole, Pencil, UserRound } from "lucide-react";
import { getSession } from "@/lib/session";
import { getProfile } from "@/lib/profiles";
import { readingStatusLabels } from "@/lib/reading-options";
import { Stars } from "@/app/components/stars";
import { LogoutButton } from "../pustakaku/logout-button";

export const metadata: Metadata = { title: "Profil pembaca — Pustaka" };

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  return <Suspense fallback={<p className="account-loading" role="status">Membuka profil…</p>}><ProfileContent params={params} /></Suspense>;
}

async function ProfileContent({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const session = await getSession();
  const profile = await getProfile(username, session?.user.id);
  if (!profile) notFound();
  if (username !== profile.username) redirect(`/${profile.username}`);
  return <div className="profile-panel container">
    <header className="profile-header">
      <div className="profile-identity">
        <div className="profile-avatar" aria-hidden="true"><UserRound size={40} strokeWidth={1.4} /></div>
        <div><h1>{profile.name}</h1><p className="profile-username">@{profile.username}</p></div>
      </div>
      {profile.isOwner && <div className="library-account-actions">
          <Link className="button button-secondary" href="/profil/edit"><Pencil size={15} aria-hidden="true" />Edit profil</Link>
          <LogoutButton />
      </div>}
    </header>
    <section className="profile-interests" aria-labelledby="profile-interests-heading">
      <h2 id="profile-interests-heading">Minat baca</h2>
      {profile.interests.length ? <div className="interest-tags">{profile.interests.map((genre) => <span key={genre.id}>{genre.name}</span>)}</div> : <p className="profile-muted">Belum ada minat baca.</p>}
    </section>
    <section className="profile-activity" aria-labelledby="profile-activity-heading">
      <div className="profile-section-heading"><h2 id="profile-activity-heading">Aktivitas</h2><Link className="text-link" href="/buku"><BookOpen size={16} aria-hidden="true" />Jelajahi buku</Link></div>
      {profile.isOwner && !profile.publicHistory && <p className="profile-privacy"><LockKeyhole size={14} aria-hidden="true" />Riwayat hanya terlihat olehmu.</p>}
      {profile.activity === null ? <p className="empty-notes">Riwayat tidak ditampilkan.</p> : profile.activity.length ? <div className="activity-list">{profile.activity.map((entry) => <article className="activity-entry" key={entry.bookId}>
        <Link className="activity-cover" href={`/buku/${entry.bookId}`} tabIndex={-1} aria-hidden="true"><Image src={entry.cover} alt="" width={72} height={112} sizes="72px" /></Link>
        <div className="activity-copy">
          <div className="activity-title"><h3><Link href={`/buku/${entry.bookId}`}>{entry.title}</Link></h3><time dateTime={entry.updatedAt.toISOString()}>{entry.updatedAt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })}</time></div>
          <p className="activity-author">{entry.author}</p>
          <div className="activity-meta"><span>{readingStatusLabels[entry.status]}</span>{entry.rating && <Stars value={entry.rating} />}</div>
          {entry.comment && <p className="review-text">{entry.comment}</p>}
        </div>
      </article>)}</div> : <p className="empty-notes">Belum ada aktivitas membaca.</p>}
    </section>
  </div>;
}
