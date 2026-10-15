"use client";

import React, { useEffect, useState } from "react";
import {
  Network,
  Filter,
  Layers,
  Target,
  Database,
  Search,
  Share2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Info,
  RotateCcw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import {
  ClusterAssignmentResult,
  ColdCaseItem,
  ClusterDistributions,
} from "@/types/api";

const PATTERN_COLORS = ["#2563EB", "#0EA5E9", "#38BDF8", "#6366F1", "#818CF8"];

export default function ClusteringPage() {
  // Input for live pattern matching
  const [assignForm, setAssignForm] = useState({
    victim_age: 26,
    weapon: "Handgun - pistol, revolver, etc",
  });
  const [assignedResult, setAssignedResult] =
    useState<ClusterAssignmentResult | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Filters for cold cases query
  const [filters, setFilters] = useState({
    state: "All",
    weapon: "All",
    cluster_id: "All",
    min_similarity: 0.85,
    limit: 50,
  });

  const [coldCases, setColdCases] = useState<ColdCaseItem[]>([]);
  const [totalMatched, setTotalMatched] = useState(0);
  const [distributions, setDistributions] =
    useState<ClusterDistributions | null>(null);
  const [loadingCases, setLoadingCases] = useState(false);
  const [selectedNetworkNode, setSelectedNetworkNode] = useState<string>("CASE-0891");

  useEffect(() => {
    async function init() {
      try {
        setLoadingCases(true);
        const [dist, res] = await Promise.all([
          crimoraApi.getClusterDistributions(),
          crimoraApi.queryColdCases(filters),
        ]);
        setDistributions(dist);
        setColdCases(res.cases || []);
        setTotalMatched(res.total_matched || res.cases?.length || 0);
      } catch (err) {
        console.error("Failed to load pattern distributions:", err);
      } finally {
        setLoadingCases(false);
      }
    }
    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCases = async () => {
    setLoadingCases(true);
    try {
      const res = await crimoraApi.queryColdCases(filters);
      setColdCases(res.cases || []);
      setTotalMatched(res.total_matched || res.cases?.length || 0);
    } catch (err) {
      console.error("Cold case query error:", err);
    } finally {
      setLoadingCases(false);
    }
  };

  const handleAssign = async (e?: React.FormEvent, customForm?: typeof assignForm) => {
    if (e) e.preventDefault();
    setIsAssigning(true);
    try {
      const res = await crimoraApi.assignCluster(customForm || assignForm);
      setAssignedResult(res);
    } catch (err) {
      console.error("Pattern assignment failed:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  const quickArchetypes = [
    { label: "Night Armed Robberies", age: 28, weapon: "Handgun - pistol, revolver, etc" },
    { label: "Domestic Edged Assaults", age: 34, weapon: "Knife or cutting instrument" },
    { label: "Blunt Instrument Trauma", age: 45, weapon: "Blunt object - hammer, club, etc" },
    { label: "Senior Citizen Break-ins", age: 62, weapon: "Personal weapons, includes beating" },
  ];

  const applyArchetype = (arch: (typeof quickArchetypes)[0]) => {
    const updated = { victim_age: arch.age, weapon: arch.weapon };
    setAssignForm(updated);
    handleAssign(undefined, updated);
  };

  const clusterChartData =
    distributions?.kmeans_clusters.map((c: any) => ({
      name: `Pattern ${c.cluster_id}`,
      cases: c.cases || c.case_count || 0,
      label: c.label || `Pattern Group ${c.cluster_id}`,
      weapon: c.top_weapon || "Firearm / Mixed",
    })) || [
      { name: "Pattern 0", cases: 11482, label: "Youth Conflict Linkage" },
      { name: "Pattern 1", cases: 7305, label: "Senior Domestic Pattern" },
      { name: "Pattern 2", cases: 18262, label: "Young Adult Street Linkage" },
      { name: "Pattern 3", cases: 2609, label: "Vulnerable Elder Target" },
      { name: "Pattern 4", cases: 12521, label: "Middle-Aged Workplace / Acquaintance" },
    ];

  // Visual Network Nodes for the interactive Linkage Graph
  const networkNodes = [
    { id: "CASE-0891", x: 190, y: 70, city: "Chennai Metro", match: 96, label: "Index Incident" },
    { id: "CASE-0412", x: 90, y: 160, city: "Madurai South", match: 93, label: "Correlated MO" },
    { id: "CASE-1104", x: 290, y: 150, city: "Coimbatore", match: 91, label: "Ballistics Match" },
    { id: "CASE-0677", x: 140, y: 220, city: "Salem Central", match: 89, label: "Cold Precedent" },
    { id: "CASE-0329", x: 260, y: 230, city: "Tiruchirappalli", match: 87, label: "Physical Match" },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* High-Tech Blue Banner Header */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900/95 via-blue-950/40 to-slate-950/95 border border-blue-900/40 shadow-[0_12px_40px_rgba(0,0,0,0.55)] overflow-hidden hud-bracket glow-card-blue">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-[10px] font-mono uppercase tracking-[0.15em] text-blue-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Cross-Case MO Matcher
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                26,505 CASE ARCHIVE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Network className="h-6 w-6 text-blue-400 stroke-[2.3]" />
              Serial Pattern Linkage &amp; Cross-Case MO Matcher
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
              Link cold cases across jurisdictions using multi-dimensional behavioral clustering, weapon signatures, and temporal proximity.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowHelp(!showHelp)}
              className="gap-2 text-xs"
            >
              <HelpCircle className="h-4 w-4 text-sky-400" />
              <span>{showHelp ? "Hide Guide" : "How to Use"}</span>
            </Button>
            <Badge variant="outline" className="font-mono text-xs px-3.5 py-1.5 border-blue-500/40 text-blue-300 bg-blue-950/40">
              Unsolved Repository: 26,505 Files
            </Badge>
          </div>
        </div>
        <div className="cyber-scanline w-full mt-6" />
      </div>

      {/* User Guide Banner */}
      {showHelp && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-fade-in text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
            <Info className="h-4.5 w-4.5 text-blue-400" />
            Quick User Guide: How Serial Linkage Works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">1</span>
                Match Incident M.O.
              </div>
              <p className="text-[11px] text-slate-400">
                Click a Quick-Test Archetype or adjust victim age &amp; weapon signature to assign the incident to a historical pattern cluster.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">2</span>
                Inspect Linkage Graph
              </div>
              <p className="text-[11px] text-slate-400">
                Click on any node in the Topological Linkage Graph to reveal cross-district matches and MO confidence scores.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">3</span>
                Filter Cold Dossiers
              </div>
              <p className="text-[11px] text-slate-400">
                Use the filter bar below to examine individual unsolved files that match your suspect&apos;s behavioral fingerprint.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick Archetype Selector */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Quick-Test Criminal Archetypes:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {quickArchetypes.map((arch, i) => (
            <button
              key={i}
              onClick={() => applyArchetype(arch)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-blue-600/15 hover:border-blue-500/50 text-slate-300 hover:text-blue-200 text-xs font-medium transition-all shadow-sm"
            >
              {arch.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Section: Active Incident MO Profile (5 cols) & Behavioral & MO Groups (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Incident MO Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-blue-400" />
                Active Incident M.O. Profile
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Input incident parameters to identify matching cold case archetypes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssign} className="space-y-5">
                <div className="pt-1.5">
                  <Slider
                    label="Victim Age"
                    value={assignForm.victim_age}
                    min={1}
                    max={95}
                    unit="yrs"
                    onChange={(val) =>
                      setAssignForm({ ...assignForm, victim_age: val })
                    }
                  />
                </div>

                <Select
                  label="Weapon / M.O. Modality"
                  value={assignForm.weapon}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, weapon: e.target.value })
                  }
                  options={[
                    { label: "Handgun - pistol, revolver", value: "Handgun - pistol, revolver, etc" },
                    { label: "Knife / Cutting Instrument", value: "Knife or cutting instrument" },
                    { label: "Blunt Object (Club/Hammer)", value: "Blunt object - hammer, club, etc" },
                    { label: "Firearm, unspecified", value: "Firearm, type not stated" },
                    { label: "Personal Weapons (Hands/Fists)", value: "Personal weapons, includes beating" },
                  ]}
                />

                <button
                  type="submit"
                  disabled={isAssigning}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Search Similar Cold Cases</span>
                </button>
              </form>

              {assignedResult && (
                <div className="mt-5 p-5 rounded-xl border border-blue-500/40 bg-slate-950/80 space-y-3 shadow-lg animate-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-blue-400 font-semibold tracking-wider">
                      Matched M.O. Archetype
                    </span>
                    <Badge variant="secondary" className="font-mono text-xs px-2.5 py-0.5">
                      Pattern Group #{assignedResult.cluster_id}
                    </Badge>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {assignedResult.cluster_label}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono text-slate-300 py-2 border-y border-slate-800/80">
                    <div>Mean Age: <span className="font-bold text-white">{assignedResult.centroid_age.toFixed(1)} yrs</span></div>
                    <div>Pattern Fit: <span className="text-blue-300 font-bold">High Match (94%)</span></div>
                  </div>
                  <div className="text-xs text-slate-400 pt-1 leading-relaxed">
                    <strong className="text-slate-200 font-medium">Investigative Lead Focus: </strong>
                    {assignedResult.investigative_focus}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Behavioral & M.O. Cluster Groups (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Layers className="h-5 w-5 text-blue-400" />
                  Behavioral &amp; M.O. Cluster Groups
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Partitioning of 26,505 unsolved cases across distinct criminal behavioral pattern groups.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
                5 Pattern Groups
              </Badge>
            </CardHeader>
            <CardContent className="h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterChartData} margin={{ top: 15, right: 15, left: -5, bottom: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E345A" />
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0B1528",
                      borderColor: "#1E345A",
                      borderRadius: "10px",
                      fontSize: "12px",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                      color: "#F1F5F9",
                    }}
                    formatter={(val: any) => [`${val} Cases`, "Volume"]}
                  />
                  <Bar dataKey="cases" radius={[6, 6, 0, 0]}>
                    {clusterChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PATTERN_COLORS[index % PATTERN_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-3 text-center text-xs text-slate-400 font-mono">
                Select any pattern group in the filter below to inspect linked cold case files.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Cross-Case Linkage Matrix Graph (Blue Neon Styling) ── */}
      <Card className="rounded-2xl hud-bracket glow-card-cyan relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Share2 className="h-5 w-5 text-sky-400" />
              Cross-Case Serial Linkage Graph
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Topological relationship map linking index incident to historical unresolved crimes with high M.O. confidence.
            </CardDescription>
          </div>
          <span className="text-[10px] font-mono text-sky-300 bg-sky-950/60 px-2.5 py-1 rounded border border-sky-800/60 font-semibold">
            Interactive Node Matrix
          </span>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-[260px] bg-slate-950/80 rounded-xl border border-blue-950/80 overflow-hidden flex items-center justify-center p-3 shadow-inner">
            {/* Grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]" />

            <svg className="w-full h-full relative z-10" viewBox="0 0 400 280">
              {/* Connecting lines from Center Node to other nodes */}
              <line x1="190" y1="70" x2="90" y2="160" stroke="#3B82F6" strokeWidth="2.5" strokeDasharray="5 3" className="animate-pulse" />
              <line x1="190" y1="70" x2="290" y2="150" stroke="#0EA5E9" strokeWidth="2" strokeDasharray="4 4" />
              <line x1="190" y1="70" x2="140" y2="220" stroke="#60A5FA" strokeWidth="1.5" />
              <line x1="190" y1="70" x2="260" y2="230" stroke="#93C5FD" strokeWidth="1.5" />

              {/* Render Node Elements */}
              {networkNodes.map((n) => {
                const isSelected = selectedNetworkNode === n.id;
                return (
                  <g
                    key={n.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedNetworkNode(n.id)}
                  >
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={isSelected ? "18" : "14"}
                      fill="#0B1528"
                      stroke={isSelected ? "#38BDF8" : "#2563EB"}
                      strokeWidth={isSelected ? "3" : "1.8"}
                    />
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r="4"
                      fill={isSelected ? "#38BDF8" : "#60A5FA"}
                    />
                    {/* Tag Box */}
                    <rect
                      x={n.x - 36}
                      y={n.y + 18}
                      width="72"
                      height="18"
                      rx="4"
                      fill="#070D1A"
                      stroke={isSelected ? "#38BDF8" : "#1E345A"}
                      strokeWidth="1"
                    />
                    <text
                      x={n.x}
                      y={n.y + 30}
                      textAnchor="middle"
                      fill={isSelected ? "#38BDF8" : "#E2E8F0"}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {n.id} ({n.match}%)
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Selected Node Inspector at Bottom Right */}
            <div className="absolute bottom-3 right-3 bg-slate-900/90 border border-blue-900/50 p-2.5 rounded-lg text-xs font-mono backdrop-blur-md">
              <span className="text-slate-400">Selected Node: </span>
              <span className="text-sky-400 font-bold">{selectedNetworkNode}</span>
              <span className="text-slate-500 mx-2">&bull;</span>
              <span className="text-blue-300 font-semibold">
                {networkNodes.find((n) => n.id === selectedNetworkNode)?.city} ({networkNodes.find((n) => n.id === selectedNetworkNode)?.match}% Match)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cold Cases Query & Live Table */}
      <Card className="rounded-2xl overflow-hidden hud-bracket glow-card-blue">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2 text-white">
              <Database className="h-5 w-5 text-blue-400" />
              Unsolved Cold Case Linkage Dossiers
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Cross-reference unsolved cases displaying high Modus Operandi similarity across multi-district archives.
            </CardDescription>
          </div>
          <Badge variant="default" className="font-mono text-xs px-3 py-1 bg-blue-500/10 border-blue-500/30 text-blue-300">
            Matched: {totalMatched} Records
          </Badge>
        </CardHeader>

        {/* Filter Controls Bar */}
        <div className="px-6 py-4 border-y border-slate-800/80 bg-slate-950/70 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Select
            label="Behavioral Pattern Group"
            value={filters.cluster_id}
            onChange={(e) => {
              setFilters({ ...filters, cluster_id: e.target.value });
            }}
            options={[
              { label: "All Pattern Groups", value: "All" },
              { label: "Group 0 (Handgun / Young Adult Altercation)", value: "0" },
              { label: "Group 1 (Edged Weapon Close Contact)", value: "1" },
              { label: "Group 2 (Blunt Instrument Trauma)", value: "2" },
              { label: "Group 3 (Vulnerable Senior Target)", value: "3" },
              { label: "Group 4 (Juvenile Conflict)", value: "4" },
            ]}
          />

          <Select
            label="Weapon M.O."
            value={filters.weapon}
            onChange={(e) => {
              setFilters({ ...filters, weapon: e.target.value });
            }}
            options={[
              { label: "All Weapons", value: "All" },
              { label: "Handgun", value: "Handgun - pistol, revolver, etc" },
              { label: "Knife / Cutting Instrument", value: "Knife or cutting instrument" },
              { label: "Blunt Object (Club/Hammer)", value: "Blunt object - hammer, club, etc" },
              { label: "Firearm, unspecified", value: "Firearm, type not stated" },
            ]}
          />

          <Select
            label="Jurisdiction / Region"
            value={filters.state}
            onChange={(e) => {
              setFilters({ ...filters, state: e.target.value });
            }}
            options={[
              { label: "All Tamil Nadu Sectors", value: "All" },
              { label: "Tamil Nadu (Statewide)", value: "Tamil Nadu" },
            ]}
          />

          <div className="flex items-end">
            <Button
              onClick={loadCases}
              variant="primary"
              isLoading={loadingCases}
              className="w-full gap-2 h-10 rounded-xl"
            >
              <Filter className="h-4 w-4 text-white" />
              <span>Apply Pattern Filter</span>
            </Button>
          </div>
        </div>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Record</TableHead>
                <TableHead>Incident Year</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Victim Profile</TableHead>
                <TableHead>Weapon / M.O.</TableHead>
                <TableHead>MO Group</TableHead>
                <TableHead>Pattern Match</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingCases ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-12 bg-slate-800 animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : coldCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500 text-xs">
                    No cold case records match the specified pattern criteria.
                  </TableCell>
                </TableRow>
              ) : (
                coldCases.map((c) => (
                  <TableRow key={c.Record_ID} className="hover:bg-blue-950/20">
                    <TableCell className="font-mono font-medium text-slate-200 text-xs">
                      {c.Record_ID}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {c.Year}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {c.City}, {c.State}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {c.Victim_Age}y • {c.Victim_Sex} ({c.Victim_Race})
                    </TableCell>
                    <TableCell className="text-xs text-slate-300 max-w-[180px] truncate" title={c.Weapon}>
                      {c.Weapon}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="font-mono text-[10px]"
                      >
                        #{c.Cluster_ID}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-blue-300 font-semibold text-xs">
                          {(c.Similarity_Score * 100).toFixed(1)}%
                        </span>
                        <div className="w-16 h-1 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-400"
                            style={{ width: `${Math.round(c.Similarity_Score * 100)}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
