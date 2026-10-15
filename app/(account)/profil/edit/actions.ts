"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { saveProfile } from "@/lib/profiles";

export async function updateProfile(_state: { error: string }, form: FormData) {
  const user = await requireUser();
  const result = await saveProfile(user.id, { name: form.get("name"), username: form.get("username"), publicHistory: form.has("publicHistory") }, form.getAll("genres"));
  if (result.error || !result.username) return { error: result.error || "Profil belum berhasil disimpan." };
  revalidatePath(`/${user.username}`);
  revalidatePath(`/${result.username}`);
  revalidatePath("/profil/edit");
  revalidatePath("/minat");
  revalidatePath("/pustakaku");
  revalidatePath("/buku/[slug]", "page");
  revalidatePath("/admin");
  redirect(`/${result.username}`);
}
