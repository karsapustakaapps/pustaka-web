"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { deleteBook, saveBook } from "@/lib/book-management";

function refreshBook(bookId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/buku/${bookId}`);
  revalidatePath("/buku");
  revalidatePath(`/buku/${bookId}`);
  revalidatePath("/pustakaku");
  revalidatePath("/[username]", "page");
}

export async function saveBookAction(bookId: string | null, _state: { error: string }, form: FormData) {
  const admin = await requireAdmin();
  let result;
  try {
    result = await saveBook(admin.id, bookId, {
      title: form.get("title"), author: form.get("author"), cover: form.get("cover"),
      description: form.get("description"), gutenbergId: form.get("gutenbergId"),
    }, form.getAll("genres"));
  } catch (error) {
    console.error("Failed to save book", error);
    return { error: "Buku belum berhasil disimpan. Coba lagi." };
  }
  if (result.error || !result.bookId) return { error: result.error || "Buku belum berhasil disimpan." };
  refreshBook(result.bookId);
  redirect("/admin#admin-catalog");
}

export async function deleteBookAction(bookId: string, _state: { error: string }, form: FormData) {
  const admin = await requireAdmin();
  let error;
  try {
    error = await deleteBook(admin.id, bookId, form.get("confirmDelete"));
  } catch (cause) {
    console.error("Failed to delete book", cause);
    return { error: "Buku belum berhasil dihapus. Coba lagi." };
  }
  if (error) return { error };
  refreshBook(bookId);
  redirect("/admin#admin-catalog");
}
