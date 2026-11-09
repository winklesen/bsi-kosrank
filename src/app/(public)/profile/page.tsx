import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ProfileClientPage from "@/features/auth/ProfileClientPage"

export const metadata = {
  title: "Profil Pengguna | KosRank",
  description: "Kelola profil dan pengaturan akun Anda di KosRank.",
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      createdAt: true,
      _count: {
        select: { kos: true }
      }
    }
  })

  if (!user) {
    redirect("/auth/login")
  }

  return (
    <div className="bg-surface-muted/50 min-h-screen">
      <ProfileClientPage user={user} />
    </div>
  )
}
