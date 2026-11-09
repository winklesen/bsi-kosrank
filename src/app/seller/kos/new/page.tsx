import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GenderType } from "@prisma/client";

async function createSellerKos(ownerId: string, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString().slice(-5);
  await prisma.kos.create({
    data: {
      name, slug,
      description: formData.get("description") as string,
      price: parseInt(formData.get("price") as string),
      roomSize: formData.get("roomSize") as string,
      address: formData.get("address") as string,
      campus: formData.get("campus") as string,
      phone: formData.get("phone") as string,
      genderType: formData.get("genderType") as GenderType,
      ownerId,
    },
  });
  revalidatePath("/seller/kos");
  redirect("/seller/kos");
}

export default async function SellerNewKosPage() {
  const session = await auth();
  const userId = session?.user?.id!;

  return (
    <div className="p-8 max-w-2xl">
      <Link href="/seller/kos" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </Link>
      <h1 className="font-display text-[26px] md:text-[30px] font-bold tracking-[-0.02em] mb-6">Tambah Listing Kos</h1>

      <form action={createSellerKos.bind(null, userId)} className="space-y-5 bg-white p-6 rounded-2xl border border-border">
        <div className="space-y-1.5">
          <Label>Nama Kos</Label>
          <Input name="name" required placeholder="Contoh: Kos Griya Sejahtera" className="rounded-xl" />
        </div>
        <div className="space-y-1.5">
          <Label>Deskripsi</Label>
          <textarea name="description" required rows={3} placeholder="Ceritakan keunggulan kos Anda..." className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Harga/Bulan (Rp)</Label>
            <Input name="price" type="number" required placeholder="1500000" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Nomor WA/HP</Label>
            <Input name="phone" type="tel" placeholder="08xxxxxxxxxx" className="rounded-xl" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Ukuran Kamar</Label>
            <Input name="roomSize" required placeholder="4x4 meter" className="rounded-xl" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipe Kos</Label>
            <select name="genderType" className="w-full border border-input rounded-xl px-3 py-2 text-sm h-10">
              <option value="PUTRA">Putra</option>
              <option value="PUTRI">Putri</option>
              <option value="CAMPUR">Campur</option>
            </select>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Kampus Terdekat</Label>
          <select name="campus" className="w-full border border-input rounded-xl px-3 py-2 text-sm h-10">
            <option value="Amikom">Amikom</option>
            <option value="UPN">UPN</option>
            <option value="Mercu Buana">Mercu Buana</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Alamat Lengkap</Label>
          <Input name="address" required placeholder="Jl. Condong Catur..." className="rounded-xl" />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit" className="flex-1 rounded-xl">Pasang Kos</Button>
          <Link href="/seller/kos"><Button type="button" variant="outline" className="rounded-xl">Batal</Button></Link>
        </div>
      </form>
    </div>
  );
}
