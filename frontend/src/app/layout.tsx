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
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-slate-950 text-slate-100 min-h-screen antialiased flex flex-row selection:bg-indigo-500/30 selection:text-indigo-200`}
      >
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
          <Navbar />
          <main className="flex-1 p-3.5 md:p-5 max-w-7xl w-full mx-auto space-y-4">
            {children}
          </main>
        </div>
        <CommandPalette />
      </body>
    </html>
  );
}
