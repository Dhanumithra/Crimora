"use client";

import React, { useState } from "react";
import {
  Scale,
  Sparkles,
  AlertCircle,
  Clock,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  BookmarkCheck,
  Compass,
  Layers,
  HelpCircle,
  RotateCcw,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
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

const DEFAULT_FORM: SolvabilityPayload = {
  model: "ensemble",
  victim_age: 28,
  victim_sex: "Male",
  victim_race: "Black",
  victim_count: 0,
  weapon: "Handgun - pistol, revolver, etc",
  circumstance: "Robbery",
  relationship: "Acquaintance",
  city: "Chennai",
  state: "Tamil Nadu",
  year: 2022,
  month: 7,
  is_weekend: 1,
  day_of_week: 5,
};

export default function SolvabilityPage() {
  const [formData, setFormData] = useState<SolvabilityPayload>(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SolvabilityResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const scenarioPresets = [
    {
      label: "Armed Commercial Robbery (Chennai)",
      badge: "High Clearance Pattern",
      payload: {
        model: "ensemble",
        victim_age: 32,
        victim_sex: "Male",
        victim_race: "Black",
        victim_count: 0,
        weapon: "Handgun - pistol, revolver, etc",
        circumstance: "Robbery",
        relationship: "Acquaintance",
        city: "Chennai",
        state: "Tamil Nadu",
        year: 2022,
        month: 8,
        is_weekend: 1,
        day_of_week: 6,
      },
    },
    {
      label: "Domestic Weapon Altercation (Coimbatore)",
      badge: "Fast Track",
      payload: {
        model: "ensemble",
        victim_age: 26,
        victim_sex: "Female",
        victim_race: "White",
        victim_count: 0,
        weapon: "Knife or cutting instrument",
        circumstance: "Lover triangle",
        relationship: "Wife",
        city: "Coimbatore",
        state: "Tamil Nadu",
        year: 2023,
        month: 3,
        is_weekend: 0,
        day_of_week: 2,
      },
    },
    {
      label: "Cold Case Night Homicide (Madurai)",
      badge: "Complex Triage",
      payload: {
        model: "ensemble",
        victim_age: 48,
        victim_sex: "Male",
        victim_race: "Asian",
        victim_count: 0,
        weapon: "Blunt object - hammer, club, etc",
        circumstance: "Argument over money",
        relationship: "Unknown",
        city: "Madurai",
        state: "Tamil Nadu",
        year: 2020,
        month: 11,
        is_weekend: 1,
        day_of_week: 7,
      },
    },
    {
      label: "Transit Hub Theft Dispute (Salem)",
      badge: "Sector Checkpoint",
      payload: {
        model: "ensemble",
        victim_age: 35,
        victim_sex: "Male",
        victim_race: "White",
        victim_count: 0,
        weapon: "Personal weapons, includes beating",
        circumstance: "Brawl due to influence of alcohol",
        relationship: "Stranger",
        city: "Salem",
        state: "Tamil Nadu",
        year: 2023,
        month: 5,
        is_weekend: 1,
        day_of_week: 6,
      },
    },
  ];

  const handlePredict = async (e?: React.FormEvent, customPayload?: SolvabilityPayload) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await crimoraApi.predictSolvability(customPayload || formData);
      setResult(res);
    } catch (err) {
      console.error("Solvability prediction failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: (typeof scenarioPresets)[0]) => {
    setFormData(preset.payload);
    handlePredict(undefined, preset.payload);
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM);
    setResult(null);
  };

  const getTriageBadge = (tier: string) => {
    switch (tier) {
      case "TIER-1":
        return <Badge variant="success" className="text-xs px-3 py-1 font-mono">Tier-1 Immediate Clearance</Badge>;
      case "TIER-2":
        return <Badge variant="warning" className="text-xs px-3 py-1 font-mono">Tier-2 High Priority</Badge>;
      default:
        return <Badge variant="danger" className="text-xs px-3 py-1 font-mono">Tier-3 Cold Case Review</Badge>;
    }
  };

  const getOperationalModelName = (name: string, key: string) => {
    if (key === "ann" || name.toLowerCase().includes("ann") || name.toLowerCase().includes("deep") || name.toLowerCase().includes("mlp")) {
      return "Deep Feature Analysis (ANN)";
    }
    if (key === "decision_tree_id3" || name.toLowerCase().includes("tree") || name.toLowerCase().includes("decision")) {
      return "Standard Triage Analysis (ID3)";
    }
    if (key === "knn" || name.toLowerCase().includes("knn") || name.toLowerCase().includes("neighbor")) {
      return "Historical Precedent Linker (k-NN)";
    }
    if (key === "naive_bayes" || name.toLowerCase().includes("bayes") || name.toLowerCase().includes("probabilistic")) {
      return "Initial Scene Intake Screener (Naive Bayes)";
    }
    if (key === "ensemble" || name.toLowerCase().includes("ensemble")) {
      return "Ensemble Consensus Verdict";
    }
    return name;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header - Enterprise High-Tech Blue Banner */}
      <div className="relative rounded-2xl p-6 md:p-8 bg-gradient-to-r from-slate-900/95 via-blue-950/40 to-slate-950/95 border border-blue-900/40 shadow-[0_12px_40px_rgba(0,0,0,0.55)] overflow-hidden hud-bracket glow-card-blue">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/15 border border-blue-500/40 text-[10px] font-mono uppercase tracking-[0.15em] text-blue-300 font-bold">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Clearance &amp; Triage Engine
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                ACTIVE INCIDENT SCORER
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Scale className="h-6 w-6 text-blue-400 stroke-[2.3]" />
              Case Solvability &amp; Triage Priority
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
              Consensus clearance scoring, golden-hour triage timelines, and evidence-driven detective directives.
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
            <Button
              onClick={() => handlePredict()}
              isLoading={loading}
              className="gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/30"
            >
              <Sparkles className="h-4 w-4 text-blue-200" />
              <span>Run Solvability Triage</span>
            </Button>
          </div>
        </div>
        <div className="cyber-scanline w-full mt-6" />
      </div>

      {/* User-Friendly Help Banner */}
      {showHelp && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-fade-in text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
            <Info className="h-4.5 w-4.5 text-blue-400" />
            Quick User Guide: How Solvability Triage Works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">1</span>
                Choose or Preload Case
              </div>
              <p className="text-[11px] text-slate-400">
                Click any of the quick scenario buttons below or select custom victim, weapon, and jurisdiction parameters in the left panel.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">2</span>
                Evaluate Likelihood
              </div>
              <p className="text-[11px] text-slate-400">
                The multi-engine model (ANN Neural Net, Decision Tree, Naive Bayes, k-NN) evaluates evidence strength against 106,000+ cases.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">3</span>
                Follow Recommended Actions
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect the triage tier (Tier-1, Tier-2, or Tier-3), the critical response time window, and the forensic checklist.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick-Load Incident Scenario Presets */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            1-Click Scenario Presets:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {scenarioPresets.map((sc, i) => (
            <button
              key={i}
              onClick={() => applyPreset(sc)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-blue-600/15 hover:border-blue-500/50 text-slate-300 hover:text-blue-200 text-xs font-medium transition-all flex items-center gap-2 shadow-sm"
            >
              <span>{sc.label}</span>
              <span className="text-[10px] font-mono text-blue-300 bg-blue-950/80 border border-blue-800/40 px-1.5 py-0.5 rounded">
                {sc.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Split-Screen Workspace: 5 Cols Left, 7 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (5 cols): Incident Parameters */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Layers className="h-5 w-5 text-blue-400" />
                  Incident Parameters
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Provide crime scene details to evaluate case clearance likelihood.
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetForm}
                className="text-[11px] gap-1 text-slate-400 hover:text-blue-300"
                title="Reset fields to defaults"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-5">
                <Select
                  label="Triage Analysis Mode"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  options={[
                    { label: "Ensemble Consensus Verdict (Recommended)", value: "ensemble" },
                    { label: "Deep Feature Analysis (ANN)", value: "ann" },
                    { label: "Standard Triage Analysis (ID3)", value: "decision_tree_id3" },
                  ]}
                />

                <div className="pt-1.5">
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

                <div className="grid grid-cols-2 gap-4">
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
                    label="Demographic Category"
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

                <div className="grid grid-cols-2 gap-4">
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

                <div className="grid grid-cols-2 gap-4">
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Calculate Clearance Likelihood</span>
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Primary Investigation Triage Output */}
        <div className="lg:col-span-7 space-y-8">
          {loading ? (
            <Card className="p-8 space-y-6 rounded-2xl hud-bracket glow-card-blue">
              <div className="flex items-center justify-between">
                <div className="h-5 w-40 bg-slate-800 animate-pulse rounded" />
                <div className="h-7 w-28 bg-slate-800 animate-pulse rounded-full" />
              </div>
              <div className="h-10 w-56 bg-slate-800 animate-pulse rounded" />
              <div className="h-3 w-full bg-slate-800 animate-pulse rounded-full" />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="h-20 bg-slate-800/60 animate-pulse rounded-xl" />
                <div className="h-20 bg-slate-800/60 animate-pulse rounded-xl" />
              </div>
              <div className="h-40 bg-slate-800/40 animate-pulse rounded-xl mt-3" />
            </Card>
          ) : result ? (
            <>
              {/* Verdict Summary Card */}
              <Card className="rounded-2xl hud-bracket glow-card-blue">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-[0.12em] text-blue-400 font-semibold">
                        Investigation Triage Verdict
                      </span>
                      <CardTitle className="text-xl mt-1 text-white">
                        Clearance Likelihood: {result.clearance_percentage}%
                      </CardTitle>
                    </div>
                    {getTriageBadge(result.triage_tier)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Holographic Circular & Linear Gauge */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-xl bg-slate-950/70 border border-blue-950/80 shadow-inner">
                    {/* Radial Arc */}
                    <div className="relative h-24 w-24 shrink-0">
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
                          strokeDashoffset={88 - (88 * result.clearance_percentage) / 100}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-lg font-mono font-extrabold text-white">
                          {result.clearance_percentage}%
                        </span>
                        <span className="text-[8px] font-mono uppercase text-blue-400">SCORE</span>
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-300">
                        <span>Clearance Probability Gauge</span>
                        <span className="font-mono text-blue-400 font-bold">
                          {result.clearance_percentage >= 70 ? "HIGH PROBABILITY" : "MODERATE RECOVERY"}
                        </span>
                      </div>
                      <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-400 transition-all duration-700 shadow-[0_0_12px_rgba(37,99,235,0.5)]"
                          style={{ width: `${Math.max(5, result.clearance_percentage)}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Consensus across multi-engine investigative telemetry correlates with historical closure patterns.
                      </p>
                    </div>
                  </div>

                  {/* Priority & Golden Window Targets */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span className="text-[11px] uppercase font-semibold text-slate-300 tracking-wider">Triage Priority</span>
                      </div>
                      <div className="text-base font-semibold text-white mt-1.5 font-mono">
                        {result.triage_priority}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <span className="text-[11px] uppercase font-semibold text-slate-300 tracking-wider">Golden Response Window</span>
                      </div>
                      <div className="text-base font-semibold text-white mt-1.5 font-mono">
                        {result.time_window_target}
                      </div>
                    </div>
                  </div>

                  {/* Operational Verdicts Breakdown Table */}
                  {result.verdicts && result.verdicts.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
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
                              <TableCell className="font-semibold text-xs text-slate-200">
                                {getOperationalModelName(v.model_name, v.model_key)}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-blue-400 font-bold">
                                {(v.probability * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell className="text-xs">
                                <span
                                  className={
                                    v.prediction === 1
                                      ? "text-blue-300 font-semibold bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30"
                                      : "text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20"
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
                  <div className="space-y-3 pt-2">
                    <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                      Recommended Detective Action Protocol
                    </div>
                    <div className="space-y-2">
                      {result.investigative_guidelines.map((guide, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 shadow-sm"
                        >
                          <ChevronRight className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{guide}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Response Window Clearance Retention Curve */}
              <Card className="rounded-2xl hud-bracket glow-card-cyan">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Case Clearance Probability by Lead Response Window</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Resolution probability drops significantly as lead response exceeds initial 72 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-64 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={leadWindowRetentionData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E345A" />
                      <XAxis dataKey="window" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} domain={[0, 100]} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0B1528",
                          borderColor: "#1E345A",
                          borderRadius: "10px",
                          fontSize: "12px",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                          color: "#F1F5F9",
                        }}
                        formatter={(val: any) => [`${val}%`, "Clearance Probability"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="clearance_pct"
                        stroke="#38BDF8"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#blueGrad)"
                        name="Clearance Probability"
                      />
                      <Line
                        type="monotone"
                        dataKey="historical_avg"
                        stroke="#64748B"
                        strokeDasharray="4 4"
                        strokeWidth={1.5}
                        name="Historical Average"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-16 text-center h-[480px] rounded-2xl hud-bracket">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                <Scale className="h-8 w-8 text-blue-400 stroke-[2.3]" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Awaiting Case Parameters
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
                Select a quick-load scenario preset above or configure incident metadata in the left workspace and click &quot;Calculate Clearance Likelihood&quot; to compute triage tier and golden-hour response directives.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
