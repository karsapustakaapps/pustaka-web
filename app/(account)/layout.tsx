import type { Metadata } from "next";
import "./account.css";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <div className="account-shell">
    <main id="main" className="account-main" tabIndex={-1}>
      {children}
    </main>
  </div>;
}
