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
    <div className="space-y-4 animate-in">
      {/* Enterprise Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#252B3B]">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-[#7B9CF5]">
              Operations Center
            </span>
            <span className="text-[#252B3B]">&bull;</span>
            <span className="text-[9px] font-mono uppercase tracking-[0.1em] text-slate-500">
              Tamil Nadu State Intelligence
            </span>
          </div>
          <h1 className="text-[18px] font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            Investigative Intelligence &amp; Clearance Command
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/solvability">
            <Button variant="primary" size="sm">
              <Scale className="h-3.5 w-3.5" />
              Triage Incident
            </Button>
          </Link>
          <Link href="/clustering">
            <Button variant="secondary" size="sm">
              <Network className="h-3.5 w-3.5 text-[#7B9CF5]" />
              Serial Matcher
            </Button>
          </Link>
        </div>
      </div>

      {/* 4-Card Top Stat Bar - Flat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Card 1: Total Incidents */}
        <div className="metric-card rounded p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-slate-500">
              Total Incidents Logged
            </span>
            <Database className="h-3.5 w-3.5 text-slate-600" />
          </div>
          {loading ? (
            <div className="h-6 w-24 bg-[#252B3B] animate-pulse rounded" />
          ) : (
            <div className="text-[20px] font-bold font-mono text-slate-100 leading-none">
              {formatNumber(totalRecords, 106037)}
            </div>
          )}
          <p className="text-[10px] text-slate-600 mt-1">
            Historical benchmark repository
          </p>
        </div>

        {/* Card 2: Unsolved Cold Cases */}
        <div className="metric-card rounded p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-slate-500">
              Unsolved Cold Cases
            </span>
            <AlertTriangle className="h-3.5 w-3.5 text-[#E09B50]" />
          </div>
          {loading ? (
            <div className="h-6 w-20 bg-[#252B3B] animate-pulse rounded" />
          ) : (
            <div className="text-[20px] font-bold font-mono text-[#E09B50] leading-none">
              {formatNumber(unsolvedCases, 26505)}
            </div>
          )}
          <p className="text-[10px] text-slate-600 mt-1">
            Active pattern cross-reference targets
          </p>
        </div>

        {/* Card 3: Clearance Rate */}
        <div className="metric-card rounded p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-slate-500">
              Clearance Solvability Rate
            </span>
            <TrendingUp className="h-3.5 w-3.5 text-[#4CAF6A]" />
          </div>
          {loading ? (
            <div className="h-6 w-16 bg-[#252B3B] animate-pulse rounded" />
          ) : (
            <div className="text-[20px] font-bold font-mono text-[#4CAF6A] leading-none">
              {clearanceRate.toFixed(1)}%
            </div>
          )}
          <p className="text-[10px] text-slate-600 mt-1">
            Consensus clearance benchmark
          </p>
        </div>

        {/* Card 4: Serial Pattern Leads */}
        <div className="metric-card rounded p-3.5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-[0.08em] text-slate-500">
              Serial Pattern Leads
            </span>
            <Network className="h-3.5 w-3.5 text-[#7B9CF5]" />
          </div>
          {loading ? (
            <div className="h-6 w-16 bg-[#252B3B] animate-pulse rounded" />
          ) : (
            <div className="text-[20px] font-bold font-mono text-[#7B9CF5] leading-none">
              {formatNumber(serialCandidates, 1842)}
            </div>
          )}
          <p className="text-[10px] text-slate-600 mt-1">
            MO Match Confidence &ge; 85%
          </p>
        </div>
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
                  <Clock className="h-4 w-4 text-[#7B9CF5]" />
                  Recent Case Activity Feed
                </CardTitle>
                <CardDescription>
                  Chronological dispatch and pattern detection log.
                </CardDescription>
              </div>
              <span className="h-2 w-2 rounded-full bg-[#2F9E44] animate-pulse" />
            </CardHeader>
            <CardContent className="space-y-2 flex-1">
              {recentActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 rounded-sm border border-[#1D2232] bg-[#111520] hover:border-[#252B3B] transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold text-slate-400">
                      {act.caseId}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {getActivityBadge(act.type)}
                      <span className="text-[9px] text-slate-600 font-mono">
                        {act.time}
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] font-medium text-slate-200">
                    {act.title}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#1D2232" horizontal={false} />
                  <XAxis type="number" domain={[0, 32]} stroke="#475569" fontSize={10} unit="%" />
                  <YAxis dataKey="factor" type="category" stroke="#64748B" fontSize={10} width={90} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1A1F2C",
                      borderColor: "#252B3B",
                      borderRadius: "4px",
                      fontSize: "11px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                    }}
                    formatter={(val: any) => [`${val}% Weight`, "Solvability Impact"]}
                  />
                  <Bar dataKey="impact" fill="#3B5BDB" radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3 Quick Action Workspaces (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <Link href="/solvability" className="group">
            <Card className="p-3.5 hover:border-[#3B5BDB]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(59,91,219,0.25)] transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-sm bg-[#3B5BDB]/10 text-[#7B9CF5]">
                    <Scale className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-[#7B9CF5]" />
                </div>
                <h3 className="text-[11px] font-semibold text-slate-200 group-hover:text-[#7B9CF5]">
                  Solvability &amp; Triage Priority
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Score case clearance likelihood and golden hour response targets.
                </p>
              </div>
              <div className="mt-3 text-[10px] text-[#7B9CF5] font-mono font-medium">
                Triage Incident &rarr;
              </div>
            </Card>
          </Link>

          <Link href="/clustering" className="group">
            <Card className="p-3.5 hover:border-[#3B5BDB]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(59,91,219,0.25)] transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-sm bg-[#3B5BDB]/10 text-[#7B9CF5]">
                    <Network className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-[#7B9CF5]" />
                </div>
                <h3 className="text-[11px] font-semibold text-slate-200 group-hover:text-[#7B9CF5]">
                  Serial Pattern Linkage
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Cross-reference cold case dossiers by victimology and weapon patterns.
                </p>
              </div>
              <div className="mt-3 text-[10px] text-[#7B9CF5] font-mono font-medium">
                Cross-Match Cases &rarr;
              </div>
            </Card>
          </Link>

          <Link href="/geographic" className="group">
            <Card className="p-3.5 hover:border-[#2F9E44]/40 hover:shadow-[0_2px_8px_rgba(0,0,0,0.6),0_0_0_1px_rgba(47,158,68,0.2)] transition-all h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-1.5 rounded-sm bg-[#2F9E44]/10 text-[#4CAF6A]">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <ArrowUpRight className="h-3 w-3 text-slate-600 group-hover:text-[#4CAF6A]" />
                </div>
                <h3 className="text-[11px] font-semibold text-slate-200 group-hover:text-[#4CAF6A]">
                  Geographic Hotspots
                </h3>
                <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                  Spatial density mapping and tactical patrol checkpoint directives.
                </p>
              </div>
              <div className="mt-3 text-[10px] text-[#4CAF6A] font-mono font-medium">
                View Hotspots &rarr;
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
