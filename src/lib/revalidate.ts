import { revalidatePath } from "next/cache";

// Segarkan seluruh halaman publik ber-ISR setelah perubahan data dari admin,
// sehingga suntingan tampil segera tanpa menunggu jendela revalidate (1 jam).
// Cakupan layout root = semua rute publik.
export function revalidatePublic(): void {
  revalidatePath("/", "layout");
}
