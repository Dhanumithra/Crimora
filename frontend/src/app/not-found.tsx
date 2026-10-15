"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-4">
        <div className="h-14 w-14 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
          <ShieldAlert className="h-7 w-7 text-indigo-400 stroke-[1.8]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-slate-800 bg-slate-900 text-[11px] font-mono text-slate-400 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
        STATUS 404 &bull; RECORD NOT LOCATED
      </div>

      <h1 className="text-lg font-semibold tracking-tight text-slate-100 mb-1.5">
        Case File or Module Not Found
      </h1>

      <p className="max-w-md text-xs text-slate-400 leading-normal mb-6">
        The requested investigative module or telemetry dossier does not exist or may have been archived under classified clearance protocols.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Link href="/" prefetch={true}>
          <Button variant="primary" size="sm" className="gap-1.5">
            <Home className="h-3.5 w-3.5" />
            Executive Overview
          </Button>
        </Link>
        <Link href="/solvability" prefetch={true}>
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Search className="h-3.5 w-3.5" />
            Solvability Triage
          </Button>
        </Link>
      </div>
    </div>
  );
}
