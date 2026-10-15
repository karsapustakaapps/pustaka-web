# Pustaka — Style Reference
> Library in soft daylight — a reading room where warm cream walls meet dark walnut shelves.

**Theme:** light

**Brand color:** `rgb(62, 39, 18)` / `#3E2712` — walnut brown, matching the supplied Pustaka logo.

Source measurements are normalized; roles and recommendations are interpreted. Font summary lists are independent, not paired by position. HTML examples are reconstructions, not source components.

Pustaka is a literary reading room rendered in soft daylight: a warm cream canvas where walnut brown marks the primary action and anchors the brand. Plus Jakarta Sans is the single typeface for all headings, body text, navigation, forms, and controls. Surfaces are paper-like — warm cream beneath pure white cards with parchment borders and almost no shadow. The whole experience is calm, spacious, and content-led, with book covers and product screenshots doing the visual work that color and ornament don't.

## Bahasa dan teks antarmuka

- Gunakan bahasa Indonesia untuk navigasi, judul, deskripsi, tombol, metadata, teks alternatif gambar, label aksesibilitas, dan pesan interaksi. Tetapkan bahasa dokumen ke `id`.
- Tampilkan judul bagian secara langsung tanpa label kapital, slogan kecil, atau garis dekoratif di atasnya. Jangan tambahkan label seperti “FOR THE LOVE OF READING” atau nomor kategori di atas judul kartu fitur.
- Hero hanya berisi judul besar, deskripsi, CTA, dan marquee buku horizontal. Jangan tambahkan catatan “For curious minds. And just-one-more-chapter people.” atau baris manfaat di bawah buku.
- Gunakan gaya kalimat biasa untuk kategori dan informasi buku. Judul buku, nama penulis, dan nama layanan tetap memakai nama aslinya.
- Setiap halaman fokus pada tugasnya. Gunakan judul langsung seperti “Masuk”, “Daftar”, “Minat bacaan”, “Pustakaku”, dan “Admin”. Hilangkan slogan, sapaan dekoratif, paragraf yang mengulang judul, keterangan implementasi, serta CTA yang berulang.
- Semua halaman memakai navbar yang sama. Isi halaman masuk dan daftar hanya menampilkan judul, formulir, dan tautan antarhalaman akun. Petunjuk tambahan hanya dipakai bila diperlukan untuk validasi atau keputusan pengguna; jangan tambahkan footer slogan.
- Landing page terdiri dari hero, cara kerja, dan footer ringkas. Koleksi, pencarian, filter genre, pengurutan penilaian, dan pagination berada di halaman `/buku`. Jangan tambahkan bagian cerita merek atau CTA penutup yang mengulang isi halaman.
- Cuplikan pratinjau diterjemahkan ke bahasa Indonesia. Jelaskan bahwa edisi lengkap gratis di Project Gutenberg berbahasa Inggris.

## Ikon antarmuka

- Gunakan named imports dari `lucide-react`; jangan membuat SVG ikon manual atau memakai karakter teks untuk panah, bintang, centang, tambah, dan kontrol pemutar. Logo Pustaka tetap memakai aset SVG yang diberikan pengguna.
- Ikon pendamping teks diberi `aria-hidden="true"`. Kontrol yang hanya berisi ikon wajib memiliki nama aksesibel. Gunakan Eye/EyeOff untuk kata sandi, Star untuk penilaian, Check/Plus untuk pilihan genre, dan LoaderCircle untuk proses yang sedang berjalan.
- Ikon navigasi berukuran 16–20px; bintang interaktif 32px dengan area tekan minimal 44px. Pertahankan radio/checkbox native dan indikator fokus keyboard. Ikon membantu tindakan, tanpa menambah hiasan pada setiap label.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Walnut Brown | `#3E2712` | `--color-walnut-brown` | Primary CTA fill, wordmark, supplied arch logo — the brand accent anchoring a warm neutral interface |
| Warm Ink | `#493B2F` | `--color-warm-ink` | Primary body and UI text, icon strokes, default border outlines |
| Warm Cream | `#F8F6F2` | `--color-warm-cream` | Page canvas and section backgrounds — warm off-white that makes white cards feel layered rather than floating |
| Muted Brown | `#7B6D60` | `--color-muted-brown` | Muted helper text, secondary metadata, list dividers, de-emphasized links |
| Parchment | `#ECE5DC` | `--color-parchment` | Card and component borders, subtle dividers between sections and list items |
| Paper White | `#ffffff` | `--color-paper-white` | Card surfaces, button text, input fills — the elevated surface above the gray canvas |
| Deep Ink | `#21170E` | `--color-deep-ink` | Heading text, dark secondary action fill (App Store button), heavy borders on featured headings |

