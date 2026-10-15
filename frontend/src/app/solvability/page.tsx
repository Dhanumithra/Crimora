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
  { window: "0-24h (Immediate)", clearance_pct: 88, historical_avg: 75 },
  { window: "24-72h (Critical)", clearance_pct: 79, historical_avg: 68 },
  { window: "3-7 Days (Active)", clearance_pct: 64, historical_avg: 55 },
  { window: "1-4 Weeks (Follow-up)", clearance_pct: 46, historical_avg: 40 },
  { window: "1-6 Months (Extended)", clearance_pct: 28, historical_avg: 25 },
  { window: "6M+ (Cold Archive)", clearance_pct: 14, historical_avg: 12 },
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
        return <Badge variant="success">Tier-1 Immediate Clearance Target</Badge>;
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
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              INCIDENT TRIAGE
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              SOLVABILITY SCORING
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Scale className="h-6 w-6 text-sky-400" />
            Case Solvability &amp; Triage Priority
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Assess incident clearance likelihood, establish golden investigation time targets, and prioritize detective resource allocation.
          </p>
        </div>

        <Button
          onClick={() => handlePredict()}
          isLoading={loading}
          size="sm"
          className="gap-2 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Run Solvability Triage
        </Button>
      </div>

      {/* Main Grid: Form Left, Results & Charts Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Form: 5 Cols */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base">Case Attributes &amp; Incident Parameters</CardTitle>
              <CardDescription className="text-xs">
                Select incident characteristics to calculate clearance probability.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <form onSubmit={handlePredict} className="space-y-3.5">
                <Select
                  label="Investigative Triage Mode"
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

                <div className="pt-1">
                  <Slider
                    label="Victim Age"
                    value={formData.victim_age}
                    min={1}
                    max={95}
                    unit="years"
                    onChange={(val) =>
                      setFormData({ ...formData, victim_age: val })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    label="Victim Demographic"
                    value={formData.victim_race}
                    onChange={(e) =>
                      setFormData({ ...formData, victim_race: e.target.value })
                    }
                    options={[
                      { label: "General", value: "White" },
                      { label: "Metropolitan", value: "Black" },
                      { label: "Regional", value: "Asian" },
                      { label: "Indigenous", value: "Native American" },
                      { label: "Unspecified", value: "Unknown" },
                    ]}
                  />
                </div>

                <Select
                  label="Weapon / M.O. Modality"
                  value={formData.weapon}
                  onChange={(e) =>
                    setFormData({ ...formData, weapon: e.target.value })
                  }
                  options={[
                    { label: "Handgun - pistol, revolver", value: "Handgun - pistol, revolver, etc" },
                    { label: "Knife or cutting instrument", value: "Knife or cutting instrument" },
                    { label: "Blunt object - hammer, club", value: "Blunt object - hammer, club, etc" },
                    { label: "Firearm, unspecified", value: "Firearm, type not stated" },
                    { label: "Shotgun", value: "Shotgun" },
                    { label: "Rifle", value: "Rifle" },
                    { label: "Strangulation - hanging", value: "Strangulation - hanging" },
                    { label: "Personal weapons (hands, fists)", value: "Personal weapons, includes beating" },
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Incident Circumstance"
                    value={formData.circumstance}
                    onChange={(e) =>
                      setFormData({ ...formData, circumstance: e.target.value })
                    }
                    options={[
                      { label: "Robbery / Theft", value: "Robbery" },
                      { label: "Domestic / Triangle", value: "Lover triangle" },
                      { label: "Brawl / Altercation", value: "Brawl due to influence of alcohol" },
                      { label: "Narcotics / Contraband", value: "Narcotic drug laws" },
                      { label: "Financial Dispute", value: "Argument over money" },
                      { label: "Other Arguments", value: "Other arguments" },
                      { label: "Organized Crime / Gang", value: "Gangland killings" },
                    ]}
                  />

                  <Select
                    label="Suspect Relationship"
                    value={formData.relationship}
                    onChange={(e) =>
                      setFormData({ ...formData, relationship: e.target.value })
                    }
                    options={[
                      { label: "Acquaintance", value: "Acquaintance" },
                      { label: "Stranger", value: "Stranger" },
                      { label: "Spouse / Partner", value: "Wife" },
                      { label: "Significant Other", value: "Girlfriend" },
                      { label: "Friend / Associate", value: "Friend" },
                      { label: "Family Relative", value: "Family" },
                      { label: "Unknown / Unestablished", value: "Unknown" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Jurisdiction / City"
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
                    label="State / Province"
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

        {/* Right Output: 7 Cols */}
        <div className="lg:col-span-7 space-y-4">
          {result ? (
            <>
              {/* Verdict Summary Card */}
              <Card className="border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/20">
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] uppercase font-mono tracking-wider text-sky-400">
                        Investigation Clearance Verdict
                      </div>
                      <CardTitle className="text-lg mt-0.5">
                        Clearance Likelihood: {result.clearance_percentage}%
                      </CardTitle>
                    </div>
                    {getTriageBadge(result.triage_tier)}
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-4">
                  {/* Progress Gauge */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                      <span>Clearance Probability Gauge</span>
                      <span className="font-mono text-sky-400 font-bold">
                        {result.clearance_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-glow"
                        style={{ width: `${Math.max(5, result.clearance_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Priority & Window Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span>Triage Priority</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {result.triage_priority}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4 text-sky-400" />
                        <span>Golden Window Target</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {result.time_window_target}
                      </div>
                    </div>
                  </div>

                  {/* Operational Verdicts Breakdown */}
                  {result.verdicts && result.verdicts.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Investigative Verdict Breakdown
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Analysis Engine</TableHead>
                            <TableHead className="text-xs">Likelihood</TableHead>
                            <TableHead className="text-xs">Clearance Verdict</TableHead>
                            <TableHead className="text-xs">Confidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.verdicts.map((v) => (
                            <TableRow key={v.model_key}>
                              <TableCell className="font-medium text-xs text-slate-300">
                                {getOperationalModelName(v.model_name, v.model_key)}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-sky-400 font-bold">
                                {(v.probability * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-xs">
                                <span
                                  className={
                                    v.prediction === 1
                                      ? "text-emerald-400 font-semibold"
                                      : "text-rose-400 font-semibold"
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

                  {/* Tactical Guidelines */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Recommended Detective Action Protocol
                    </div>
                    <div className="space-y-1">
                      {result.investigative_guidelines.map((guide, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300"
                        >
                          <ChevronRight className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-0.5" />
                          <span>{guide}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center h-64">
              <Scale className="h-10 w-10 text-slate-600 mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">
                Awaiting Case Parameters
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Configure the case parameters on the left and select &quot;Calculate Clearance Likelihood&quot; to generate triage priority.
              </p>
            </Card>
          )}

          {/* Practical Response Window Clearance Curve */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-sky-400" />
                Case Clearance Probability by Lead Response Window
              </CardTitle>
              <CardDescription className="text-xs">
                Historical resolution probability drops steeply outside the golden 48-hour response window.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leadWindowRetentionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="clearanceGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="window" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1322",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(val: any) => [`${val}%`, "Clearance Probability"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="clearance_pct"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#clearanceGrad)"
                    name="Priority Triage Clearance"
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
        </div>
      </div>
    </div>
  );
}
