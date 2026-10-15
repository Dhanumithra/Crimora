"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Scale,
  Network,
  MapPin,
  TrendingUp,
  Database,
  ChevronRight,
  Target,
  Clock,
  ArrowUpRight,
  AlertTriangle,
  Activity,
  ShieldAlert,
  Zap,
  Radio,
  Sliders,
  CheckCircle2,
  Crosshair,
  Volume2,
  HelpCircle,
  Info,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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
  channel: "CH-01" | "CH-02" | "CH-03";
}

interface SectorNode {
  id: string;
  name: string;
  code: string;
  coords: string;
  x: number;
  y: number;
  activeCases: number;
  clearancePct: number;
  threat: "ROUTINE" | "ELEVATED" | "CRITICAL";
  linkTo?: string;
}

export default function OverviewPage() {
  const [overview, setOverview] = useState<ExecutiveOverview | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [priorityCases, setPriorityCases] = useState<ColdCaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState("17:15:00 IST");
  const [activityFilter, setActivityFilter] = useState<string>("ALL");
  const [inspectedCase, setInspectedCase] = useState<ColdCaseItem | null>(null);
  const [showQuickGuide, setShowQuickGuide] = useState(false);

  // Creative Interactive Controls:
  const [defconLevel, setDefconLevel] = useState<number>(3);
  const [selectedSector, setSelectedSector] = useState<string>("chennai");

  // Interactive Solvability Quick-Simulator:
  const [simWeaponRecovered, setSimWeaponRecovered] = useState<boolean>(true);
  const [simWindowHours, setSimWindowHours] = useState<number>(24);
  const [simEyewitness, setSimEyewitness] = useState<boolean>(true);

  // Sector Data for Tactical Radar Canvas
  const sectors: Record<string, SectorNode> = {
    chennai: {
      id: "chennai",
      name: "Chennai Metro HQ",
      code: "SEC-CHN-01",
      coords: "13.0827° N, 80.2707° E",
      x: 360,
      y: 60,
      activeCases: 42,
      clearancePct: 88.4,
      threat: "ELEVATED",
      linkTo: "madurai",
    },
    salem: {
      id: "salem",
      name: "Salem Central",
      code: "SEC-SLM-04",
      coords: "11.6643° N, 78.1460° E",
      x: 210,
      y: 130,
      activeCases: 19,
      clearancePct: 76.2,
      threat: "ROUTINE",
    },
    coimbatore: {
      id: "coimbatore",
      name: "Coimbatore West",
      code: "SEC-CBE-02",
      coords: "11.0168° N, 76.9558° E",
      x: 110,
      y: 180,
      activeCases: 28,
      clearancePct: 82.5,
      threat: "ROUTINE",
    },
    trichy: {
      id: "trichy",
      name: "Tiruchirappalli Delta",
      code: "SEC-TRY-05",
      coords: "10.7905° N, 78.7047° E",
      x: 250,
      y: 190,
      activeCases: 16,
      clearancePct: 74.8,
      threat: "ROUTINE",
    },
    madurai: {
      id: "madurai",
      name: "Madurai South",
      code: "SEC-MDU-03",
      coords: "9.9252° N, 78.1198° E",
      x: 200,
      y: 270,
      activeCases: 34,
      clearancePct: 69.1,
      threat: "CRITICAL",
      linkTo: "chennai",
    },
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString("en-IN", {
          hour12: false,
          timeZone: "Asia/Kolkata",
        }) + " IST"
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
        const rawCases = coldCasesResp?.cases?.slice(0, 5) || [];
        const tnCities = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"];
        const tnCases = rawCases.map((c, i) => {
          const city = (c.City && tnCities.includes(c.City)) ? c.City : tnCities[i % tnCities.length];
          const rawId = c.Record_ID || `000${i+1}`;
          const numDigits = rawId.replace(/\D/g, "");
          const numPart = numDigits.length >= 4 ? numDigits.slice(-5) : `000${i + 12}`;
          const code = city.slice(0, 3).toUpperCase();
          return {
            ...c,
            Record_ID: `TN-${code}-${numPart}`,
            City: city,
            State: "Tamil Nadu",
          };
        });
        setPriorityCases(tnCases);
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
      channel: "CH-01",
    },
    {
      id: "act-2",
      time: "48m ago",
      type: "TRIAGE_ALERT",
      caseId: "CASE-2023-TN-0144",
      title: "Tier-1 Priority Window Active",
      summary: "Golden 48-hour response target active. High clearance likelihood assessed at 84.7%.",
      jurisdiction: "Coimbatore City",
      channel: "CH-02",
    },
    {
      id: "act-3",
      time: "2h ago",
      type: "PATROL_DISPATCH",
      caseId: "SECTOR-HOTSPOT-03",
      title: "Mobile ANPR Checkpoint Recommended",
      summary: "Spatial density exceeds 90th percentile in Salem Junction perimeter sector.",
      jurisdiction: "Salem District",
      channel: "CH-02",
    },
    {
      id: "act-4",
      time: "4h ago",
      type: "COLD_LINK",
      caseId: "COLD-2019-TN-0677",
      title: "Cold Case Precedent Correlated",
      summary: "Physical evidence profile matched against historic unsolved blunt instrument dossier.",
      jurisdiction: "Tiruchirappalli",
      channel: "CH-03",
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

  const filteredActivities =
    activityFilter === "ALL"
      ? recentActivities
      : recentActivities.filter((a) => a.type === activityFilter);

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

  // Quick Solvability Calculation logic for the interactive mini-simulator:
  let calculatedScore = 42;
  if (simWeaponRecovered) calculatedScore += 26;
  if (simWindowHours <= 24) calculatedScore += 22;
  else if (simWindowHours <= 48) calculatedScore += 12;
  else if (simWindowHours <= 72) calculatedScore += 4;
  if (simEyewitness) calculatedScore += 10;
  calculatedScore = Math.min(95, Math.max(15, calculatedScore));

  const getSimTier = (score: number) => {
    if (score >= 78) return { label: "TIER-1 IMMEDIATE CLEARANCE", color: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-500/15" };
    if (score >= 55) return { label: "TIER-2 HIGH PRIORITY TRIAGE", color: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-500/15" };
    return { label: "TIER-3 ARCHIVAL / COLD REVIEW", color: "text-rose-400", border: "border-rose-500/50", bg: "bg-rose-500/15" };
  };

  const getDefconDetails = (lvl: number) => {
    switch (lvl) {
      case 1:
        return {
          code: "L1",
          tag: "DEFCON 1",
          statusText: "Active: Immediate Tactical Intervention",
          badgeStyle: "bg-rose-500/20 text-rose-300 border-rose-500/50",
          alertStyle: "bg-rose-950/80 text-rose-200 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.35)]",
          dotColor: "bg-rose-400",
        };
      case 2:
        return {
          code: "L2",
          tag: "DEFCON 2",
          statusText: "Active: Cross-District Serial M.O. Lock",
          badgeStyle: "bg-amber-500/20 text-amber-300 border-amber-500/50",
          alertStyle: "bg-amber-950/80 text-amber-200 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.35)]",
          dotColor: "bg-amber-400",
        };
      case 3:
        return {
          code: "L3",
          tag: "DEFCON 3",
          statusText: "Active: Elevated Hotspot Surveillance",
          badgeStyle: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50",
          alertStyle: "bg-cyan-950/80 text-cyan-200 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.35)]",
          dotColor: "bg-cyan-400",
        };
      case 4:
      default:
        return {
          code: "L4",
          tag: "DEFCON 4",
          statusText: "Active: Statewide Routine Patrol Grid",
          badgeStyle: "bg-blue-500/20 text-blue-300 border-blue-500/50",
          alertStyle: "bg-blue-950/80 text-blue-200 border-blue-500/60 shadow-[0_0_15px_rgba(37,99,235,0.35)]",
          dotColor: "bg-blue-400",
        };
    }
  };

  const simTier = getSimTier(calculatedScore);
  const currentDefcon = getDefconDetails(defconLevel);
  const activeSectorData = sectors[selectedSector] || sectors.chennai;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Top High-Tech Command Deck Header with DEFCON Dial ── */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900/95 via-blue-950/40 to-slate-950/95 border border-blue-900/40 shadow-[0_16px_50px_rgba(0,0,0,0.55)] overflow-hidden hud-bracket glow-card-blue">
        {/* Ambient Glow Lights in Deep Royal Blue */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 right-0 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 min-w-0 max-w-3xl">
            {/* Animated Blue Radar Scope Component */}
            <div className="hidden sm:flex relative h-16 w-16 shrink-0 rounded-2xl border border-blue-500/50 bg-blue-950/40 overflow-hidden items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.35)]">
              {/* Concentric rings */}
              <div className="absolute inset-1.5 rounded-full border border-blue-500/30" />
              <div className="absolute inset-4 rounded-full border border-blue-500/40" />
              <div className="absolute h-full w-px bg-blue-500/25" />
              <div className="absolute w-full h-px bg-blue-500/25" />
              {/* Rotating radar sweep */}
              <div className="absolute inset-0 animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(37,99,235,0.75)_360deg)] rounded-full pointer-events-none" />
              {/* Pulsing center ping */}
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 animate-ping" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-[10px] font-mono uppercase tracking-[0.15em] text-blue-300 font-bold shadow-[0_0_12px_rgba(37,99,235,0.25)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                  Tactical Command Core
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[11px] font-mono text-blue-300 font-semibold tracking-wider">
                  {clock}
                </span>
                <span className="text-slate-600">&bull;</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                  TAMIL NADU STATE POLICE
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
                Investigative Intelligence &amp; Clearance Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
                Consolidated state crime telemetry, suspect profiling, cross-district serial M.O. linking, and automated triage dispatch.
              </p>
            </div>
          </div>

          {/* Quick Guide & DEFCON Operational Readiness Control */}
          <div className="flex flex-wrap items-center sm:items-stretch gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowQuickGuide(!showQuickGuide)}
              className="gap-2 text-xs border-blue-500/40 bg-blue-950/40 hover:bg-blue-600/20 text-blue-200 self-start sm:self-auto h-auto py-2.5"
            >
              <HelpCircle className="h-4 w-4 text-sky-400" />
              <span>{showQuickGuide ? "Hide Quick Tour" : "Platform Tour"}</span>
            </Button>

            <div className="flex flex-col gap-2.5 bg-slate-950/90 p-3.5 rounded-xl border border-blue-500/40 shadow-xl min-w-[280px] max-w-full">
              <div className="flex items-center justify-between gap-3 border-b border-blue-900/60 pb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
                  Operational Posture (DEFCON)
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black border ${currentDefcon.badgeStyle}`}>
                  {currentDefcon.tag}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { lvl: 4, code: "L4", name: "DEFCON 4", sub: "Routine Patrol", active: "bg-blue-600 text-white font-black border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.6)]" },
                  { lvl: 3, code: "L3", name: "DEFCON 3", sub: "Elevated Watch", active: "bg-cyan-500 text-slate-950 font-black border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.6)]" },
                  { lvl: 2, code: "L2", name: "DEFCON 2", sub: "Pattern Alert", active: "bg-amber-500 text-slate-950 font-black border-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]" },
                  { lvl: 1, code: "L1", name: "DEFCON 1", sub: "Lockdown", active: "bg-rose-600 text-white font-black border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]" },
                ].map((item) => (
                  <button
                    key={item.lvl}
                    type="button"
                    onClick={() => setDefconLevel(item.lvl)}
                    className={`py-1.5 px-3 rounded-lg border text-xs font-mono transition-all flex items-center justify-center ${
                      defconLevel === item.lvl
                        ? item.active
                        : "border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                    title={item.sub}
                  >
                    {item.code}
                  </button>
                ))}
              </div>

              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold ${currentDefcon.alertStyle}`}>
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 animate-ping ${currentDefcon.dotColor}`} />
                <span className="truncate">{currentDefcon.statusText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* High-Tech Cyber Scanline Accent */}
        <div className="cyber-scanline w-full mt-6" />
      </div>

      {/* ── Quick User Guide / Tour Banner ── */}
      {showQuickGuide && (
        <div className="p-6 rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_8px_30px_rgba(37,99,235,0.2)] animate-fade-in text-xs text-slate-300 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
              <Sparkles className="h-5 w-5 text-sky-400" />
              Welcome to Crimora: Quick Start &amp; Feature Navigation Guide
            </div>
            <button
              onClick={() => setShowQuickGuide(false)}
              className="text-slate-400 hover:text-white text-xs underline font-mono"
            >
              Dismiss
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed text-xs">
            Crimora is an intelligent investigative analytics system designed to accelerate criminal investigations, connect cold cases, and prioritize evidence triage. Here is what each section allows you to do:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <Link href="/solvability" prefetch={true} className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-900/40 hover:border-blue-500/60 hover:bg-blue-950/40 transition-all group">
              <div className="font-bold text-blue-300 flex items-center gap-2 mb-1.5 group-hover:text-sky-300">
                <Scale className="h-4 w-4 text-blue-400" />
                Case Solvability
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Enter crime scene evidentiary parameters and lead status to evaluate clearance likelihood &amp; golden-hour directives.
              </p>
            </Link>

            <Link href="/clustering" prefetch={true} className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-900/40 hover:border-blue-500/60 hover:bg-blue-950/40 transition-all group">
              <div className="font-bold text-blue-300 flex items-center gap-2 mb-1.5 group-hover:text-sky-300">
                <Network className="h-4 w-4 text-blue-400" />
                Serial Pattern Linkage
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Discover matching modus operandi patterns across 26,505 unsolved dossiers and view topological cross-case vectors.
              </p>
            </Link>

            <Link href="/geographic" prefetch={true} className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-900/40 hover:border-blue-500/60 hover:bg-blue-950/40 transition-all group">
              <div className="font-bold text-blue-300 flex items-center gap-2 mb-1.5 group-hover:text-sky-300">
                <MapPin className="h-4 w-4 text-blue-400" />
                Geographic Profiling
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Interactive spatial density maps across Tamil Nadu districts with localized checkpoint and patrol suggestions.
              </p>
            </Link>

            <Link href="/profiling" prefetch={true} className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-900/40 hover:border-blue-500/60 hover:bg-blue-950/40 transition-all group">
              <div className="font-bold text-blue-300 flex items-center gap-2 mb-1.5 group-hover:text-sky-300">
                <Target className="h-4 w-4 text-blue-400" />
                Behavioral Profiling
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Infer unknown suspect traits (gender, age bracket, relationship to victim) using causal Bayesian network models.
              </p>
            </Link>
          </div>
        </div>
      )}

      {/* ── 4 Creative Stat Metric Cards with Blue Accents & Sparklines ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Total Incidents with Blue Mini Wave Sparkline */}
        <div className="metric-card glow-card-blue rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-slate-400">
              Total Incidents Logged
            </span>
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.25)]">
              <Database className="h-5 w-5" />
            </div>
          </div>
          {loading ? (
            <div className="h-9 w-28 bg-slate-800 animate-pulse rounded-lg my-1" />
          ) : (
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight leading-none">
              {formatNumber(totalRecords, 106037)}
            </div>
          )}

          {/* Blue Mini Sparkline */}
          <div className="mt-3 py-1">
            <svg className="w-full h-7 text-blue-400" viewBox="0 0 100 24" fill="none">
              <path d="M0 18 Q 15 6, 30 14 T 60 8 T 85 4 T 100 2" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              <path d="M0 18 Q 15 6, 30 14 T 60 8 T 85 4 T 100 2 L 100 24 L 0 24 Z" fill="rgba(37,99,235,0.15)" />
            </svg>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">Statewide Archive</span>
            <span className="font-mono text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30 text-[11px] font-semibold">
              99.8% Verified
            </span>
          </div>
        </div>

        {/* Card 2: Unsolved Cold Cases with Radial Arc */}
        <div className="metric-card glow-card-amber rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-slate-400">
              Unsolved Cold Cases
            </span>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {loading ? (
              <div className="h-9 w-24 bg-slate-800 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold font-mono text-amber-400 tracking-tight leading-none">
                {formatNumber(unsolvedCases, 26505)}
              </div>
            )}
            {/* Circular Ratio Arc */}
            <div className="relative h-11 w-11 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1E293B" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#F59E0B" strokeWidth="3.5" strokeDasharray="88" strokeDashoffset="66" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-amber-400">25%</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">Cross-Pattern Pool</span>
            <span className="font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[11px] font-semibold">
              Priority Review
            </span>
          </div>
        </div>

        {/* Card 3: Clearance Rate with Circular Progress Gauge */}
        <div className="metric-card glow-card-cyan rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-slate-400">
              Clearance Solvability Rate
            </span>
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {loading ? (
              <div className="h-9 w-20 bg-slate-800 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold font-mono text-sky-400 tracking-tight leading-none">
                {clearanceRate.toFixed(1)}%
              </div>
            )}
            {/* Circular Gauge */}
            <div className="relative h-11 w-11 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#1E293B" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="14" fill="none" stroke="#38BDF8" strokeWidth="3.5" strokeDasharray="88" strokeDashoffset="22" strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-sky-400">75%</span>
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">Consensus Benchmark</span>
            <span className="font-mono text-sky-300 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20 text-[11px] font-semibold">
              +2.4% Target
            </span>
          </div>
        </div>

        {/* Card 4: Serial Pattern Leads with Network Matrix */}
        <div className="metric-card glow-card-indigo rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-[0.1em] text-slate-400">
              Serial Pattern Leads
            </span>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <Network className="h-5 w-5" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            {loading ? (
              <div className="h-9 w-20 bg-slate-800 animate-pulse rounded-lg my-1" />
            ) : (
              <div className="text-3xl font-extrabold font-mono text-indigo-400 tracking-tight leading-none">
                {formatNumber(serialCandidates, 1842)}
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
              Active Link
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-2 border-t border-slate-800/80 text-xs">
            <span className="text-slate-400 font-medium">MO Confidence &ge; 85%</span>
            <span className="font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 text-[11px] font-semibold">
              Live Matched
            </span>
          </div>
        </div>
      </div>

      {/* ── Centerpiece: Interactive Tactical Crime Radar & Solvability Mini-Console ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: State Sector Radar & Live Incident Vector Map (7 Cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Crosshair className="h-5 w-5 text-blue-400" />
                  State Sector Radar &amp; Cross-District Link Vector
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Interactive Tamil Nadu policing zones with active cross-district serial linkages.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-800/60">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  Live Radar Feed
                </span>
              </div>
            </CardHeader>

            <CardContent className="pt-2 flex-1 flex flex-col justify-between">
              {/* SVG Tactical Radar Canvas */}
              <div className="relative w-full h-[280px] bg-slate-950/90 rounded-xl border border-blue-950/80 overflow-hidden flex items-center justify-center p-2 shadow-inner">
                {/* Tactical grid background lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px]" />

                {/* Radar Concentric Rings */}
                <div className="absolute h-64 w-64 rounded-full border border-blue-500/20 pointer-events-none" />
                <div className="absolute h-44 w-44 rounded-full border border-blue-500/25 pointer-events-none" />
                <div className="absolute h-24 w-24 rounded-full border border-blue-500/30 pointer-events-none" />

                {/* Sweeping Beam */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="h-64 w-64 rounded-full animate-radar-sweep bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(37,99,235,0.45)_360deg)]" />
                </div>

                <svg className="w-full h-full relative z-10" viewBox="0 0 450 320">
                  {/* Serial M.O. Linkage Vector Line between Chennai and Madurai */}
                  <line
                    x1="360"
                    y1="60"
                    x2="200"
                    y2="270"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    className="animate-pulse"
                  />
                  {/* Vector label */}
                  <rect x="240" y="150" width="105" height="20" rx="4" fill="#070D1A" stroke="#38BDF8" strokeWidth="1" />
                  <text x="245" y="164" fill="#7DD3FC" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    96.2% M.O. CORRELATION
                  </text>

                  {/* Secondary Patrol Link between Salem and Coimbatore */}
                  <line
                    x1="210"
                    y1="130"
                    x2="110"
                    y2="180"
                    stroke="#2563EB"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.7"
                  />

                  {/* Sector Nodes */}
                  {Object.values(sectors).map((sec) => {
                    const isSelected = selectedSector === sec.id;
                    return (
                      <g
                        key={sec.id}
                        className="cursor-pointer group"
                        onClick={() => setSelectedSector(sec.id)}
                      >
                        {/* Outer Glow Ping */}
                        <circle
                          cx={sec.x}
                          cy={sec.y}
                          r={isSelected ? "14" : "10"}
                          fill="none"
                          stroke={sec.threat === "CRITICAL" ? "#F43F5E" : sec.threat === "ELEVATED" ? "#38BDF8" : "#2563EB"}
                          strokeWidth="1.5"
                          opacity={isSelected ? "0.9" : "0.5"}
                          className="animate-radar-ping"
                        />
                        {/* Core Node */}
                        <circle
                          cx={sec.x}
                          cy={sec.y}
                          r={isSelected ? "6" : "5"}
                          fill={sec.threat === "CRITICAL" ? "#F43F5E" : sec.threat === "ELEVATED" ? "#38BDF8" : "#2563EB"}
                          stroke="#0B1528"
                          strokeWidth="2"
                        />
                        {/* Label Badge */}
                        <rect
                          x={sec.x + 10}
                          y={sec.y - 12}
                          width={sec.name.length * 6.5 + 24}
                          height="20"
                          rx="4"
                          fill="#0B1528"
                          stroke={isSelected ? "#38BDF8" : "#1E345A"}
                          strokeWidth="1"
                        />
                        <text
                          x={sec.x + 16}
                          y={sec.y + 2}
                          fill={isSelected ? "#38BDF8" : "#E2E8F0"}
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight={isSelected ? "bold" : "normal"}
                        >
                          {sec.name} ({sec.activeCases})
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Overlay Reticle Info at Top Left of Radar */}
                <div className="absolute top-3 left-3 bg-slate-900/90 border border-blue-900/40 p-2 rounded-lg text-[10px] font-mono pointer-events-none backdrop-blur-md">
                  <div className="text-blue-400 font-bold">RADAR SECTOR ACTIVE</div>
                  <div className="text-slate-400 mt-0.5">RANGE: STATEWIDE (450KM)</div>
                </div>
              </div>

              {/* Selected Sector Telemetry Ribbon */}
              <div className="mt-4 p-3.5 rounded-xl bg-slate-950/70 border border-blue-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-mono font-bold text-xs">
                    {activeSectorData.code.split("-")[1]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono">{activeSectorData.name}</span>
                      <span className="text-[10px] font-mono text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/60">
                        {activeSectorData.coords}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Active Cases: <span className="font-semibold text-slate-200">{activeSectorData.activeCases}</span> &bull; Clearance Rate: <span className="font-semibold text-blue-300">{activeSectorData.clearancePct}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/geographic" prefetch={true}>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600/15 border border-blue-500/30 text-blue-300 text-xs font-semibold hover:bg-blue-600/25 transition-all flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Explore Heatmaps</span>
                    </button>
                  </Link>
                  <Link href="/clustering" prefetch={true}>
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-600/25 transition-all flex items-center gap-1.5">
                      <Network className="h-3.5 w-3.5" />
                      <span>Inspect Links</span>
                    </button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Interactive Solvability Quick-Simulator Mini-Console (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Sliders className="h-5 w-5 text-blue-400" />
                  Solvability Pre-Screen Console
                </CardTitle>
                <span className="text-[10px] font-mono uppercase text-blue-300 bg-blue-950/60 px-2 py-0.5 rounded border border-blue-800/60 font-bold">
                  Interactive Simulator
                </span>
              </div>
              <CardDescription className="text-xs mt-1">
                Simulate clearance probability by adjusting incoming incident parameters.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-between">
              {/* Interactive Controls */}
              <div className="space-y-3.5 bg-slate-950/60 p-4 rounded-xl border border-blue-950/80">
                {/* Weapon Recovered Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300">Forensic Weapon Recovered:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setSimWeaponRecovered(true)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        simWeaponRecovered
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Yes (+26%)
                    </button>
                    <button
                      onClick={() => setSimWeaponRecovered(false)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        !simWeaponRecovered
                          ? "bg-rose-500/30 text-rose-300 border border-rose-500/40"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      No
                    </button>
                  </div>
                </div>

                {/* Elapsed Window Selector */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-300">Intake Response Window:</span>
                    <span className="font-mono font-bold text-blue-400">{simWindowHours} Hours</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { hrs: 12, label: "<12h Golden" },
                      { hrs: 24, label: "24h Target" },
                      { hrs: 48, label: "48h Standard" },
                      { hrs: 96, label: "96h+ Cold" },
                    ].map((w) => (
                      <button
                        key={w.hrs}
                        onClick={() => setSimWindowHours(w.hrs)}
                        className={`py-1.5 px-1 rounded-lg text-[10px] font-mono font-semibold border transition-all text-center ${
                          simWindowHours === w.hrs
                            ? "bg-blue-600/30 text-blue-200 border-blue-500 font-bold"
                            : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Known Eyewitness / Associate */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-slate-300">Eyewitness / Named Associate:</span>
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => setSimEyewitness(true)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        simEyewitness
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() => setSimEyewitness(false)}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                        !simEyewitness
                          ? "bg-slate-800 text-slate-300"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      Unknown
                    </button>
                  </div>
                </div>
              </div>

              {/* Dynamic Predicted Outcome Display */}
              <div className={`p-4 rounded-xl border ${simTier.border} ${simTier.bg} flex items-center justify-between`}>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                    PREDICTED CLEARANCE LIKELIHOOD
                  </div>
                  <div className="text-3xl font-extrabold font-mono text-white tracking-tight mt-0.5">
                    {calculatedScore}%
                  </div>
                  <div className={`text-xs font-mono font-bold mt-1 ${simTier.color}`}>
                    {simTier.label}
                  </div>
                </div>

                {/* Circular Mini Gauge */}
                <div className="relative h-16 w-16 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1E345A" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#2563EB"
                      strokeWidth="3.2"
                      strokeDasharray="88"
                      strokeDashoffset={88 - (88 * calculatedScore) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
                    {calculatedScore}%
                  </span>
                </div>
              </div>

              {/* Action Button to launch full solvability */}
              <Link href="/solvability" prefetch={true}>
                <Button className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30">
                  <span>Open Full Solvability Investigation Engine</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Main Grid: Priority Watchlist Table (8 Cols) & Live Tactical Wire (4 Cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Priority Watchlist Table (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg text-white">
                  <Target className="h-5 w-5 text-rose-400 inline mr-2" />
                  Priority Case Watchlist &amp; Serial Alerts
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Unresolved incident dossiers flagged with high cross-case MO similarity signatures.
                </CardDescription>
              </div>
              <Link href="/clustering" prefetch={true}>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 rounded-lg border-slate-700 bg-slate-900/60 hover:border-blue-500/40 hover:text-blue-300">
                  <span>View All Linkages</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            {/* Quick Dossier Inspection Drawer Banner */}
            {inspectedCase && (
              <div className="mx-6 mb-4 p-4 rounded-xl border border-blue-500/40 bg-gradient-to-r from-blue-950/40 to-slate-900/90 shadow-[0_0_20px_rgba(37,99,235,0.2)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-blue-300">
                      DOSSIER INSPECTION: {inspectedCase.Record_ID}
                    </span>
                    <Badge variant="success" className="text-[10px]">
                      {Math.round((inspectedCase.Similarity_Score ?? 0.88) * 100)}% Match
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-300">
                    Jurisdiction: <span className="font-semibold text-white">{inspectedCase.City}, {inspectedCase.State}</span> &bull; Weapon: <span className="text-blue-200">{inspectedCase.Weapon}</span> &bull; Victim: {inspectedCase.Victim_Age}y {inspectedCase.Victim_Sex}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/solvability`} prefetch={true}>
                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-colors shadow-sm">
                      Run Solvability
                    </button>
                  </Link>
                  <button
                    onClick={() => setInspectedCase(null)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <CardContent className="flex-1">
              {loading ? (
                <div className="space-y-4 py-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-slate-800/50 animate-pulse rounded-xl" />
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
                      <TableHead>Match Strength</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCases.map((c, idx) => {
                      const matchPct = Math.round((c.Similarity_Score ?? 0.88) * 100);
                      const isCritical = matchPct >= 92;
                      return (
                        <TableRow key={c.Record_ID || idx} className="hover:bg-blue-950/20">
                          <TableCell className="font-mono text-xs font-semibold text-slate-100">
                            <div className="flex items-center gap-2.5">
                              <span
                                className={`h-2.5 w-2.5 rounded-full ${
                                  isCritical ? "bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]" : "bg-amber-400"
                                }`}
                              />
                              <span className="font-bold">{c.Record_ID}</span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-sans block mt-1">
                              Incident Year {c.Year || 2021}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300">
                            <div className="font-semibold text-slate-200">{c.City || "Metropolitan"}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{c.State || "Tamil Nadu"}</div>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300 max-w-[160px] truncate" title={c.Weapon}>
                            <span className="font-medium">{c.Weapon || "Firearm - Handgun"}</span>
                          </TableCell>
                          <TableCell className="text-xs text-slate-300 font-mono">
                            <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px] border border-slate-700/50">
                              {c.Victim_Age ? `${Math.round(c.Victim_Age)}y` : "Adult"} &bull; {c.Victim_Sex || "Unknown"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className={isCritical ? "text-rose-400 font-bold" : "text-blue-300 font-semibold"}>
                                  {matchPct}%
                                </span>
                              </div>
                              <div className="w-20 h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full ${
                                    isCritical ? "bg-gradient-to-r from-rose-500 to-amber-500" : "bg-gradient-to-r from-blue-600 to-sky-400"
                                  }`}
                                  style={{ width: `${matchPct}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              onClick={() => setInspectedCase(c)}
                              className="h-8 text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 px-3 rounded-lg font-medium inline-flex items-center gap-1 transition-colors"
                            >
                              <span>Inspect</span>
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </button>
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

        {/* Live Tactical Wire & Dispatch Terminal (4 Cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg text-white">
                  <Clock className="h-5 w-5 text-blue-400 inline mr-2" />
                  Live Tactical Wire
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Real-time encrypted dispatch intercept.
                </CardDescription>
              </div>

              {/* Animated Soundwave Frequency Equalizer in Blue */}
              <div className="flex items-end gap-1 h-5 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 shadow-inner">
                <span className="w-1 bg-blue-400 rounded-full animate-audio-1" />
                <span className="w-1 bg-sky-400 rounded-full animate-audio-2" />
                <span className="w-1 bg-blue-400 rounded-full animate-audio-3" />
                <span className="w-1 bg-sky-400 rounded-full animate-audio-4" />
                <span className="w-1 bg-blue-400 rounded-full animate-audio-5" />
              </div>
            </CardHeader>

            {/* Filter Chips for Tactical Feed */}
            <div className="px-6 pb-3 flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono">
              {["ALL", "MO_MATCH", "TRIAGE_ALERT", "PATROL_DISPATCH"].map((flt) => (
                <button
                  key={flt}
                  onClick={() => setActivityFilter(flt)}
                  className={`px-2 py-0.5 rounded-md border transition-all ${
                    activityFilter === flt
                      ? "bg-blue-600/25 text-blue-200 border-blue-500 font-bold"
                      : "bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  {flt === "ALL" ? "All (4)" : flt.replace("_", " ")}
                </button>
              ))}
            </div>

            <CardContent className="flex-1 pt-2">
              <div className="relative pl-6 space-y-7 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500/60 before:via-sky-500/40 before:to-slate-800/40">
                {filteredActivities.map((act) => {
                  let nodeColor = "border-blue-400 shadow-[0_0_8px_rgba(37,99,235,0.5)]";
                  if (act.type === "TRIAGE_ALERT") nodeColor = "border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]";
                  if (act.type === "PATROL_DISPATCH") nodeColor = "border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.5)]";
                  if (act.type === "COLD_LINK") nodeColor = "border-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.5)]";

                  return (
                    <div key={act.id} className="relative group">
                      {/* Timeline Node */}
                      <span className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full bg-slate-950 border-2 ${nodeColor} transition-transform group-hover:scale-125`} />

                      {/* Header Line */}
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {act.caseId}
                          </span>
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-900 border border-slate-800 text-slate-400">
                            {act.channel}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getActivityBadge(act.type)}
                          <span className="text-[11px] text-slate-500 font-mono">
                            {act.time}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <div className="text-xs font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                        {act.title}
                      </div>

                      {/* Summary */}
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {act.summary}
                      </p>

                      <div className="text-[10px] font-mono text-slate-500 mt-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span>{act.jurisdiction}</span>
                        </div>
                        <span className="text-blue-400/80 font-mono text-[9px] flex items-center gap-1">
                          <span className="h-1 w-1 rounded-full bg-blue-400 animate-ping" />
                          ENCRYPTED
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Bottom Section: Primary Case Factor Impact & Module Shortcuts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Primary Case Factor Impact (5 Cols) */}
        <div className="lg:col-span-5">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">
                <Activity className="h-5 w-5 text-blue-400 inline mr-2" />
                Primary Case Factor Impact
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Weighting of case evidence factors influencing incident solvability.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseFactorData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E345A" horizontal={false} />
                  <XAxis type="number" domain={[0, 32]} stroke="#64748B" fontSize={11} unit="%" />
                  <YAxis dataKey="factor" type="category" stroke="#94A3B8" fontSize={11} width={115} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B1528",
                      borderColor: "#1E345A",
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                      color: "#F1F5F9",
                    }}
                    formatter={(val: any) => [`${val}% Weight`, "Solvability Impact"]}
                  />
                  <Bar dataKey="impact" fill="#2563EB" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 3 Quick Action Workspaces (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/solvability" prefetch={true} className="group">
            <Card className="p-6 hover:border-blue-500/60 hover:shadow-[0_12px_30px_rgba(37,99,235,0.25)] transition-all h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                    <Scale className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-blue-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-blue-300 transition-colors">
                  Solvability &amp; Triage Priority
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Score case clearance likelihood and golden hour response targets.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/60 text-xs text-blue-300 font-mono font-medium flex items-center justify-between">
                <span>Triage Incident</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href="/clustering" prefetch={true} className="group">
            <Card className="p-6 hover:border-sky-500/60 hover:shadow-[0_12px_30px_rgba(14,165,233,0.25)] transition-all h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-cyan">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                    <Network className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-sky-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-sky-300 transition-colors">
                  Serial Pattern Linkage
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Cross-reference cold case dossiers by victimology and weapon patterns.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/60 text-xs text-sky-300 font-mono font-medium flex items-center justify-between">
                <span>Cross-Match Cases</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Card>
          </Link>

          <Link href="/geographic" prefetch={true} className="group">
            <Card className="p-6 hover:border-indigo-500/60 hover:shadow-[0_12px_30px_rgba(99,102,241,0.25)] transition-all h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-indigo">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 group-hover:text-indigo-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  Geographic Hotspots
                </h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Spatial density mapping and tactical patrol checkpoint directives.
                </p>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-800/60 text-xs text-indigo-300 font-mono font-medium flex items-center justify-between">
                <span>View Hotspots</span>
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
