import { SellerSidebar } from "@/components/layout/SellerSidebar";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      <SellerSidebar />
      <main className="flex-1 h-full overflow-y-auto">{children}</main>
    </div>
  );
}
