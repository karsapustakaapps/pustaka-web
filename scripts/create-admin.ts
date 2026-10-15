import "./load-env";
import { createInitialAdmin } from "../lib/bootstrap-admin";
import { sqlite } from "../db";

async function main() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error("Isi ADMIN_EMAIL dan ADMIN_PASSWORD di .env.local terlebih dahulu.");
  const result = await createInitialAdmin({
    name: process.env.ADMIN_NAME || "Admin Pustaka",
    username: process.env.ADMIN_USERNAME || "admin_pustaka",
    email: process.env.ADMIN_EMAIL,
    phoneNumber: process.env.ADMIN_PHONE || "080000000000",
    password: process.env.ADMIN_PASSWORD,
    passwordConfirmation: process.env.ADMIN_PASSWORD,
  });
  console.log(`${result.created ? "Admin dibuat" : "Admin sudah tersedia"}: ${process.env.ADMIN_EMAIL}. Masuk melalui /masuk; kata sandi mengikuti ADMIN_PASSWORD.`);
}

main().catch((error) => { console.error(error instanceof Error ? error.message : "Admin belum berhasil dibuat."); process.exitCode = 1; }).finally(() => sqlite.close());
