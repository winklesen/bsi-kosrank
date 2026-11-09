import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Pencil, Trash2, Eye, Star, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteKos } from "@/features/kos/actions";

export default async function SellerKosPage() {
  const session = await auth();
  const kosList = await prisma.kos.findMany({
    where: { ownerId: session?.user?.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em]">Kos Saya</h1>
          <p className="text-muted-foreground text-sm mt-1">{kosList.length} listing aktif</p>
        </div>
        <Link href="/seller/kos/new">
          <Button className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Tambah Kos
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted text-xs text-muted-foreground uppercase tracking-wider">
              <th className="text-left py-3.5 px-4">Nama Kos</th>
              <th className="text-left py-3.5 px-4">Harga</th>
              <th className="text-left py-3.5 px-4">Tipe</th>
              <th className="text-left py-3.5 px-4">Skor SAW</th>
              <th className="text-right py-3.5 px-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {kosList.map((kos) => (
              <tr key={kos.id} className="hover:bg-surface-muted/60 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="font-medium">{kos.name}</div>
                  <div className="text-xs text-muted-foreground">{kos.address}</div>
                </td>
                <td className="py-3.5 px-4">Rp {kos.price.toLocaleString("id-ID")}</td>
                <td className="py-3.5 px-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${kos.genderType === "PUTRA" ? "bg-blue-100 text-blue-700" : kos.genderType === "PUTRI" ? "bg-pink-100 text-pink-700" : "bg-purple-100 text-purple-700"}`}>
                    {kos.genderType === "PUTRA" ? "Putra" : kos.genderType === "PUTRI" ? "Putri" : "Campur"}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  {kos.finalScore != null ? (
                    <span className="flex items-center gap-1 text-primary font-semibold text-xs">
                      <Star className="w-3 h-3 fill-primary" /> {kos.finalScore.toFixed(4)}
                    </span>
                  ) : <span className="text-muted-foreground text-xs">Belum dihitung</span>}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/kos/${kos.slug}`}><button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><Eye className="w-4 h-4" /></button></Link>
                    <Link href={`/seller/kos/${kos.id}/edit`}><button className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"><Pencil className="w-4 h-4" /></button></Link>
                    <form action={async () => { "use server"; await deleteKos(kos.id); }}>
                      <button type="submit" className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {kosList.length === 0 && (
              <tr><td colSpan={5} className="py-16 text-center">
                <Home className="w-10 h-10 mx-auto mb-3 text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground">Belum ada listing kos.</p>
                <Link href="/seller/kos/new" className="text-primary text-sm font-medium hover:underline mt-1 block">+ Tambah kos pertama</Link>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
