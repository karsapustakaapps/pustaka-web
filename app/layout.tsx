import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SiteHeader } from "./components/site-header";
import "lenis/dist/lenis.css";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pustaka — Temukan bacaan favoritmu",
  description:
    "Temukan buku, simpan status bacamu, dan bagikan penilaian serta ulasan di Pustaka.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${jakarta.variable} antialiased`}
    >
      <body><SiteHeader />{children}</body>
    </html>
  );
}
