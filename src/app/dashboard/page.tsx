import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/login");

  const role = (session.user as { role?: string }).role;

  if (role === "SUPER_ADMIN") redirect("/admin");
  if (role === "SELLER") redirect("/seller");
  redirect("/profile");
}
