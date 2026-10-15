import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { CommandPalette } from "@/components/ui/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CRIMORA | AI Crime Analytics & Investigative Support System",
  description:
    "Production-grade dark-mode crime intelligence platform serving multi-model solvability inference, cold case linkage, Bayesian behavioral profiling, and Tamil Nadu spatial analytics.",
  keywords: [
    "Crime Analytics",
    "Law Enforcement Intelligence",
    "Clearance Prediction",
    "Machine Learning",
    "Bayesian Belief Network",
    "Tamil Nadu Police Analytics",
    "Geographic Profiling",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-[#0B0E14] text-[#E2E8F0] min-h-screen antialiased flex flex-row selection:bg-[#3B5BDB]/30 selection:text-[#7B9CF5]`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          <Navbar />
          <main className="flex-1 p-4 md:p-5 max-w-[1440px] w-full mx-auto">
            {children}
          </main>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