Primary CTA hover: `#2D1C0C`. The logo retains its original cream stroke (`#E6D5C3`) and bronze dot (`#A07855`). Bronze also colors unselected rating stars; cream is used for text selection.

## Brand — Logo

Use the supplied arch mark before the Pustaka wordmark in the header and footer, and on its own as the favicon. Preserve the geometry, proportions, and all three colors. The shared asset is `app/icon.svg`; display it at 40px in the desktop header, 32px in the mobile header, and 34px in the footer.

```svg
<svg class="logo-icon" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M50 12 C32 12 18 26 18 50 L18 84 L38 84 L38 58 C38 52 43 46 50 46 C57 46 62 52 62 58 L62 84 L82 84 L82 50 C82 26 68 12 50 12Z" fill="#3E2712" />
  <path d="M38 46 C38 46 44 28 50 24 C56 28 62 46 62 46" stroke="#E6D5C3" stroke-width="3" stroke-linecap="round" />
  <circle cx="50" cy="18" r="5" fill="#A07855" />
</svg>
```

## Tokens — Typography

### Plus Jakarta Sans — All text · `--font-plus-jakarta-sans`
- **Substitute:** system-ui, -apple-system, Segoe UI, Roboto
- **Weights:** 400, 500, 600, 700
- **Line height:** 1.35–1.60
- **Role:** All headings, body text, navigation, forms, buttons, captions, and previews. Use weight 600 for headings and 400–500 for body and controls. Load normal and italic styles in the root layout with `next/font/google`.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | — | — | 14px | 1.45 | — | `--text-caption` |
| body | — | — | 16px | 1.45 | — | `--text-body` |
| subheading | — | — | 22px | 1.4 | — | `--text-subheading` |
| heading | — | — | 28px | 1.35 | — | `--text-heading` |
| display | Plus Jakarta Sans | 400 | clamp(48px, 7.5vw, 96px) | 1.08 | -3.5px | `--text-display` |

## Tokens — Spacing & Shapes

**Base unit:** 4px

**Density:** comfortable

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 8 | 8px | `--spacing-8` |
| 16 | 16px | `--spacing-16` |
| 20 | 20px | `--spacing-20` |
| 24 | 24px | `--spacing-24` |
| 28 | 28px | `--spacing-28` |
| 40 | 40px | `--spacing-40` |
| 80 | 80px | `--spacing-80` |
| 160 | 160px | `--spacing-160` |
| 180 | 180px | `--spacing-180` |

### Border Radius

| Element | Value |
|---------|-------|
| cards | 8px |
| other | 16px |
| images | 4px |
| hero book covers | 16px |
| buttons | 9999px (fully rounded) |

### Layout

- **Page max-width:** 1200px
- **Section gap:** 80px
- **Card padding:** 20px
- **Element gap:** 20px

## Components

### Primary CTA Button
**Role:** Main conversion action — appears once or twice per section, always brown

Filled #3E2712 background, white text, Plus Jakarta Sans 15px weight 500, 9999px radius, 14px vertical × 28px horizontal padding. Use a Lucide ArrowRight only when it helps communicate navigation; form submit buttons need only their action label. 100% width on mobile, auto on desktop.

All buttons use `--radius-buttons: 9999px`: CTAs, category filters, rating controls, book-preview actions, and dialog close controls. Square icon buttons become circles. Book covers and reading-preview cards retain their image and card radii; place a fully rounded action button inside interactive previews.

### Dark App Store Button
**Role:** Secondary download CTA paired alongside the primary CTA

Filled #21170E background, white text, Plus Jakarta Sans 15px weight 500, 9999px radius, 14px × 28px padding. Apple glyph precedes the two-line label 'Unduh di App Store'.

### Account Navigation Buttons (Masuk / Daftar)
**Role:** Tertiary navigation action in the header

