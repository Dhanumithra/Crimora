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
  FolderSearch,
  ExternalLink,
  ChevronRight,
  Target,
  Clock,
  Flame,
  FileText,
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
import { ExecutiveOverview, SystemStatus, ColdCaseItem } from "@/types/api";
import { formatNumber } from "@/lib/utils";

interface ActivityItem {
  id: string;
  time: string;
  type: "MO_MATCH" | "TRIAGE_ALERT" | "PATROL_DISPATCH" | "COLD_LINK";
  caseId: string;
  title: string;
  summary: string;
  jurisdiction: string;
}

export default function OverviewPage() {
  const [overview, setOverview] = useState<ExecutiveOverview | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [priorityCases, setPriorityCases] = useState<ColdCaseItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [sysStatus, execData, coldCasesResp] = await Promise.all([
          crimoraApi.getSystemStatus(),
          crimoraApi.getExecutiveOverview(),
          crimoraApi.queryColdCases({ limit: 5, min_similarity: 0.88 }),
        ]);
        setStatus(sysStatus);
        setOverview(execData);
        setPriorityCases(coldCasesResp?.cases?.slice(0, 5) || []);
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const rawKpis = overview?.kpis as any;
  const totalRecords = rawKpis?.total_records ?? rawKpis?.analyzed_incidents ?? 106037;
  const unsolvedCases = rawKpis?.unsolved_cases ?? rawKpis?.unsolved_cold_cases ?? 26505;
  const clearanceRate = rawKpis?.clearance_rate_pct ?? rawKpis?.baseline_clearance_rate ?? 75.0;
  const serialCandidates = rawKpis?.serial_candidates ?? 1842;

  // Primary Case Factor Impact Breakdown
  const caseFactorData = [
    { factor: "Weapon Signature", impact: 28 },
    { factor: "Location Density", impact: 21 },
    { factor: "Victim Profile", impact: 16 },
    { factor: "Response Window", impact: 12 },
    { factor: "Incident Context", impact: 9 },
    { factor: "Relationship Link", impact: 8 },
    { factor: "Forensic Evidence", impact: 6 },
  ];

  const recentActivities: ActivityItem[] = [
    {
      id: "act-1",
      time: "14m ago",
      type: "MO_MATCH",
      caseId: "CASE-2022-TN-0891",
      title: "Cross-District Serial Pattern Identified",
      summary: "96.2% Modus Operandi match flagged between Chennai Central and Madurai South robberies.",
      jurisdiction: "Chennai Metro",
    },
    {
      id: "act-2",
      time: "48m ago",
      type: "TRIAGE_ALERT",
      caseId: "CASE-2023-TN-0144",
      title: "Tier-1 Priority Window Active",
      summary: "Golden 48-hour response target active. High clearance likelihood assessed at 84.7%.",
      jurisdiction: "Coimbatore City",
    },
    {
      id: "act-3",
      time: "2h ago",
      type: "PATROL_DISPATCH",
      caseId: "SECTOR-HOTSPOT-03",
      title: "Mobile ANPR Checkpoint Recommended",
      summary: "Spatial density exceeds 90th percentile in Salem Junction perimeter sector.",
      jurisdiction: "Salem District",
    },
    {
      id: "act-4",
      time: "4h ago",
      type: "COLD_LINK",
      caseId: "COLD-2019-TN-0677",
      title: "Cold Case Precedent Correlated",
      summary: "Physical evidence profile matched against historic unsolved blunt instrument dossier.",
      jurisdiction: "Tiruchirappalli",
    },
  ];

  const defaultPriorityCases: ColdCaseItem[] = [
    {
      Record_ID: "CASE-2021-0891",
      Year: 2021,
      City: "Chennai",
      State: "Tamil Nadu",
      Victim_Age: 29,
      Victim_Sex: "Male",
      Victim_Race: "Indian",
      Weapon: "Handgun - pistol, revolver",
      Cluster_ID: 2,
      Similarity_Score: 0.96,
      Distance_To_Center: 0.04,
    },
    {
      Record_ID: "CASE-2020-0412",
      Year: 2020,
      City: "Madurai",
      State: "Tamil Nadu",
      Victim_Age: 34,
      Victim_Sex: "Female",
      Victim_Race: "Indian",
      Weapon: "Knife or cutting instrument",
      Cluster_ID: 1,
      Similarity_Score: 0.93,
      Distance_To_Center: 0.07,
    },
    {
      Record_ID: "CASE-2022-1104",
      Year: 2022,
      City: "Coimbatore",
      State: "Tamil Nadu",
      Victim_Age: 26,
      Victim_Sex: "Male",
      Victim_Race: "Indian",
      Weapon: "Firearm, unspecified",
      Cluster_ID: 2,
      Similarity_Score: 0.91,
      Distance_To_Center: 0.09,
    },
    {
      Record_ID: "CASE-2019-0677",
      Year: 2019,
      City: "Salem",
      State: "Tamil Nadu",
      Victim_Age: 42,
      Victim_Sex: "Male",
      Victim_Race: "Indian",
      Weapon: "Blunt object - hammer, club",
      Cluster_ID: 4,
      Similarity_Score: 0.89,
      Distance_To_Center: 0.11,
    },
    {
      Record_ID: "CASE-2021-0329",
      Year: 2021,
      City: "Tiruchirappalli",
      State: "Tamil Nadu",
      Victim_Age: 51,
      Victim_Sex: "Male",
      Victim_Race: "Indian",
      Weapon: "Personal weapons, includes beating",
      Cluster_ID: 3,
      Similarity_Score: 0.87,
      Distance_To_Center: 0.13,
    },
  ];

  const activeCases = priorityCases.length > 0 ? priorityCases : defaultPriorityCases;

  const getActivityBadge = (type: ActivityItem["type"]) => {
    switch (type) {
      case "MO_MATCH":
        return <Badge variant="secondary">M.O. Match</Badge>;
      case "TRIAGE_ALERT":
        return <Badge variant="warning">Triage Alert</Badge>;
      case "PATROL_DISPATCH":
        return <Badge variant="danger">Patrol Directive</Badge>;
      case "COLD_LINK":
        return <Badge variant="default">Cold Link</Badge>;
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Enterprise Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Operations Center
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Tamil Nadu State Intelligence
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            Investigative Intelligence &amp; Clearance Command
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/solvability">
            <Button variant="primary" size="sm" className="gap-1.5">
              <Scale className="h-3.5 w-3.5" />
              Triage Incident
            </Button>
          </Link>
          <Link href="/clustering">
            <Button variant="secondary" size="sm" className="gap-1.5">
              <Network className="h-3.5 w-3.5 text-indigo-400" />
              Serial Matcher
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Card Top Stat Bar - Crisp & Compact */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Incidents Logged
            </span>
            <Database className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
            ) : (
              <div className="text-xl font-bold font-mono text-slate-100">
                {formatNumber(totalRecords, 106037)}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              Historical benchmark repository
            </p>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Unsolved Cold Cases
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-6 w-20 bg-slate-800 animate-pulse rounded" />
            ) : (
              <div className="text-xl font-bold font-mono text-amber-400">
                {formatNumber(unsolvedCases, 26505)}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              Active pattern cross-reference targets
            </p>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Clearance Solvability Rate
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-6 w-16 bg-slate-800 animate-pulse rounded" />
            ) : (
              <div className="text-xl font-bold font-mono text-emerald-400">
                {clearanceRate.toFixed(1)}%
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              Consensus clearance benchmark
            </p>
          </div>
        </Card>

        <Card className="p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Serial Pattern Leads
            </span>
            <Network className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="mt-2">
            {loading ? (
              <div className="h-6 w-16 bg-slate-800 animate-pulse rounded" />
            ) : (
              <div className="text-xl font-bold font-mono text-indigo-300">
                {formatNumber(serialCandidates, 1842)}
              </div>
            )}
            <p className="text-[10px] text-slate-500 mt-0.5">
              MO Match Confidence &ge; 85%
            </p>
          </div>
        </Card>
      </div>

      {/* Main Grid: Priority Watchlist Table (8 Cols) & Recent Case Activity Feed (4 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Priority Watchlist Table (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-rose-400" />
                  Priority Case Watchlist &amp; Serial Alerts
                </CardTitle>
                <CardDescription>
                  Unresolved incident dossiers flagged with high cross-case MO similarity signatures.
                </CardDescription>
              </div>
              <Link href="/clustering">
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <span>View All Linkages</span>
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2 py-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-slate-800/60 animate-pulse rounded" />
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case Dossier</TableHead>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead>Weapon / M.O. Signature</TableHead>
                      <TableHead>Victim Profile</TableHead>
                      <TableHead>Pattern Match</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCases.map((c, idx) => {
                      const matchPct = Math.round((c.Similarity_Score ?? 0.88) * 100);
                      const isCritical = matchPct >= 92;
                      return (
                        <TableRow key={c.Record_ID || idx}>
                          <TableCell className="font-mono text-xs font-semibold text-slate-200">
                            <div className="flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${isCritical ? 'bg-rose-500 animate-ping' : 'bg-amber-500'}`} />
                              <span>{c.Record_ID}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
                              Year {c.Year || 2021}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            <div>{c.City || "Metropolitan"}</div>
                            <div className="text-[10px] text-slate-500">{c.State || "Tamil Nadu"}</div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300 max-w-[150px] truncate" title={c.Weapon}>
                            {c.Weapon || "Firearm - Handgun"}
                          </TableCell>
                          <TableCell className="text-xs text-slate-400 font-mono">
                            {c.Victim_Age ? `${Math.round(c.Victim_Age)}y` : "Adult"} &bull; {c.Victim_Sex || "Unknown"}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold ${
                              isCritical 
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/30" 
                                : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                            }`}>
                              {matchPct}% Match
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Link href="/clustering">
                              <Button variant="ghost" size="sm" className="h-6 text-xs text-indigo-400 hover:text-indigo-300 px-2 gap-1">
                                <span>Investigate</span>
                                <ArrowUpRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Case Activity Feed (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-400" />
                  Recent Case Activity Feed
                </CardTitle>
                <CardDescription>
                  Chronological dispatch and pattern detection log.
                </CardDescription>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2.5 flex-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-md border border-slate-800/80 bg-slate-950/70 hover:border-slate-700 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-slate-300">
                      {act.caseId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getActivityBadge(act.type)}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {act.time}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-200">
                    {act.title}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    {act.summary}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Primary Case Factor Impact & Module Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Primary Case Factor Impact (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                Primary Case Factor Impact
              </CardTitle>
              <CardDescription>
                Weighting of case evidence factors influencing incident solvability.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseFactorData} layout="vertical" margin={{ top: 0, right: 15, left: 15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 32]} stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis dataKey="factor" type="category" stroke="#94a3b8" fontSize={10} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                    formatter={(val: any) => [`${val}% Weight`, "Solvability Impact"]}
                  />
                  <Bar dataKey="impact" fill="#4f46e5" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3 Quick Action Workspaces (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link href="/solvability" className="group">
            <Card className="p-3.5 hover:border-indigo-500/50 transition-colors h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                    <Scale className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300">
                  Solvability &amp; Triage Priority
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Score case clearance likelihood and golden hour response targets.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-indigo-400 font-medium">
                Triage Incident &rarr;
              </div>
            </Card>
          </Link>

          <Link href="/clustering" className="group">
            <Card className="p-3.5 hover:border-indigo-500/50 transition-colors h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400">
                    <Network className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-indigo-400" />
                </div>
                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-indigo-300">
                  Serial Pattern Linkage
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Cross-reference cold case dossiers by victimology and weapon patterns.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-indigo-400 font-medium">
                Cross-Match Cases &rarr;
              </div>
            </Card>
          </Link>

          <Link href="/geographic" className="group">
            <Card className="p-3.5 hover:border-emerald-500/50 transition-colors h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-500 group-hover:text-emerald-400" />
                </div>
                <h3 className="text-xs font-semibold text-slate-100 group-hover:text-emerald-300">
                  Geographic Hotspots
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  Spatial density mapping and tactical patrol checkpoint directives.
                </p>
              </div>
              <div className="mt-3 text-[11px] text-emerald-400 font-medium">
                View Hotspots &rarr;
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
