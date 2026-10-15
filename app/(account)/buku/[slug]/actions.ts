"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { saveReadingEntry } from "@/lib/reading";

export async function saveEntry(bookId: string, _state: { error: string; message: string }, form: FormData) {
  const user = await requireUser();
  const error = await saveReadingEntry(user.id, bookId, { status: form.get("status"), rating: form.get("rating"), comment: form.get("comment") });
  if (error) return { error, message: "" };
  revalidatePath(`/buku/${bookId}`);
  revalidatePath("/buku");
  revalidatePath("/pustakaku");
  revalidatePath(`/${user.username}`);
  revalidatePath("/admin");
  return { error: "", message: "Tersimpan." };
}
