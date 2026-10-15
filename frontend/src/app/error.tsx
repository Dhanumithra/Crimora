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
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="relative mb-4">
        <div className="h-14 w-14 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="h-7 w-7 text-rose-400 stroke-[1.8]" />
        </div>
      </div>

      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded border border-slate-800 bg-slate-900 text-[11px] font-mono text-rose-400 mb-3">
        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
        SUBSYSTEM EXCEPTION DETECTED
      </div>

      <h1 className="text-lg font-semibold tracking-tight text-slate-100 mb-1.5">
        Investigative Pipeline Interrupted
      </h1>

      <p className="max-w-md text-xs text-slate-400 leading-normal mb-5">
        An unexpected error occurred while communicating with backend telemetry nodes or rendering analytical components.
      </p>

      {error?.message && (
        <pre className="max-w-lg w-full text-left p-2.5 mb-5 rounded-md bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400 overflow-x-auto">
          {error.message}
        </pre>
      )}

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        <Button onClick={() => reset()} variant="primary" size="sm" className="gap-1.5">
          <RotateCcw className="h-3.5 w-3.5" />
          Retry Subsystem
        </Button>
        <Link href="/">
          <Button variant="secondary" size="sm" className="gap-1.5">
            <Home className="h-3.5 w-3.5" />
            Return to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
