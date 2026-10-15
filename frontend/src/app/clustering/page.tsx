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

const CLUSTER_COLORS = ["#38bdf8", "#10b981", "#a855f7", "#f59e0b", "#ef4444"];

export default function ClusteringPage() {
  // Input for live cluster assignment
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

  // Fetch distributions and initial cases
  useEffect(() => {
    async function init() {
      try {
        const dist = await crimoraApi.getClusterDistributions();
        setDistributions(dist);
        loadCases();
      } catch (err) {
        console.error("Failed to load clustering distributions:", err);
      }
    }
    init();
  }, []);

  const loadCases = async () => {
    setLoadingCases(true);
    try {
      const res = await crimoraApi.queryColdCases(filters);
      setColdCases(res.cases || []);
      setTotalMatched(res.total_matched || res.cases.length);
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
      console.error("Cluster assignment failed:", err);
    } finally {
      setIsAssigning(false);
    }
  };

  const clusterChartData =
    distributions?.kmeans_clusters.map((c) => ({
      name: `Cluster ${c.cluster_id}`,
      cases: c.case_count,
      label: c.label,
      weapon: c.top_weapon,
    })) || [
      { name: "Cluster 0", cases: 7200, label: "Young Adult Firearm Linkage" },
      { name: "Cluster 1", cases: 5400, label: "Edged Weapon / Domestic Pattern" },
      { name: "Cluster 2", cases: 4900, label: "Blunt Trauma Dispute" },
      { name: "Cluster 3", cases: 4600, label: "Senior / Vulnerable Target" },
      { name: "Cluster 4", cases: 4405, label: "Juvenile High-Mobility Incident" },
    ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              MODULE 02
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              UNSUPERVISED PATTERN RECOGNITION
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Network className="h-7 w-7 text-purple-400" />
            Serial Crime Linkage & Cold Case Clustering
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Pattern matching engine cross-referencing 26,505 unsolved homicides.
            Calculates Euclidean centroid proximity and cosine similarity across
            modus operandi vectors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="outline" className="font-mono text-xs">
            Dataset: 26,505 Unsolved Cases
          </Badge>
        </div>
      </div>

      {/* Top Section: Live Cluster Assignment & Distribution Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Live Cluster Matcher (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-purple-500/20 bg-gradient-to-b from-purple-500/5 to-slate-900/60">
            <CardHeader>
              <CardTitle>
                <Sparkles className="h-5 w-5 text-purple-400" />
                Live Case Vector Assignment
              </CardTitle>
              <CardDescription>
                Assign an active incident to a K-Means centroid to reveal its
                behavioral archetype.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssign} className="space-y-4">
                <Slider
                  label="Victim Age"
                  value={assignForm.victim_age}
                  min={1}
                  max={95}
                  unit="years"
                  onChange={(val) =>
                    setAssignForm({ ...assignForm, victim_age: val })
                  }
                />

                <Select
                  label="Weapon / M.O. Modality"
                  value={assignForm.weapon}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, weapon: e.target.value })
                  }
                  options={[
                    { label: "Handgun - pistol, revolver", value: "Handgun - pistol, revolver, etc" },
                    { label: "Knife or cutting instrument", value: "Knife or cutting instrument" },
                    { label: "Blunt object - hammer, club", value: "Blunt object - hammer, club, etc" },
                    { label: "Firearm, unspecified", value: "Firearm, type not stated" },
                    { label: "Personal weapons (hands, fists)", value: "Personal weapons, includes beating" },
                  ]}
                />

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isAssigning}
                  className="w-full"
                >
                  Match Case Archetype
                </Button>
              </form>

              {assignedResult && (
                <div className="mt-5 p-4 rounded-xl border border-purple-500/30 bg-slate-950/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-purple-400 font-bold">
                      Assigned Archetype
                    </span>
                    <Badge variant="default" className="font-mono">
                      Cluster #{assignedResult.cluster_id}
                    </Badge>
                  </div>
                  <div className="text-base font-bold text-white">
                    {assignedResult.cluster_label}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                    <div>Centroid Age: {assignedResult.centroid_age.toFixed(1)} yrs</div>
                    <div>Distance: {assignedResult.distance_to_center.toFixed(3)}</div>
                  </div>
                  <div className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <strong className="text-slate-200">Investigative Focus: </strong>
                    {assignedResult.investigative_focus}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cluster Distribution Chart (7 cols) */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <Layers className="h-5 w-5 text-purple-400" />
                    K-Means Centroid Distribution (k=5)
                  </CardTitle>
                  <CardDescription>
                    Partitioning of 26,505 unsolved cases across behavioral clusters.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-[11px]">
                  k=5 Clusters
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterChartData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1322",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="cases" radius={[4, 4, 0, 0]}>
                    {clusterChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CLUSTER_COLORS[index % CLUSTER_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-2 text-center text-xs text-slate-400 font-mono">
                Click any case in the table below to cross-reference linked serial patterns.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cold Cases Query & Live Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>
                <Database className="h-5 w-5 text-purple-400" />
                Unsolved Cold Case Linkage Explorer
              </CardTitle>
              <CardDescription>
                Filter and inspect unsolved cases exhibiting high Modus Operandi
                similarity.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="font-mono text-xs">
                Matched: {totalMatched} Cases
              </Badge>
            </div>
          </div>
        </CardHeader>

        {/* Filter Controls Bar */}
        <div className="px-5 py-3 border-y border-slate-800 bg-slate-950/40 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Select
            label="Cluster ID"
            value={filters.cluster_id}
            onChange={(e) => {
              setFilters({ ...filters, cluster_id: e.target.value });
            }}
            options={[
              { label: "All Clusters", value: "All" },
              { label: "Cluster 0 (Handgun / Young Adult)", value: "0" },
              { label: "Cluster 1 (Edged Weapon)", value: "1" },
              { label: "Cluster 2 (Blunt Object)", value: "2" },
              { label: "Cluster 3 (Senior Vulnerable)", value: "3" },
              { label: "Cluster 4 (Juvenile)", value: "4" },
            ]}
          />

          <Select
            label="Filter Weapon"
            value={filters.weapon}
            onChange={(e) => {
              setFilters({ ...filters, weapon: e.target.value });
            }}
            options={[
              { label: "All Weapons", value: "All" },
              { label: "Handgun", value: "Handgun - pistol, revolver, etc" },
              { label: "Knife / Cutting", value: "Knife or cutting instrument" },
              { label: "Blunt Object", value: "Blunt object - hammer, club, etc" },
              { label: "Firearm, not stated", value: "Firearm, type not stated" },
            ]}
          />

          <Select
            label="Region / State"
            value={filters.state}
            onChange={(e) => {
              setFilters({ ...filters, state: e.target.value });
            }}
            options={[
              { label: "All States", value: "All" },
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
              className="w-full gap-2"
            >
              <Filter className="h-4 w-4 text-purple-400" />
              Apply Query Filter
            </Button>
          </div>
        </div>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Case Record</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Jurisdiction</TableHead>
                <TableHead>Victim Profile</TableHead>
                <TableHead>Weapon / M.O.</TableHead>
                <TableHead>Cluster</TableHead>
                <TableHead>Similarity Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coldCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                    {loadingCases
                      ? "Loading cold cases from database..."
                      : "No cold cases match the current filter criteria."}
                  </TableCell>
                </TableRow>
              ) : (
                coldCases.map((c) => (
                  <TableRow key={c.Record_ID} className="hover:bg-purple-950/20">
                    <TableCell className="font-mono font-bold text-sky-400 text-xs">
                      {c.Record_ID}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {c.Year}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {c.City}, {c.State}
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
                      {c.Victim_Age} yrs • {c.Victim_Sex} ({c.Victim_Race})
                    </TableCell>
                    <TableCell className="text-xs text-slate-300">
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
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        {(c.Similarity_Score * 100).toFixed(1)}%
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
