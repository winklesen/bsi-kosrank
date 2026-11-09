import type { Metadata } from "next";
import { Source_Sans_3, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata: Metadata = {
  title: "KosRank – Temukan Kos Terbaik di Condong Catur",
  description:
    "Marketplace kos terpercaya di Condong Catur Yogyakarta. Bandingkan harga, fasilitas, dan jarak kampus menggunakan sistem rekomendasi SAW.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${sourceSans.variable} ${jetbrainsMono.variable} ${jakarta.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
