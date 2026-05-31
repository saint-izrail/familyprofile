import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAllForAdmin, getPendingPhotos, getFlatMembers, type AdminMember, type PendingPhoto, type FlatMember } from "@/lib/members";
import { getAllEvents, type EventItem } from "@/lib/events";
import { storageConfigured } from "@/lib/storage";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let members: AdminMember[] = [];
  let pending: PendingPhoto[] = [];
  let events: EventItem[] = [];
  let flat: FlatMember[] = [];
  let dbError = false;
  try {
    [members, pending, events, flat] = await Promise.all([
      getAllForAdmin(),
      getPendingPhotos(),
      getAllEvents(),
      getFlatMembers(),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <AdminDashboard
      members={members}
      pending={pending}
      events={events}
      flatMembers={flat}
      storageOn={storageConfigured()}
      dbError={dbError}
    />
  );
}
