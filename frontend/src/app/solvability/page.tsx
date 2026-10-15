"use client";

import React, { useState } from "react";
import {
  Scale,
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Cpu,
  BarChart2,
  FileCheck,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { SolvabilityPayload, SolvabilityResult } from "@/types/api";

const leadWindowRetentionData = [
  { window: "0-24h", clearance_pct: 88, historical_avg: 75 },
  { window: "24-72h", clearance_pct: 79, historical_avg: 68 },
  { window: "3-7 Days", clearance_pct: 64, historical_avg: 55 },
  { window: "1-4 Wks", clearance_pct: 46, historical_avg: 40 },
  { window: "1-6 Mos", clearance_pct: 28, historical_avg: 25 },
  { window: "6M+ Archive", clearance_pct: 14, historical_avg: 12 },
];

export default function SolvabilityPage() {
  const [formData, setFormData] = useState<SolvabilityPayload>({
    model: "ensemble",
    victim_age: 28,
    victim_sex: "Male",
    victim_race: "Black",
    victim_count: 0,
    weapon: "Handgun - pistol, revolver, etc",
    circumstance: "Robbery",
    relationship: "Acquaintance",
    city: "Los Angeles",
    state: "California",
    year: 2022,
    month: 7,
    is_weekend: 1,
    day_of_week: 5,
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolvabilityResult | null>(null);

  const handlePredict = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await crimoraApi.predictSolvability(formData);
      setResult(res);
    } catch (err) {
      console.error("Solvability prediction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTriageBadge = (tier: string) => {
    switch (tier) {
      case "TIER-1":
        return <Badge variant="success">Tier-1 Immediate Clearance</Badge>;
      case "TIER-2":
        return <Badge variant="warning">Tier-2 High Priority</Badge>;
      default:
        return <Badge variant="danger">Tier-3 Cold Case Review</Badge>;
    }
  };

  const getOperationalModelName = (name: string, key: string) => {
    if (key === "ann" || name.toLowerCase().includes("ann") || name.toLowerCase().includes("deep") || name.toLowerCase().includes("mlp")) {
      return "Deep Feature Analysis";
    }
    if (key === "decision_tree_id3" || name.toLowerCase().includes("tree") || name.toLowerCase().includes("decision")) {
      return "Standard Triage Analysis";
    }
    if (key === "knn" || name.toLowerCase().includes("knn") || name.toLowerCase().includes("neighbor")) {
      return "Historical Precedent Linker";
    }
    if (key === "naive_bayes" || name.toLowerCase().includes("bayes") || name.toLowerCase().includes("probabilistic")) {
      return "Initial Scene Intake Screener";
    }
    if (key === "ensemble" || name.toLowerCase().includes("ensemble")) {
      return "Ensemble Consensus Verdict";
    }
    return name;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header - Enterprise Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Clearance &amp; Triage
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Active Incident Scorer
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-400" />
            Case Solvability &amp; Triage Priority
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => handlePredict()}
            isLoading={loading}
            size="sm"
            className="gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Run Solvability Triage
          </Button>
        </div>
      </div>

      {/* Split-Screen Workspace: 4 Cols Left, 8 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (4 cols): Incident Parameters */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Parameters</CardTitle>
              <CardDescription>
                Provide crime scene details to evaluate case clearance likelihood.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-3">
                <Select
                  label="Triage Analysis Mode"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  options={[
                    { label: "Ensemble Verdict (Recommended)", value: "ensemble" },
                    { label: "Deep Feature Analysis", value: "ann" },
                    { label: "Standard Triage Analysis", value: "decision_tree_id3" },
                  ]}
                />

                <div className="pt-0.5">
                  <Slider
                    label="Victim Age"
                    value={formData.victim_age}
                    min={1}
                    max={95}
                    unit="yrs"
                    onChange={(val) =>
                      setFormData({ ...formData, victim_age: val })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Victim Sex"
                    value={formData.victim_sex}
                    onChange={(e) =>
                      setFormData({ ...formData, victim_sex: e.target.value })
                    }
                    options={[
                      { label: "Male", value: "Male" },
                      { label: "Female", value: "Female" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                  />

                  <Select
                    label="Demographic"
                    value={formData.victim_race}
                    onChange={(e) =>
                      setFormData({ ...formData, victim_race: e.target.value })
                    }
                    options={[
                      { label: "General", value: "White" },
                      { label: "Metropolitan", value: "Black" },
                      { label: "Regional", value: "Asian" },
                      { label: "Unspecified", value: "Unknown" },
                    ]}
                  />
                </div>

                <Select
                  label="Weapon / M.O. Signature"
                  value={formData.weapon}
                  onChange={(e) =>
                    setFormData({ ...formData, weapon: e.target.value })
                  }
                  options={[
                    { label: "Handgun - pistol, revolver", value: "Handgun - pistol, revolver, etc" },
                    { label: "Knife / Cutting Instrument", value: "Knife or cutting instrument" },
                    { label: "Blunt Object (Club/Hammer)", value: "Blunt object - hammer, club, etc" },
                    { label: "Firearm, unspecified", value: "Firearm, type not stated" },
                    { label: "Shotgun / Rifle", value: "Shotgun" },
                    { label: "Personal Weapons (Hands/Fists)", value: "Personal weapons, includes beating" },
                  ]}
                />

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Circumstance"
                    value={formData.circumstance}
                    onChange={(e) =>
                      setFormData({ ...formData, circumstance: e.target.value })
                    }
                    options={[
                      { label: "Robbery / Theft", value: "Robbery" },
                      { label: "Domestic Altercation", value: "Lover triangle" },
                      { label: "Brawl / Dispute", value: "Brawl due to influence of alcohol" },
                      { label: "Narcotics / Contraband", value: "Narcotic drug laws" },
                      { label: "Financial Dispute", value: "Argument over money" },
                      { label: "Gangland / Organized", value: "Gangland killings" },
                    ]}
                  />

                  <Select
                    label="Relationship"
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                    options={[
                      { label: "Acquaintance", value: "Acquaintance" },
                      { label: "Stranger", value: "Stranger" },
                      { label: "Spouse / Partner", value: "Wife" },
                      { label: "Family Relative", value: "Family" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Select
                    label="Jurisdiction City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    options={[
                      { label: "Chennai", value: "Chennai" },
                      { label: "Madurai", value: "Madurai" },
                      { label: "Coimbatore", value: "Coimbatore" },
                      { label: "Salem", value: "Salem" },
                      { label: "Los Angeles", value: "Los Angeles" },
                      { label: "Chicago", value: "Chicago" },
                    ]}
                  />

                  <Select
                    label="Region / State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    options={[
                      { label: "Tamil Nadu", value: "Tamil Nadu" },
                      { label: "California", value: "California" },
                      { label: "Texas", value: "Texas" },
                      { label: "New York", value: "New York" },
                    ]}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-full mt-2"
                >
                  Calculate Clearance Likelihood
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (8 cols): Primary Investigation Triage Output */}
        <div className="lg:col-span-8 space-y-4">
          {loading ? (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 w-36 bg-slate-800 animate-pulse rounded" />
                <div className="h-6 w-24 bg-slate-800 animate-pulse rounded" />
              </div>
              <div className="h-8 w-48 bg-slate-800 animate-pulse rounded" />
              <div className="h-2 w-full bg-slate-800 animate-pulse rounded" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-16 bg-slate-800/60 animate-pulse rounded" />
                <div className="h-16 bg-slate-800/60 animate-pulse rounded" />
              </div>
              <div className="h-32 bg-slate-800/40 animate-pulse rounded mt-2" />
            </Card>
          ) : result ? (
            <>
              {/* Verdict Summary Card */}
              <Card className="border-slate-850 bg-slate-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
                        Investigation Triage Verdict
                      </span>
                      <CardTitle className="text-base mt-0.5">
                        Clearance Likelihood: {result.clearance_percentage}%
                      </CardTitle>
                    </div>
                    {getTriageBadge(result.triage_tier)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress Gauge */}
                  <div>
                    <div className="flex justify-between text-xs font-medium mb-1 text-slate-300">
                      <span>Clearance Probability Score</span>
                      <span className="font-mono text-indigo-400 font-semibold">
                        {result.clearance_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.max(5, result.clearance_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Priority & Golden Window Targets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-md border border-slate-800 bg-slate-950">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400" />
                        <span className="text-[11px] uppercase font-medium">Triage Priority</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {result.triage_priority}
                      </div>
                    </div>

                    <div className="p-3 rounded-md border border-slate-800 bg-slate-950">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5 text-indigo-400" />
                        <span className="text-[11px] uppercase font-medium">Golden Response Window</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {result.time_window_target}
                      </div>
                    </div>
                  </div>

                  {/* Operational Verdicts Breakdown Table */}
                  {result.verdicts && result.verdicts.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mb-1">
                        Consensus Engine Analysis Breakdown
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Analysis Engine</TableHead>
                            <TableHead>Likelihood</TableHead>
                            <TableHead>Verdict</TableHead>
                            <TableHead>Confidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.verdicts.map((v) => (
                            <TableRow key={v.model_key}>
                              <TableCell className="font-medium text-xs text-slate-300">
                                {getOperationalModelName(v.model_name, v.model_key)}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-indigo-400 font-semibold">
                                {(v.probability * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-xs">
                                <span
                                  className={
                                    v.prediction === 1
                                      ? "text-emerald-400 font-medium"
                                      : "text-rose-400 font-medium"
                                  }
                                >
                                  {v.clearance_verdict}
                                </span>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-slate-400">
                                {v.confidence_tier}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  {/* Detective Action Protocol */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                      Recommended Detective Action Protocol
                    </div>
                    <div className="space-y-1">
                      {result.investigative_guidelines.map((guide, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                          <span>{guide}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Window Clearance Retention Curve */}
              <Card>
                <CardHeader>
                  <CardTitle>Case Clearance Probability by Lead Response Window</CardTitle>
                  <CardDescription>
                    Resolution probability drops significantly as lead response exceeds initial 72 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={leadWindowRetentionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="window" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#1e293b",
                          borderRadius: "6px",
                          fontSize: "11px",
                        }}
                        formatter={(val: any) => [`${val}%`, "Clearance Probability"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="clearance_pct"
                        stroke="#4f46e5"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#indigoGrad)"
                        name="Clearance Probability"
                      />
                      <Line
                        type="monotone"
                        dataKey="historical_avg"
                        stroke="#64748b"
                        strokeDasharray="4 4"
                        name="Historical Average"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/40 flex flex-col items-center justify-center p-8 text-center h-72">
              <Scale className="h-8 w-8 text-slate-600 mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">
                Awaiting Case Parameters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Configure incident metadata in the left workspace and click &quot;Run Solvability Triage&quot; to calculate clearance priority.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
