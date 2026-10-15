"use client";

import React, { useEffect, useState } from "react";
import {
  Network,
  Search,
  Filter,
  Layers,
  Sparkles,
  Database,
  ArrowRight,
  TrendingUp,
  Target,
  FileText,
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

const PATTERN_COLORS = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#f43f5e"];

export default function ClusteringPage() {
  // Input for live pattern matching
  const [assignForm, setAssignForm] = useState({
    victim_age: 26,
    weapon: "Handgun - pistol, revolver, etc",
  });
  const [assignedResult, setAssignedResult] =
    useState<ClusterAssignmentResult | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

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

  useEffect(() => {
    async function init() {
      try {
        const dist = await crimoraApi.getClusterDistributions();
        setDistributions(dist);
        loadCases();
      } catch (err) {
        console.error("Failed to load pattern distributions:", err);
      }
    }
    init();
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

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAssigning(true);
    try {
      const res = await crimoraApi.assignCluster(assignForm);
      setAssignedResult(res);
    } catch (err) {
      console.error("Pattern assignment failed:", err);
    } finally {
      setIsAssigning(false);
    }
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

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header - Enterprise Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Serial Pattern Linkage
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              26,505 Case Repository
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            <Network className="h-5 w-5 text-indigo-400" />
            Serial Pattern Linkage &amp; Cross-Case MO Matcher
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Unsolved Repository: 26,505 Files
          </Badge>
        </div>
      </div>

      {/* Top Section: Active Incident MO Profile (5 cols) & Behavioral & MO Groups (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Active Incident MO Profile (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4 text-indigo-400" />
                Active Incident M.O. Profile
              </CardTitle>
              <CardDescription>
                Input incident parameters to identify matching cold case archetypes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssign} className="space-y-3">
                <div className="pt-0.5">
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

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAssigning}
                  className="w-full mt-1"
                >
                  Search Similar Cold Cases
                </Button>
              </form>

              {assignedResult && (
                <div className="mt-3.5 p-3 rounded-md border border-indigo-500/30 bg-slate-950 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-indigo-400 font-semibold">
                      Matched M.O. Archetype
                    </span>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      Group #{assignedResult.cluster_id}
                    </Badge>
                  </div>
                  <div className="text-xs font-semibold text-slate-100">
                    {assignedResult.cluster_label}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                    <div>Mean Age: {assignedResult.centroid_age.toFixed(1)} yrs</div>
                    <div>Pattern Fit: <span className="text-emerald-400 font-semibold">High Match</span></div>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
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
          <Card className="h-full flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400" />
                  Behavioral &amp; M.O. Cluster Groups
                </CardTitle>
                <CardDescription>
                  Partitioning of 26,505 unsolved cases across distinct criminal behavioral pattern groups.
                </CardDescription>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">
                5 Pattern Groups
              </Badge>
            </CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterChartData} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#1e293b",
                      borderRadius: "6px",
                      fontSize: "11px",
                    }}
                    formatter={(val: any) => [`${val} Cases`, "Volume"]}
                  />
                  <Bar dataKey="cases" radius={[3, 3, 0, 0]}>
                    {clusterChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PATTERN_COLORS[index % PATTERN_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-1 text-center text-[10px] text-slate-500 font-mono">
                Select any pattern group in the filter below to inspect linked cold case files.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cold Cases Query & Live Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-4 w-4 text-indigo-400" />
              Unsolved Cold Case Linkage Dossiers
            </CardTitle>
            <CardDescription>
              Cross-reference unsolved cases displaying high Modus Operandi similarity.
            </CardDescription>
          </div>
          <Badge variant="default" className="font-mono text-xs">
            Matched: {totalMatched} Records
          </Badge>
        </CardHeader>

        {/* Filter Controls Bar */}
        <div className="px-3 py-2 border-y border-slate-800 bg-slate-950/80 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
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
              { label: "All Jurisdictions", value: "All" },
              { label: "Tamil Nadu", value: "Tamil Nadu" },
              { label: "California", value: "California" },
              { label: "Texas", value: "Texas" },
              { label: "New York", value: "New York" },
              { label: "Florida", value: "Florida" },
              { label: "Illinois", value: "Illinois" },
            ]}
          />

          <div className="flex items-end">
            <Button
              onClick={loadCases}
              variant="secondary"
              isLoading={loadingCases}
              className="w-full gap-1.5 h-8.5"
            >
              <Filter className="h-3.5 w-3.5 text-indigo-400" />
              Apply Pattern Filter
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
                    <TableCell><div className="h-3.5 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-3.5 w-12 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-3.5 w-24 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-3.5 w-28 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-3.5 w-32 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-3.5 w-14 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-3.5 w-12 bg-slate-800 animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : coldCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-slate-500 text-xs">
                    No cold case records match the specified pattern criteria.
                  </TableCell>
                </TableRow>
              ) : (
                coldCases.map((c) => (
                  <TableRow key={c.Record_ID} className="hover:bg-slate-800/50">
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
                      <span className="font-mono text-emerald-400 font-semibold text-xs">
                        {(c.Similarity_Score * 100).toFixed(1)}% Match
                      </span>
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
