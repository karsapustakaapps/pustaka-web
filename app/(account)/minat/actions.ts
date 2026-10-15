"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { saveGenrePreferences } from "@/lib/preferences";

export async function saveInterests(_state: { error: string }, form: FormData) {
  const user = await requireUser();
  const error = await saveGenrePreferences(user.id, form.getAll("genres"));
  if (error) return { error };
  revalidatePath("/minat");
  revalidatePath("/pustakaku");
  revalidatePath(`/${user.username}`);
  redirect("/pustakaku");
}
