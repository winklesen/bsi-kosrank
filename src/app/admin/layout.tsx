import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted/50">
      <AdminSidebar />
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