Two fully rounded buttons side by side: “Masuk” uses the walnut primary fill; “Daftar” uses a filled parchment background (#ECE5DC), walnut text, and no contrasting outline. Secondary actions throughout the app use the same fill, with #E2D7C9 on hover. Use compact 42px height on desktop and 40px on mobile. Link to `/masuk` and `/daftar`. Signed-in readers see a 44px circular Lucide UserRound link labeled “Profil saya”, pointing to `/pustakaku` so session and onboarding checks still apply. Only admins see the Admin link.

### Account Forms and Reading Interests

Keep all account copy in Indonesian. Use the same paper background, walnut brown, Plus Jakarta Sans throughout. Center login and registration in a 460px column, with 52px white inputs, 10px input corners, visible labels, and fully rounded CTA buttons. Use the direct headings “Masuk” and “Daftar” without a subtitle. Registration collects full name, unique username, email, phone number, password, and password confirmation; login uses email and password. Show inline validation, a pending state, and a Lucide Eye/EyeOff password toggle.

After registration, take the signed-in reader to `/minat`. Display genres as compact checkbox cards containing just the genre name and a Lucide Check/Plus: three columns on desktop, two on mobile, 16px corners, and a walnut selected state. Require at least one choice and allow changes later through Edit profil. `/pustakaku` redirects to the reader's `/{username}` profile. Account pages use the universal navbar without a slogan footer.

### Book Pages, Reading Entries, and Admin

Book detail pages show a rounded cover, Plus Jakarta Sans title, author, genre pills, and the average rating. Readers choose “Ingin dibaca”, “Sedang dibaca”, or “Sudah dibaca”, optionally select 1–5 whole stars, and write a plain-text review. Use an accessible radio group with visible keyboard focus for stars; selected stars use walnut brown. Explain that reviews and ratings are public. Place the reading form in a white 16px card, beside reviews on desktop and above them on mobile. Saved entries also appear in Pustakaku.

The admin overview keeps the universal navbar, paper canvas, Plus Jakarta Sans headings, and rounded controls. Use real database counts in compact white cards and readable tables for books and accounts. Tables scroll inside their container on small screens. Do not expose administration links to readers or use promotional eyebrow labels in the dashboard.

### Search Input
**Role:** Book discovery search on `/buku`

Visible label “Cari judul atau penulis”, a white 48px input with a parchment border and 10px corners, and a Lucide Search icon at left. Place it alongside labeled Genre and Urutkan selects and the rounded “Cari” button with a Lucide Search icon. On mobile, stack controls at full width so selected values remain readable. Update results as the reader types or changes genre/sorting, preserve input focus, and reset pagination to page one. Show progress while searching and keep the Cari button for explicit submission. Replace the URL for live updates so typing does not create a history entry per character; show “Atur ulang” when filters are active.

### Feature Card
**Role:** Product capability card in the 3-column feature grid

#ffffff background, 1px #ECE5DC border, 8px radius, 20px padding. Contains a Plus Jakarta Sans subheading (Plus Jakarta Sans 22px weight 700 or Plus Jakarta Sans 28px weight 500) followed by bullet text or a product screenshot. Optional very faint shadow (rgba 0,0,0,0.04) reinforces elevation without weight.

### Testimonial Card
**Role:** Social-proof card in the 'Loved by everyone' grid

#ffffff background, 1px #ECE5DC border, 8px radius, 20px padding. Layout: avatar (circular, ~40px) + display name in Plus Jakarta Sans 15px weight 500 + verified check + platform glyph on one row, quote text in Plus Jakarta Sans 15px weight 400 below.

### Section Heading
**Role:** Editorial section title — the moment where the page breathes

Plus Jakarta Sans 28px weight 500, #21170E, centered alignment, line-height 1.35. Use weight 600 for a clear heading hierarchy.

### Hero Headline
**Role:** Page-level editorial title

Plus Jakarta Sans at `clamp(48px, 7.5vw, 96px)`, weight 400, #21170E, centered, line-height 1.08 and -3.5px letter spacing. Keep the two-line headline prominent. On mobile, use `clamp(36px, 10.5vw, 60px)`, line-height 1.1, and -2px letter spacing.

### Book Cover Marquee
**Role:** Full-width horizontal row of books, looping continuously below the hero copy

Book covers sit upright, side by side, with 16px corners and no rotation or overlap. Desktop cover width is `clamp(156px, 17vw, 260px)` with 24px gaps; mobile uses 156px covers and 16px gaps. Repeat the same seven-book sequence three times and translate the track by one third of its width over a 46-second linear infinite animation for a seamless loop. Hide duplicate groups from screen readers. Include a circular pause/resume control. For reduced-motion preferences, disable animation, hide duplicate groups and the pause control, and allow native horizontal scrolling.

### Product Screenshot Tile
**Role:** In-feature visual showing the app interface (reading tracker, library list, scanner)

Phone or interface mockup placed inside a feature card, contained with 4px radius, no device frame, sits on the white card background as a clean screenshot.

### Navigation Bar
**Role:** Sticky top header with brand, search, and actions

One navbar in the root layout, used on every page including profiles, login/signup, book details, admin, and not-found pages. White background, #ffffff, 1px #ECE5DC bottom border. Left: supplied arch logo + Pustaka wordmark. Center: “Beranda”, “Jelajahi buku”, and “Cara kerja” links. Right: account actions or the filled profile icon. At 800px and below, put the page links on a second row; keep all links visible and keyboard accessible.

### Bullet List (Feature Points)
**Role:** Supporting list of capabilities inside feature cards

Plus Jakarta Sans 15px weight 400, #493B2F, 10px vertical gap between items, no bullets or checkmarks — clean text stack only.

## Do's and Don'ts

### Do
- Use #3E2712 walnut brown for primary CTAs, the brand logo, and the wordmark; use warm ink for body text and deep ink for headings
- Set section headings in Plus Jakarta Sans at 28–40px; use the larger responsive 48–96px scale for the hero. Use Plus Jakarta Sans throughout.
- Keep the page canvas at #F8F6F2 and card surfaces at #ffffff with a 1px #ECE5DC border — avoid colored card backgrounds or drop shadows beyond rgba(0,0,0,0.04)
- Use 9999px radius for all buttons and action controls, 16px for hero book covers, 4px for other images, 8px for cards, and 16px for large media blocks. Square icon buttons are circular.
- Center all section headings and keep the 3-column grid consistent across feature and testimonial sections
- Default to Plus Jakarta Sans 15–16px weight 400 for body text with 1.45–1.50 line-height — this is the reading-optimized baseline
- Maintain 80px vertical section gaps to preserve the airy, page-of-a-book feel

### Don't
- Stay within the brown and warm neutral palette; book covers provide the other colors
- Do not introduce another font family; use Plus Jakarta Sans on every page and control
- Do not use #21170E as a primary CTA fill — #3E2712 owns that role; #21170E is only for the dark App Store button and heading text
- Do not apply heavy drop shadows, glows, or colored shadows — elevation is communicated through border and a 1–2% opacity shadow only
- Do not use square or partially rounded buttons. All action controls, including CTAs, category filters, rating buttons, and close buttons, must be fully rounded.
- Do not add gradients, glassmorphism, or background images to cards or sections — surfaces stay flat
- Do not break the centered, symmetric layout with asymmetric or left-aligned hero compositions — the page reads like a printed page

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#F8F6F2` | Page background and section bands |
| 1 | Card | `#ffffff` | Feature cards, testimonial cards, input fields |
| 2 | Ink | `#21170E` | Dark secondary action surface (App Store download) |
| 3 | Brand | `#3E2712` | Primary action surface (Jelajahi koleksi, Cari bacaan) |

## Elevation

- **Feature card:** `0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px #ECE5DC`
- **Testimonial card:** `0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px #ECE5DC`

## Imagery

Imagery is content-driven, not decorative. The hero uses a full-width looping row of real book covers, upright with 16px corners and no overlap, that supplies the color the page otherwise lacks. Feature sections insert clean product screenshots — phone-shaped reading tracker, library list, camera scanner UI — rendered without device bezels, sitting directly on white card surfaces. The social-proof section uses circular user avatars from Twitter. There is no stock photography, no abstract gradient art, no illustrations. Icons are line-based, single-stroke, #493B2F or #7B6D60.

## Layout

The landing page uses a centered 1200px container and sticky white navigation. Its order is hero, full-width book marquee, three concise feature cards, then a compact footer. Keep the large Plus Jakarta Sans hero title and short explanatory sentence. The universal navbar links to Beranda, `/buku` (Jelajahi buku), and Cara kerja beside the account actions. The dedicated `/buku` page has a labeled search field, shared genre filter, rating sort, results count, and a cover grid with author and real aggregate ratings. Use 24 books per page, numbered pagination, disabled boundary controls, and a useful empty state. Preserve filters in pagination URLs; a new search starts at page one. Mark unrated books as Belum dinilai and place them after rated books. On mobile, use two cover columns and stack the search controls. Functional account pages use direct headings and only the controls and content needed for their task.

Reader profiles use a narrower 960px container: a circular Lucide user placeholder beside the name and muted @username, then genre pills and a chronological reading activity list. Each activity pairs a small book cover with its title, date, reading status, optional stars, and review. Keep surfaces flat, separators subtle, and actions fully rounded. Only the owner sees “Edit profil” and account actions; the interest section has no edit button. The edit page contains name, username, genre choices, and a native checkbox for public profile history. Use a compact lock icon and one short line for private history; never show hidden activity to visitors.

## Agent Prompt Guide

**Quick Color Reference**
- text: #493B2F
- background: #F8F6F2
- border: #ECE5DC
- card surface: #ffffff
- accent: #3E2712
- primary action: #3E2712 (filled action)

**3-5 Example Component Prompts**

1. Create a Primary Action Button: #3E2712 background, #ffffff text, 9999px radius, 14px vertical × 28px horizontal padding. Use this filled treatment for the main CTA.

2. *Create a feature card*: #ffffff background, 1px #ECE5DC border, 8px radius, 20px padding, optional shadow 0 1px 3px rgba(0,0,0,0.04). Card contains a subheading in Plus Jakarta Sans 22px weight 700 #21170E, followed by a bullet list in Plus Jakarta Sans 15px weight 400 #493B2F with 10px row gap, then a product screenshot at 4px radius.

3. *Create a testimonial card*: #ffffff background, 1px #ECE5DC border, 8px radius, 20px padding. Top row: 40px circular avatar + display name in Plus Jakarta Sans 15px weight 500 #493B2F + verified glyph. Body: quote text in Plus Jakarta Sans 15px weight 400 #493B2F, line-height 1.50.

4. *Create the navigation bar*: white background, parchment bottom border, Pustaka logo and wordmark at left, Indonesian section links in the center, and account actions at right: walnut-filled Masuk and parchment-filled Daftar, or a filled profile icon for signed-in readers. Use the same navbar on every page and keep links visible on mobile.


## Similar Brands

- **Are.na** — Same literary-editorial sensibility: monochromatic warm canvas, serif headlines against sans body, single accent-free palette that lets content carry the color
- **Read.cv** — Mirror-image visual system: near-white canvas, generous whitespace, serif display type, restrained single-accent approach, bookish/magazine-like cadence
- **Substack** — Same serif-heading + clean-Inter-body pairing on a white canvas with minimal ornament, the same feeling of reading a printed page on screen
- **Goodreads** — Same domain (book tracking) and same flat, content-led layout language — though Pustaka is far more restrained and monochromatic where Goodreads is denser and warmer

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-walnut-brown: #3E2712;
  --color-warm-ink: #493B2F;
  --color-warm-cream: #F8F6F2;
  --color-muted-brown: #7B6D60;
  --color-parchment: #ECE5DC;
  --color-paper-white: #ffffff;
  --color-deep-ink: #21170E;

  /* Typography — Font Families */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 14px;
  --leading-caption: 1.45;
  --text-body: 16px;
  --leading-body: 1.45;
  --text-subheading: 22px;
  --leading-subheading: 1.4;
  --text-heading: 28px;
  --leading-heading: 1.35;
  --text-display: clamp(48px, 7.5vw, 96px);
  --leading-display: 1.08;

  /* Typography — Weights */
  --font-weight-regular: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-40: 40px;
  --spacing-80: 80px;
  --spacing-160: 160px;
  --spacing-180: 180px;

  /* Layout */
  --page-max-width: 1200px;
  --section-gap: 80px;
  --card-padding: 20px;
  --element-gap: 20px;

  /* Border Radius */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-2xl: 16px;

  /* Named Radii */
  --radius-cards: 8px;
  --radius-other: 16px;
  --radius-images: 4px;
  --radius-buttons: 9999px;

  /* Surfaces */
  --surface-canvas: #F8F6F2;
  --surface-card: #ffffff;
  --surface-ink: #21170E;
  --surface-brand: #3E2712;
}
```

### Tailwind v4

```css
@theme {
  /* Colors */
  --color-walnut-brown: #3E2712;
  --color-warm-ink: #493B2F;
  --color-warm-cream: #F8F6F2;
  --color-muted-brown: #7B6D60;
  --color-parchment: #ECE5DC;
  --color-paper-white: #ffffff;
  --color-deep-ink: #21170E;

  /* Typography */
  --font-plus-jakarta-sans: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  /* Typography — Scale */
  --text-caption: 14px;
  --leading-caption: 1.45;
  --text-body: 16px;
  --leading-body: 1.45;
  --text-subheading: 22px;
  --leading-subheading: 1.4;
  --text-heading: 28px;
  --leading-heading: 1.35;
  --text-display: clamp(48px, 7.5vw, 96px);
  --leading-display: 1.08;

  /* Spacing */
  --spacing-8: 8px;
  --spacing-16: 16px;
  --spacing-20: 20px;
  --spacing-24: 24px;
  --spacing-28: 28px;
  --spacing-40: 40px;
  --spacing-80: 80px;
  --spacing-160: 160px;
  --spacing-180: 180px;

  /* Border Radius */
  --radius-md: 4px;
  --radius-lg: 8px;
  --radius-2xl: 16px;
  --radius-buttons: 9999px;
}
```
