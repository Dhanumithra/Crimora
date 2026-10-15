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
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Slider } from "@/components/ui/Slider";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { SolvabilityPayload, SolvabilityResult } from "@/types/api";

const rocBenchmarkData = [
  { fpr: 0.0, ann: 0.0, tree: 0.0, nb: 0.0, knn: 0.0, baseline: 0.0 },
  { fpr: 0.1, ann: 0.58, tree: 0.45, nb: 0.4, knn: 0.42, baseline: 0.1 },
  { fpr: 0.2, ann: 0.74, tree: 0.62, nb: 0.55, knn: 0.6, baseline: 0.2 },
  { fpr: 0.3, ann: 0.82, tree: 0.71, nb: 0.65, knn: 0.7, baseline: 0.3 },
  { fpr: 0.4, ann: 0.88, tree: 0.78, nb: 0.72, knn: 0.76, baseline: 0.4 },
  { fpr: 0.6, ann: 0.94, tree: 0.87, nb: 0.83, knn: 0.86, baseline: 0.6 },
  { fpr: 0.8, ann: 0.98, tree: 0.94, nb: 0.91, knn: 0.93, baseline: 0.8 },
  { fpr: 1.0, ann: 1.0, tree: 1.0, nb: 1.0, knn: 1.0, baseline: 1.0 },
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

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              MODULE 05
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              MULTI-MODEL INFERENCE
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Scale className="h-7 w-7 text-sky-400" />
            Case Solvability & Clearance Prediction
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Execute real-time case clearance triage combining deep neural inference
            with multi-model consensus decision classifiers.
          </p>
        </div>

        <Button
          onClick={() => handlePredict()}
          isLoading={loading}
          size="md"
          className="gap-2 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Run Solvability Triage
        </Button>
      </div>

      {/* Main Grid: Form Left, Results & Charts Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Case Attributes & Triage Input</CardTitle>
              <CardDescription>
                Provide crime scene incident metadata to query pre-trained
                models.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePredict} className="space-y-4">
                <Select
                  label="Classifier Architecture"
                  value={formData.model}
                  onChange={(e) =>
                    setFormData({ ...formData, model: e.target.value })
                  }
                  options={[
                    { label: "Multi-Model Consensus Ensemble", value: "ensemble" },
                    { label: "Deep Learning Clearance Engine", value: "ann" },
                    { label: "Hierarchical Decision Classifier", value: "decision_tree_id3" },
                    { label: "Probabilistic Clearance Screener", value: "naive_bayes" },
                    { label: "Spatial Neighborhood Classifier", value: "knn" },
                  ]}
                />

                <div className="pt-2">
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
                    label="Victim Race"
                    value={formData.victim_race}
                    onChange={(e) =>
                      setFormData({ ...formData, victim_race: e.target.value })
                    }
                    options={[
                      { label: "Black", value: "Black" },
                      { label: "White", value: "White" },
                      { label: "Asian", value: "Asian" },
                      { label: "Native American", value: "Native American" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                  />
                </div>

                <Select
                  label="Weapon / M.O."
                  value={formData.weapon}
                  onChange={(e) =>
                    setFormData({ ...formData, weapon: e.target.value })
                  }
                  options={[
                    { label: "Handgun - pistol, revolver, etc", value: "Handgun - pistol, revolver, etc" },
                    { label: "Knife or cutting instrument", value: "Knife or cutting instrument" },
                    { label: "Blunt object - hammer, club, etc", value: "Blunt object - hammer, club, etc" },
                    { label: "Firearm, type not stated", value: "Firearm, type not stated" },
                    { label: "Shotgun", value: "Shotgun" },
                    { label: "Rifle", value: "Rifle" },
                    { label: "Strangulation - hanging", value: "Strangulation - hanging" },
                    { label: "Personal weapons (hands, fists)", value: "Personal weapons, includes beating" },
                  ]}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Circumstance"
                    value={formData.circumstance}
                    onChange={(e) =>
                      setFormData({ ...formData, circumstance: e.target.value })
                    }
                    options={[
                      { label: "Robbery", value: "Robbery" },
                      { label: "Lovers triangle", value: "Lover triangle" },
                      { label: "Brawl due to alcohol", value: "Brawl due to influence of alcohol" },
                      { label: "Narcotics drug dispute", value: "Narcotic drug laws" },
                      { label: "Argument over money", value: "Argument over money" },
                      { label: "Other arguments", value: "Other arguments" },
                      { label: "Gangland killings", value: "Gangland killings" },
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
                      { label: "Wife / Husband", value: "Wife" },
                      { label: "Girlfriend / Boyfriend", value: "Girlfriend" },
                      { label: "Friend", value: "Friend" },
                      { label: "Family member", value: "Family" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="Incident City / District"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    options={[
                      { label: "Los Angeles", value: "Los Angeles" },
                      { label: "Chennai", value: "Chennai" },
                      { label: "Madurai", value: "Madurai" },
                      { label: "Coimbatore", value: "Coimbatore" },
                      { label: "Chicago", value: "Chicago" },
                      { label: "Houston", value: "Houston" },
                    ]}
                  />

                  <Select
                    label="State / Region"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    options={[
                      { label: "California", value: "California" },
                      { label: "Tamil Nadu", value: "Tamil Nadu" },
                      { label: "Illinois", value: "Illinois" },
                      { label: "Texas", value: "Texas" },
                      { label: "New York", value: "New York" },
                    ]}
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-full mt-4"
                >
                  Calculate Clearance Likelihood
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Output: 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <>
              {/* Verdict Summary Card */}
              <Card className="border-sky-500/30 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs uppercase font-mono tracking-wider text-sky-400">
                        Inference Verdict
                      </div>
                      <CardTitle className="text-xl mt-1">
                        Case Clearance Likelihood: {result.clearance_percentage}%
                      </CardTitle>
                    </div>
                    {getTriageBadge(result.triage_tier)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Ring / Gauge Bar */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5 text-slate-300">
                      <span>Predicted Clearance Likelihood</span>
                      <span className="font-mono text-sky-400 font-bold">
                        {result.clearance_percentage}%
                      </span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-400 to-emerald-400 transition-all duration-700 shadow-glow"
                        style={{ width: `${Math.max(5, result.clearance_percentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Priority & Window Target */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span>Triage Priority</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {result.triage_priority}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-lg border border-slate-800 bg-slate-950/60">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="h-4 w-4 text-sky-400" />
                        <span>Golden Window Target</span>
                      </div>
                      <div className="text-sm font-semibold text-slate-200 mt-1 font-mono">
                        {result.time_window_target}
                      </div>
                    </div>
                  </div>

                  {/* Multi-Model Verdicts Breakdown */}
                  {result.verdicts && result.verdicts.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Multi-Model Breakdown
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Model</TableHead>
                            <TableHead>Probability</TableHead>
                            <TableHead>Verdict</TableHead>
                            <TableHead>Confidence</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.verdicts.map((v) => (
                            <TableRow key={v.model_key}>
                              <TableCell className="font-medium text-slate-300">
                                {v.model_name}
                              </TableCell>
                              <TableCell className="font-mono text-sky-400 font-bold">
                                {(v.probability * 100).toFixed(1)}%
                              </TableCell>
                              <TableCell>
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

                  {/* Investigative Action Items */}
                  <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tactical Investigative Guidelines
                    </div>
                    <div className="space-y-1.5">
                      {result.investigative_guidelines.map((guide, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300"
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
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-12 text-center h-80">
              <Scale className="h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-300">
                No Active Solvability Query
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Configure the case parameters on the left and click &quot;Run
                Solvability Triage&quot; to compute inference probabilities across
                Configure the case parameters on the left and click &quot;Run
                Solvability Triage&quot; to compute inference probabilities across
                active consensus classifiers.
              </p>
            </Card>
          )}

          {/* Model Diagnostic Benchmark ROC Curves */}
          <Card>
            <CardHeader>
              <CardTitle>
                <TrendingUp className="h-5 w-5 text-sky-400" />
                ROC-AUC Diagnostic Clearance Curves
              </CardTitle>
              <CardDescription>
                Validation ROC performance: Deep Learning Clearance Engine (AUC 0.814)
                alongside consensus decision classifiers.
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rocBenchmarkData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="fpr"
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: "False Positive Rate (FPR)",
                      position: "insideBottom",
                      offset: -5,
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    label={{
                      value: "True Positive Rate (TPR)",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#64748b",
                      fontSize: 10,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0d1322",
                      borderColor: "#1e293b",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ann"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    name="Deep Learning Engine (AUC 0.814)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="tree"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Hierarchical Tree (AUC 0.762)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="knn"
                    stroke="#a855f7"
                    strokeWidth={1.8}
                    name="Neighborhood Classifier (AUC 0.751)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="nb"
                    stroke="#f59e0b"
                    strokeWidth={1.8}
                    name="Probabilistic Screener (AUC 0.718)"
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="baseline"
                    stroke="#475569"
                    strokeDasharray="4 4"
                    name="Uninformed Baseline"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
