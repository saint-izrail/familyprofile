import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAllForAdmin, getFlatMembers, type AdminMember, type FlatMember } from "@/lib/members";
import { getSubmissions, type SubmissionItem } from "@/lib/submissions";
import { getAllEvents, type EventItem } from "@/lib/events";
import { storageConfigured } from "@/lib/storage";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let members: AdminMember[] = [];
  let submissions: SubmissionItem[] = [];
  let events: EventItem[] = [];
  let flat: FlatMember[] = [];
  let dbError = false;
  try {
    [members, submissions, events, flat] = await Promise.all([
      getAllForAdmin(),
      getSubmissions(),
      getAllEvents(),
      getFlatMembers(),
    ]);
  } catch {
    dbError = true;
  }

  return (
    <AdminDashboard
      members={members}
      submissions={submissions}
      events={events}
      flatMembers={flat}
      storageOn={storageConfigured()}
      dbError={dbError}
    />
  );
}
