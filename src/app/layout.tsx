import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import ConditionalNavbar from "@/components/layout/ConditionalNavbar";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SkillSphere - Smart Placement Intelligence",
  description: "PSG College MCA Placement Memory Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <ConditionalNavbar />
          <main className="min-h-screen pb-20 lg:pb-0">
            {children}
          </main>
          <MobileBottomNav />
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
