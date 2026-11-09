import { MapPin } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/features/auth/LoginForm";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] bg-grad-hero flex items-center justify-center p-4">
      <div className="w-full max-w-md py-10">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-display font-bold text-2xl tracking-tight text-ink-900" aria-label="KosRank - Beranda">
            <div className="w-10 h-10 rounded-xl bg-brand-700 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            Kos<span className="text-brand-700">Rank</span>
          </Link>
          <p className="text-ink-700 text-sm mt-2">Panel masuk untuk administrator</p>
        </div>

        <div className="bg-white rounded-2xl border border-line p-8 shadow-[0_4px_16px_rgba(15,15,20,0.08)]">
          <h1 className="font-display text-xl font-bold tracking-[-0.02em] text-ink-900 mb-1">Selamat Datang</h1>
          <p className="text-ink-500 text-sm mb-6">Masuk untuk melanjutkan ke dashboard.</p>
          <Suspense fallback={<div className="text-ink-500 text-sm text-center">Memuat...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
