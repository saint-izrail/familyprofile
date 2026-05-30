import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getAllForAdmin, type AdminMember } from "@/lib/members";
import { storageConfigured } from "@/lib/storage";
import { AdminDashboard } from "@/components/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  let members: AdminMember[] = [];
  let dbError = false;
  try {
    members = await getAllForAdmin();
  } catch {
    dbError = true;
  }

  return <AdminDashboard members={members} storageOn={storageConfigured()} dbError={dbError} />;
}
