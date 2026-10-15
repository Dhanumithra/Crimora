"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shadow-glow">
          <ShieldAlert className="h-10 w-10 text-sky-400 stroke-[1.8]" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400">
          !
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        STATUS 404 &bull; RECORD NOT LOCATED
      </div>

      <h1 className="text-3xl font-bold tracking-tight text-slate-100 font-mono mb-2">
        Case File or Module Not Found
      </h1>

      <p className="max-w-md text-sm text-slate-400 leading-relaxed mb-8">
        The requested investigative module or telemetry dossier does not exist or may have been archived under classified clearance protocols.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/">
          <Button variant="primary" className="gap-2">
            <Home className="h-4 w-4" />
            Executive Overview
          </Button>
        </Link>
        <Link href="/solvability">
          <Button variant="secondary" className="gap-2">
            <Search className="h-4 w-4" />
            Clearance Solvability Engine
          </Button>
        </Link>
      </div>
    </div>
  );
}
