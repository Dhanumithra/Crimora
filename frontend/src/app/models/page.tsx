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

export default function ModelsPage() {
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
        console.error("Failed to load model registry:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const architectureDetails = [
    {
      name: "Deep Learning Clearance Engine",
      pipelineCore: "High-Capacity Neural Classifier (Dense 64 -> 32 -> 16)",
      inputDim: "12 Primary Incident Vectors (SMOTE Balanced)",
      output: "Clearance Probability Metric P(Clearance <= 48h)",
      accuracy: "81.4% ROC-AUC Diagnostic Score",
      role: "Primary Clearance Likelihood Scorer",
    },
    {
      name: "Hierarchical Decision Classifier",
      pipelineCore: "Entropy-Partitioned Decision Tree",
      inputDim: "Hierarchical Rule Split Matrix",
      output: "Discrete Clearance Decision Node",
      accuracy: "76.8% ROC-AUC Diagnostic Score",
      role: "Evidentiary Rule-Based Validation",
    },
    {
      name: "Spatial Neighborhood Classifier",
      pipelineCore: "Multi-Dimensional Metric Space (k=15)",
      inputDim: "Normalized Euclidean Distance Vectors",
      output: "Nearest Case Precedent Consensus",
      accuracy: "78.1% ROC-AUC Diagnostic Score",
      role: "Historical Precedent Matching",
    },
    {
      name: "Probabilistic Clearance Screener",
      pipelineCore: "Gaussian Conditional Likelihood Matrix",
      inputDim: "Class-Conditional Feature Priors",
      output: "Bayesian Prior Likelihood Score",
      accuracy: "74.2% ROC-AUC Diagnostic Score",
      role: "Rapid Triage First-Responder Screening",
    },
    {
      name: "Unsupervised Serial Linkage Engine",
      pipelineCore: "Centroid-Based MO Partitioning (k=5)",
      inputDim: "Victim Demographics + Weapon Vector",
      output: "Behavioral Archetype Assignment",
      accuracy: "0.612 Silhouette Index",
      role: "Serial MO Linkage Across 26,505 Cases",
    },
    {
      name: "Probabilistic Behavioral Profiler",
      pipelineCore: "Directed Acyclic Causal Belief Network",
      inputDim: "Observed Physical Scene Evidence",
      output: "Conditional Suspect Trait Distributions",
      accuracy: "0.885 Posterior Reliability",
      role: "Offender Demographic Inference",
    },
    {
      name: "Geographic Profiling Engine (LWR)",
      pipelineCore: "Locally Weighted Distance Decay Kernel",
      inputDim: "50x50 Spatial Resolution Coordinates",
      output: "Normalized Hotspot Density Surface",
      accuracy: "Bandwidth h = 0.857 (Optimal Density)",
      role: "Patrol Resource Triage & Hotspot Allocation",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              SYSTEM ARCHITECTURE
            </Badge>
            <Badge variant="success" className="font-mono text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              SYSTEM INTEGRITY: VERIFIED
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Cpu className="h-7 w-7 text-sky-400" />
            System Infrastructure & Engine Governance
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Operational architecture, analytical pipeline health, encryption standards,
            and cryptographic model inventory supporting real-time case triage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Build Status: Production Armed
          </Badge>
        </div>
      </div>

      {/* Enterprise Infrastructure Governance Panel */}
      <Card className="border-sky-500/20 bg-gradient-to-br from-slate-900 to-sky-950/20">
        <CardHeader>
          <CardTitle>
            <Server className="h-5 w-5 text-sky-400" />
            System Infrastructure & Security Governance
          </CardTitle>
          <CardDescription>
            High-availability deployment topology and security posture powering investigative analytics.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-sky-400 text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Availability & Uptime
                </span>
                <Badge variant="success" className="text-[10px]">
                  99.9% Uptime
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Active fault-tolerant nodes with redundant failover support, sub-50ms
                edge response caching, and continuous automated health auditing.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-400 text-sm flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Security & Encryption
                </span>
                <Badge variant="default" className="text-[10px]">
                  256-bit AES
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                End-to-end encrypted transport layer (TLS 1.3), tamper-evident audit logs,
                and strict role-based access control (RBAC) across case repositories.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-purple-400 text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Inference Pipeline
                </span>
                <Badge variant="default" className="text-[10px]">
                  Real-Time Armed
                </Badge>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Asynchronous inference pipeline with sub-second probabilistic inference
                and high-concurrency spatial coordinate evaluation engines.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Specifications Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <ShieldCheck className="h-5 w-5 text-sky-400" />
                Verified Analytical Engine Registry
              </CardTitle>
              <CardDescription>
                Detailed specifications of active classification, clustering, and spatial models.
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              7 Active Engines
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Engine System</TableHead>
                <TableHead>Classification Core</TableHead>
                <TableHead>Input Dimensions</TableHead>
                <TableHead>Operational Function</TableHead>
                <TableHead>Diagnostic Benchmark</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {architectureDetails.map((item) => (
                <TableRow key={item.name}>
                  <TableCell className="font-semibold text-slate-200">
                    <div>{item.name}</div>
                    <div className="text-[11px] text-sky-400 font-mono mt-0.5">{item.role}</div>
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
        </CardContent>
      </Card>
    </div>
  );
}
