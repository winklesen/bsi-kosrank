import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Home, Eye, Star, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SellerDashboardPage() {
  const session = await auth();
  const userId = session?.user?.id;

  const myKos = await prisma.kos.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  });

  const totalKos = myKos.length;
  const rankedKos = myKos.filter((k) => k.ranking !== null);
  const bestScore = rankedKos.length > 0 ? Math.max(...rankedKos.map((k) => k.finalScore ?? 0)) : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em]">Halo, {session?.user?.name}! 👋</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola listing kos Anda dari sini</p>
        </div>
        <Link href="/seller/kos/new">
          <Button className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> Tambah Kos
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center">
            <Home className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold">{totalKos}</div>
            <div className="text-sm text-muted-foreground">Total Listing</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-brand-600 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold">{rankedKos.length}</div>
            <div className="text-sm text-muted-foreground">Sudah Diranking</div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-11 h-11 bg-star rounded-xl flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold">{bestScore ? bestScore.toFixed(2) : "—"}</div>
            <div className="text-sm text-muted-foreground">Skor SAW Terbaik</div>
          </div>
        </div>
      </div>

      {/* My Kos List */}
      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-semibold tracking-[-0.02em]">Listing Kos Saya</h2>
          <Link href="/seller/kos">
            <Button variant="ghost" size="sm" className="rounded-xl text-xs">Lihat Semua</Button>
          </Link>
        </div>
        {myKos.length > 0 ? (
          <div className="divide-y divide-border">
            {myKos.slice(0, 5).map((kos) => (
              <div key={kos.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-muted transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{kos.name}</div>
                  <div className="text-xs text-muted-foreground">Rp {kos.price.toLocaleString("id-ID")}/bulan · {kos.campus}</div>
                </div>
                {kos.ranking && (
                  <span className="text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full">
                    #{kos.ranking}
                  </span>
                )}
                <div className="flex gap-2">
                  <Link href={`/kos/${kos.slug}`} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link href={`/seller/kos/${kos.id}/edit`} className="text-xs text-primary hover:underline font-medium">
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-muted-foreground">
            <Home className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Belum ada listing kos.</p>
            <Link href="/seller/kos/new" className="text-primary text-sm font-medium hover:underline mt-1 block">
              + Tambah kos pertama Anda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
