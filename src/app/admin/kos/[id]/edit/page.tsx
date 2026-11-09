import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { updateKos } from "@/features/kos/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function EditKosPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kos = await prisma.kos.findUnique({ where: { id } });

  if (!kos) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/admin/kos" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Kos
      </Link>

      <h1 className="font-display tracking-[-0.02em] text-[26px] md:text-[30px] font-bold text-ink-900 mb-6">Edit Kos</h1>

      <form
        action={async (formData) => {
          "use server";
          await updateKos(id, formData);
          redirect("/admin/kos");
        }}
        className="space-y-5 bg-white p-6 rounded-2xl border border-border"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">Nama Kos</Label>
          <Input id="name" name="name" defaultValue={kos.name} required className="rounded-xl" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Deskripsi</Label>
          <textarea
            id="description"
            name="description"
            defaultValue={kos.description}
            required
            rows={3}
            className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="price">Harga per Bulan (Rp)</Label>
            <Input id="price" type="number" name="price" defaultValue={kos.price} required className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="roomSize">Ukuran Kamar</Label>
            <Input id="roomSize" name="roomSize" defaultValue={kos.roomSize} required className="rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="genderType">Tipe Kos</Label>
            <select
              id="genderType"
              name="genderType"
              defaultValue={kos.genderType}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10"
            >
              <option value="PUTRA">Putra</option>
              <option value="PUTRI">Putri</option>
              <option value="CAMPUR">Campur</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="campus">Kampus Terdekat</Label>
            <select
              id="campus"
              name="campus"
              defaultValue={kos.campus}
              className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring h-10"
            >
              <option value="Amikom">Amikom</option>
              <option value="UPN">UPN</option>
              <option value="Mercu Buana">Mercu Buana</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address">Alamat Lengkap</Label>
          <Input id="address" name="address" defaultValue={kos.address} required className="rounded-xl" />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 rounded-xl">Simpan Perubahan</Button>
          <Link href="/admin/kos">
            <Button type="button" variant="outline" className="rounded-xl">Batal</Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
