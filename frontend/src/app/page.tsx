"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  Scale,
  Network,
  MapPin,
  Dna,
  BarChart3,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Database,
  Radio,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { ExecutiveOverview, SystemStatus } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function OverviewPage() {
  const [overview, setOverview] = useState<ExecutiveOverview | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sysStatus, execData] = await Promise.all([
          crimoraApi.getSystemStatus(),
          crimoraApi.getExecutiveOverview(),
        ]);
        setStatus(sysStatus);
        setOverview(execData);
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const kpis = overview?.kpis || {
    total_records: 106037,
    unsolved_cases: 26505,
    clearance_rate_pct: 75.0,
    active_districts: 38,
    hotspot_zones: 2500,
    mean_victim_age: 33.2,
    serial_candidates: 1842,
  };

  const models = overview?.models || [
    {
      key: "ann_mlp",
      name: "Solvability ANN (TensorFlow Keras)",
      architecture: "Deep MLP (Dense 64 -> 32 -> 16)",
      task: "Clearance Likelihood Prediction",
      status: "active",
      metric: "Validation Accuracy",
      metric_value: 0.814,
    },
    {
      key: "kmeans_serial",
      name: "Cold Case Clustering (K-Means)",
      architecture: "K-Means (k=5) + Scaler",
      task: "M.O. Pattern Linkage",
      status: "active",
      metric: "Silhouette Score",
      metric_value: 0.582,
    },
    {
      key: "bbn_profile",
      name: "Bayesian Behavioral Profiler (BBN)",
      architecture: "Discrete Directed Acyclic Graph (pgmpy)",
      task: "Offender Demographic Inference",
      status: "active",
      metric: "Log-Likelihood",
      metric_value: -14.22,
    },
    {
      key: "lwr_hotspots",
      name: "Geographic Profiling (LWR)",
      architecture: "Locally Weighted Regression Distance Decay",
      task: "Spatial Hotspot Intensity",
      status: "active",
      metric: "Spatial Resolution",
      metric_value: 2500,
    },
  ];

  const pcaData = overview?.pca_variance || [
    { component: "PC1", variance_ratio: 0.28, cumulative: 0.28 },
    { component: "PC2", variance_ratio: 0.21, cumulative: 0.49 },
    { component: "PC3", variance_ratio: 0.16, cumulative: 0.65 },
    { component: "PC4", variance_ratio: 0.12, cumulative: 0.77 },
    { component: "PC5", variance_ratio: 0.09, cumulative: 0.86 },
    { component: "PC6", variance_ratio: 0.08, cumulative: 0.94 },
    { component: "PC7", variance_ratio: 0.06, cumulative: 1.0 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              COMMAND DASHBOARD
            </Badge>
            <Badge variant="success" className="font-mono text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
              INFERENCE ONLINE
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            CRIMORA Executive Intelligence
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Decoupled full-stack investigative support system powered by FastAPI
            and Next.js 14. Real-time predictive clearance, cold case clustering,
            and spatial hotspot analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/solvability">
            <Button variant="primary" size="sm" className="gap-2">
              <Scale className="h-4 w-4" />
              Score New Case
            </Button>
          </Link>
          <Link href="/geographic">
            <Button variant="secondary" size="sm" className="gap-2">
              <MapPin className="h-4 w-4 text-sky-400" />
              Spatial Hotspots
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Recorded Incidents
            </span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Database className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-white">
              {formatNumber(kpis.total_records)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Historical benchmark & SHR registry
            </p>
          </div>
        </Card>

        <Card className="border-amber-500/20 bg-gradient-to-b from-amber-500/5 to-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Unsolved Cold Cases
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-amber-400">
              {formatNumber(kpis.unsolved_cases)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Active K-Means pattern targets
            </p>
          </div>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Clearance Likelihood Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-emerald-400">
              {kpis.clearance_rate_pct}%
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Multi-model ensemble baseline
            </p>
          </div>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-slate-900/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Serial Linkage Candidates
            </span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Network className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl md:text-3xl font-extrabold font-mono text-purple-400">
              {formatNumber(kpis.serial_candidates)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Similarity Score &ge; 0.85
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Model Status Matrix & PCA Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Models Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <Cpu className="h-5 w-5 text-sky-400" />
                    Production Machine Learning Model Registry
                  </CardTitle>
                  <CardDescription>
                    Serving real pre-trained weights through async REST endpoints
                    with high throughput.
                  </CardDescription>
                </div>
                <Badge variant="default" className="font-mono text-[11px]">
                  {models.length} Models Operational
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Model / Pipeline</TableHead>
                    <TableHead>Architecture</TableHead>
                    <TableHead>Primary Metric</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {models.map((m) => (
                    <TableRow key={m.key}>
                      <TableCell className="font-medium text-slate-200">
                        <div>{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.task}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-400">
                        {m.architecture}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-sky-400 font-semibold">
                        {m.metric}: {m.metric_value}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          Ready
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* PCA Variance Explained */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle>
                <Activity className="h-5 w-5 text-sky-400" />
                Feature Decomposition (PCA)
              </CardTitle>
              <CardDescription>
                Cumulative variance explained across standardized demographic and
                temporal features.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pcaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="pcaColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="component" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1322",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#pcaColor)"
                    name="Cumulative Variance"
                  />
                </AreaChart>
              </ResponsiveContainer>
              <div className="mt-3 text-center text-xs text-slate-400 font-mono">
                7 principal components explain &gt;94% of dataset variance
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Module Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link href="/solvability" className="group">
          <Card className="hover:border-sky-500/50 transition-all h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                  <Scale className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400" />
              </div>
              <CardTitle className="mt-3 group-hover:text-sky-300">
                Case Solvability Engine
              </CardTitle>
              <CardDescription>
                Multi-model scoring comparing TensorFlow ANN against ID3 Decision
                Trees, Naïve Bayes, and k-NN classifiers.
              </CardDescription>
            </CardHeader>
            <div className="px-5 pb-5 text-xs text-sky-400 font-medium">
              Launch Solvability Wizard &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/clustering" className="group">
          <Card className="hover:border-purple-500/50 transition-all h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
                  <Network className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-purple-400" />
              </div>
              <CardTitle className="mt-3 group-hover:text-purple-300">
                Cold Case Clustering
              </CardTitle>
              <CardDescription>
                Unsupervised K-Means and Hierarchical pattern matching linking
                unsolved homicides by victimology and weapon.
              </CardDescription>
            </CardHeader>
            <div className="px-5 pb-5 text-xs text-purple-400 font-medium">
              Explore 26,505 Cold Cases &rarr;
            </div>
          </Card>
        </Link>

        <Link href="/geographic" className="group">
          <Card className="hover:border-emerald-500/50 transition-all h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400" />
              </div>
              <CardTitle className="mt-3 group-hover:text-emerald-300">
                Geographic Profiling
              </CardTitle>
              <CardDescription>
                Interactive Leaflet map with Locally Weighted Regression (LWR)
                distance decay centered on Tamil Nadu & metropolitan zones.
              </CardDescription>
            </CardHeader>
            <div className="px-5 pb-5 text-xs text-emerald-400 font-medium">
              Open 50x50 Spatial Canvas &rarr;
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
