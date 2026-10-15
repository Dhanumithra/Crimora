"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("CRIMORA runtime exception caught:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-glow-red">
          <AlertTriangle className="h-10 w-10 text-rose-400 stroke-[1.8]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] font-mono text-rose-400 mb-4">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
        SUBSYSTEM EXCEPTION DETECTED
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-slate-100 font-mono mb-2">
        Investigative Pipeline Interrupted
      </h1>

      <p className="max-w-md text-sm text-slate-400 leading-relaxed mb-6">
        An unexpected error occurred while communicating with backend telemetry nodes or rendering analytical components.
      </p>

      {error?.message && (
        <pre className="max-w-lg w-full text-left p-3 mb-6 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
          {error.message}
        </pre>
      )}

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="primary" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry Subsystem
        </Button>
        <Link href="/">
          <Button variant="secondary" className="gap-2">
            <Home className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
