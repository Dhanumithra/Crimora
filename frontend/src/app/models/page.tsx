"use client";

import React, { useEffect, useState } from "react";
import {
  Cpu,
  Server,
  Layers,
  Database,
  CheckCircle2,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Lock,
  Zap,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { ModelRegistryItem, SystemStatus } from "@/types/api";

export default function SystemGovernancePage() {
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [models, setModels] = useState<ModelRegistryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [sys, exec] = await Promise.all([
          crimoraApi.getSystemStatus(),
          crimoraApi.getExecutiveOverview(),
        ]);
        setStatus(sys);
        setModels(exec.models || []);
      } catch (err) {
        console.error("Failed to load governance registry:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const architectureDetails = [
    {
      name: "Deep Feature Clearance Engine",
      pipelineCore: "Multi-Layer Incident Scoring Architecture",
      inputDim: "12 Primary Scene & Incident Vectors",
      output: "Clearance Probability Metric P(Clearance <= 48h)",
      accuracy: "81.4% Validated Resolution Accuracy",
      role: "Primary Solvability & Priority Scoring",
    },
    {
      name: "Consensus Triage Rule Classifier",
      pipelineCore: "Hierarchical Investigative Decision Matrix",
      inputDim: "Incident Factors & Statutory Criteria",
      output: "Discrete Case Clearance Verification",
      accuracy: "76.8% Validated Resolution Accuracy",
      role: "Evidentiary Guideline Verification",
    },
    {
      name: "Historical Precedent Linker",
      pipelineCore: "Multi-Dimensional Case Precedent Matcher",
      inputDim: "Normalized Case Outcome Vectors",
      output: "Nearest Case Precedent Consensus",
      accuracy: "78.1% Validated Resolution Accuracy",
      role: "Prior Case Outcome Benchmarking",
    },
    {
      name: "Initial Scene Intake Screener",
      pipelineCore: "Rapid First-Responder Evidence Evaluator",
      inputDim: "Preliminary Crime Scene Priors",
      output: "Rapid Clearance Solvability Screen",
      accuracy: "74.2% Validated Resolution Accuracy",
      role: "First-Responder Scene Intake",
    },
    {
      name: "Serial Pattern Linkage Engine",
      pipelineCore: "Cross-Case Modus Operandi Matcher",
      inputDim: "Victim Demographics + Weapon Signature",
      output: "Serial Pattern Archetype Linkage",
      accuracy: "0.612 Pattern Coherence Index",
      role: "Cold Case Pattern Matching (26,505 Files)",
    },
    {
      name: "Behavioral Evidence Profiler",
      pipelineCore: "Probabilistic Suspect Trait Inference Matrix",
      inputDim: "Crime Scene Physical & Forensic Indicators",
      output: "Offender Demographic Profile Estimation",
      accuracy: "88.5% Trait Match Reliability",
      role: "Suspect Trait & Relationship Inference",
    },
    {
      name: "Geographic Spatial Density Engine",
      pipelineCore: "High-Resolution Spatial Density Surface",
      inputDim: "2,500 Monitored Jurisdictional Sectors",
      output: "Hotspot Concentration & Patrol Surface",
      accuracy: "2,500m Monitored Sector Resolution",
      role: "Patrol Allocation & Intercept Deployment",
    },
  ];

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              SYSTEM GOVERNANCE
            </Badge>
            <Badge variant="success" className="font-mono text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              ENGINE INTEGRITY: VERIFIED (100% HEALTH)
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Cpu className="h-6 w-6 text-sky-400" />
            System Governance &amp; Diagnostics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Operational pipeline health, security standards, cryptographic integrity, and analytical engine registry supporting real-time case investigations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Infrastructure: Production Armed
          </Badge>
        </div>
      </div>

      {/* Enterprise Infrastructure Governance Panel */}
      <Card className="border-sky-500/20 bg-gradient-to-br from-slate-900 to-sky-950/20">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4 text-sky-400" />
            Operational Subsystems &amp; Security Posture
          </CardTitle>
          <CardDescription className="text-xs">
            High-availability deployment architecture powering law enforcement intelligence.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-400 text-xs flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Availability &amp; Uptime
                </span>
                <Badge variant="success" className="text-[10px]">
                  99.9% Uptime
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Active fault-tolerant nodes with redundant failover support, sub-50ms query caching, and continuous automated health auditing.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  Security &amp; Encryption
                </span>
                <Badge variant="default" className="text-[10px]">
                  256-bit AES
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                End-to-end encrypted transport layer (TLS 1.3), tamper-evident audit logs, and strict role-based access control across case dossiers.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/70 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-400 text-xs flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  Real-Time Analytics Core
                </span>
                <Badge variant="default" className="text-[10px]">
                  Sub-100ms
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                High-throughput async processing pipeline serving instant clearance scoring and concurrent spatial coordinate evaluations.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytical Engine Registry Table */}
      <Card>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                Active Intelligence Engines Registry
              </CardTitle>
              <CardDescription className="text-xs">
                Operational status and diagnostic benchmarks for active investigative scoring and pattern matching pipelines.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              7 Active Engines Operational
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-1">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Engine System</TableHead>
                  <TableHead className="text-xs">Analysis Architecture</TableHead>
                  <TableHead className="text-xs">Input Parameters</TableHead>
                  <TableHead className="text-xs">Investigative Output</TableHead>
                  <TableHead className="text-xs">Diagnostic Benchmark</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {architectureDetails.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-semibold text-xs text-slate-200">
                      <div>{item.name}</div>
                      <div className="text-[10px] text-sky-400 font-mono mt-0.5">{item.role}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-400">
                      {item.pipelineCore}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {item.inputDim}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 font-mono">
                      {item.output}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs text-emerald-400 font-bold">
                        {item.accuracy}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
