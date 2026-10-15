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
  Camera,
  Fingerprint,
  Eye,
  Crosshair,
  Car,
  Check,
  ShieldAlert,
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
  model: "ann",
  victim_age: 32,
  victim_sex: "Male",
  victim_race: "Indian / General",
  victim_count: 0,
  weapon: "Knife or cutting instrument",
  circumstance: "Robbery",
  suspect_lead_status: "UNKNOWN_OFFENDER",
  cctv_footage: false,
  forensic_dna_fingerprints: false,
  eyewitness_present: false,
  weapon_recovered: false,
  vehicle_identified: false,
  city: "Chennai",
  state: "Tamil Nadu",
  year: 2024,
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
      label: "High-Evidence Bank/Store Robbery (Chennai)",
      badge: "High Clearance Window",
      payload: {
        model: "ann",
        victim_age: 34,
        victim_sex: "Male",
        victim_race: "Indian / General",
        victim_count: 0,
        weapon: "Knife or cutting instrument",
        circumstance: "Robbery",
        suspect_lead_status: "NAMED_SUSPECT",
        cctv_footage: true,
        forensic_dna_fingerprints: true,
        eyewitness_present: true,
        weapon_recovered: true,
        vehicle_identified: true,
        city: "Chennai",
        state: "Tamil Nadu",
        year: 2024,
        month: 8,
        is_weekend: 1,
        day_of_week: 6,
      },
    },
    {
      label: "Preceding Market Altercation (Salem)",
      badge: "Witnessed Dispute",
      payload: {
        model: "ann",
        victim_age: 29,
        victim_sex: "Male",
        victim_race: "Indian / General",
        victim_count: 0,
        weapon: "Blunt object - hammer, club, etc",
        circumstance: "Brawl due to influence of alcohol",
        suspect_lead_status: "CIRCUMSTANTIAL_DISPUTE",
        cctv_footage: false,
        forensic_dna_fingerprints: true,
        eyewitness_present: true,
        weapon_recovered: true,
        vehicle_identified: false,
        city: "Salem",
        state: "Tamil Nadu",
        year: 2024,
        month: 5,
        is_weekend: 0,
        day_of_week: 3,
      },
    },
    {
      label: "Cold Transit Snatching Case (Madurai)",
      badge: "Zero Immediate Leads",
      payload: {
        model: "ann",
        victim_age: 48,
        victim_sex: "Female",
        victim_race: "Indian / General",
        victim_count: 0,
        weapon: "Personal weapons, includes beating",
        circumstance: "Robbery",
        suspect_lead_status: "UNKNOWN_OFFENDER",
        cctv_footage: false,
        forensic_dna_fingerprints: false,
        eyewitness_present: false,
        weapon_recovered: false,
        vehicle_identified: false,
        city: "Madurai",
        state: "Tamil Nadu",
        year: 2023,
        month: 11,
        is_weekend: 1,
        day_of_week: 7,
      },
    },
    {
      label: "Night Industrial Break-In (Coimbatore)",
      badge: "Optical CCTV Tracked",
      payload: {
        model: "ann",
        victim_age: 41,
        victim_sex: "Male",
        victim_race: "Indian / General",
        victim_count: 0,
        weapon: "Blunt object - hammer, club, etc",
        circumstance: "Robbery",
        suspect_lead_status: "UNKNOWN_OFFENDER",
        cctv_footage: true,
        forensic_dna_fingerprints: true,
        eyewitness_present: false,
        weapon_recovered: false,
        vehicle_identified: true,
        city: "Coimbatore",
        state: "Tamil Nadu",
        year: 2024,
        month: 2,
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

  const toggleEvidence = (field: keyof SolvabilityPayload) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
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
                TAMIL NADU STATE POLICE
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Scale className="h-6 w-6 text-blue-400 stroke-[2.3]" />
              Case Solvability &amp; Triage Assessment
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
              Scene evidence clearance likelihood evaluation, golden-hour triage prioritization, and investigative action directives.
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
              <span>Calculate Clearance Likelihood</span>
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
            Investigative User Guide: How Solvability Assessment Works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">1</span>
                Initial Suspect Status
              </div>
              <p className="text-[11px] text-slate-400">
                In an unsolved incident, the perpetrator is unknown. Select whether witnesses saw an altercation, if a named person of interest exists, or if the offender fled completely undetected.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">2</span>
                Forensic &amp; Physical Leads
              </div>
              <p className="text-[11px] text-slate-400">
                Toggle the evidence recovered from the scene (CCTV, DNA, fingerprints, eyewitnesses, weapon). These are the strongest scientific determinants of case clearance.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">3</span>
                Unified AI Prediction
              </div>
              <p className="text-[11px] text-slate-400">
                The Crimora Deep Neural Engine evaluates the combined evidence to provide a single, authoritative solvability score and tailored tactical detective directives.
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
                  Incident Scene Parameters
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Input crime scene factors and physical evidence to assess clearance odds.
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
                {/* Jurisdiction - Pure Tamil Nadu */}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Jurisdiction City"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    options={[
                      { label: "Chennai Metropolitan", value: "Chennai" },
                      { label: "Coimbatore City", value: "Coimbatore" },
                      { label: "Madurai South", value: "Madurai" },
                      { label: "Tiruchirappalli Delta", value: "Tiruchirappalli" },
                      { label: "Salem Junction", value: "Salem" },
                      { label: "Tirunelveli Division", value: "Tirunelveli" },
                      { label: "Tiruppur Industrial", value: "Tiruppur" },
                      { label: "Vellore Fort", value: "Vellore" },
                      { label: "Erode Commercial", value: "Erode" },
                      { label: "Thanjavur Town", value: "Thanjavur" },
                      { label: "Dindigul Central", value: "Dindigul" },
                      { label: "Kanchipuram Division", value: "Kanchipuram" },
                    ]}
                  />

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Region / State
                    </label>
                    <div className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-blue-300 font-mono flex items-center justify-between">
                      <span>Tamil Nadu (State Police)</span>
                      <span className="h-2 w-2 rounded-full bg-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Suspect Lead Status (Replaces the illogical Relationship field) */}
                <Select
                  label="Initial Suspect Lead Status at Scene"
                  value={formData.suspect_lead_status || "UNKNOWN_OFFENDER"}
                  onChange={(e) =>
                    setFormData({ ...formData, suspect_lead_status: e.target.value })
                  }
                  options={[
                    { label: "Unidentified Offender (Zero Leads at Crime Scene)", value: "UNKNOWN_OFFENDER" },
                    { label: "Witnessed Dispute Preceding Incident (Quarrel Observed)", value: "CIRCUMSTANTIAL_DISPUTE" },
                    { label: "Specific Person of Interest / Named Suspect Lead", value: "NAMED_SUSPECT" },
                    { label: "Domestic / Household Dispute Reported", value: "INTIMATE_DOMESTIC" },
                  ]}
                />

                {/* Physical & Forensic Leads Recovered (Interactive Toggle Chips) */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Physical &amp; Forensic Leads Recovered
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { key: "cctv_footage", label: "CCTV Footage Recovered", icon: Camera },
                      { key: "forensic_dna_fingerprints", label: "DNA / Latent Prints", icon: Fingerprint },
                      { key: "eyewitness_present", label: "Direct Eyewitness Recorded", icon: Eye },
                      { key: "weapon_recovered", label: "Weapon / Ballistics Recovered", icon: Crosshair },
                      { key: "vehicle_identified", label: "Vehicle / Plate Tracked", icon: Car },
                    ].map((lead) => {
                      const Icon = lead.icon;
                      const active = !!(formData as any)[lead.key];
                      return (
                        <button
                          key={lead.key}
                          type="button"
                          onClick={() => toggleEvidence(lead.key as any)}
                          className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-between gap-2 text-left ${
                            active
                              ? "bg-blue-600/25 border-blue-500 text-blue-200 shadow-[0_0_15px_rgba(37,99,235,0.2)] font-semibold"
                              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Icon className={`h-3.5 w-3.5 ${active ? "text-blue-400" : "text-slate-500"}`} />
                            <span>{lead.label}</span>
                          </div>
                          {active && (
                            <span className="h-4 w-4 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0">
                              <Check className="h-2.5 w-2.5 stroke-[3]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Circumstance & Weapon */}
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Crime Circumstance"
                    value={formData.circumstance}
                    onChange={(e) =>
                      setFormData({ ...formData, circumstance: e.target.value })
                    }
                    options={[
                      { label: "Robbery / Armed Heist", value: "Robbery" },
                      { label: "Residential Intrusion", value: "Burglary" },
                      { label: "Violent Brawl / Public Dispute", value: "Brawl due to influence of alcohol" },
                      { label: "Financial / Business Dispute", value: "Argument over money" },
                      { label: "Domestic Altercation", value: "Lover triangle" },
                      { label: "Transit Snatching / Mugging", value: "Other" },
                    ]}
                  />

                  <Select
                    label="Weapon / M.O. Signature"
                    value={formData.weapon}
                    onChange={(e) =>
                      setFormData({ ...formData, weapon: e.target.value })
                    }
                    options={[
                      { label: "Knife / Edged Weapon", value: "Knife or cutting instrument" },
                      { label: "Blunt Object (Rod/Club)", value: "Blunt object - hammer, club, etc" },
                      { label: "Country Pistol / Firearm", value: "Handgun - pistol, revolver, etc" },
                      { label: "Personal Weapons (Hands/Fists)", value: "Personal weapons, includes beating" },
                      { label: "Firearm, unspecified", value: "Firearm, type not stated" },
                    ]}
                  />
                </div>

                {/* Victim Profile */}
                <div className="space-y-4 pt-1">
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
                        { label: "Other / Unspecified", value: "Unknown" },
                      ]}
                    />

                    <Select
                      label="Victim Count"
                      value={String(formData.victim_count)}
                      onChange={(e) =>
                        setFormData({ ...formData, victim_count: Number(e.target.value) })
                      }
                      options={[
                        { label: "Single Victim", value: "0" },
                        { label: "2 Victims", value: "1" },
                        { label: "3+ Victims", value: "2" },
                      ]}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Evaluating Evidence...</span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Assess Case Solvability</span>
                    </>
                  )}
                </button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (7 cols): Single AI Solvability Result & Directives */}
        <div className="lg:col-span-7 space-y-6">
          {result ? (
            <>
              {/* Primary Solvability Card */}
              <Card className="rounded-2xl hud-bracket glow-card-blue">
                <CardHeader className="pb-3 border-b border-slate-800/80">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] font-mono uppercase text-blue-400 tracking-wider font-semibold">
                        {result.model_selected}
                      </div>
                      <CardTitle className="text-xl text-white mt-1">
                        Case Clearance Likelihood: {result.clearance_percentage.toFixed(1)}%
                      </CardTitle>
                    </div>
                    <div>
                      <Badge
                        variant={
                          result.clearance_percentage >= 70
                            ? "success"
                            : result.clearance_percentage >= 45
                            ? "warning"
                            : "danger"
                        }
                        className="text-xs px-3 py-1 font-mono uppercase"
                      >
                        {result.triage_tier}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pt-5">
                  {/* Holographic Clearance Gauge & Operational Window */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-blue-950/30 to-slate-900 border border-blue-900/50 shadow-inner flex flex-col md:flex-row items-center gap-8">
                    <div className="relative h-32 w-32 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke="#1e345a"
                          strokeWidth="8"
                          fill="transparent"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="42"
                          stroke={
                            result.clearance_percentage >= 70
                              ? "#3b82f6"
                              : result.clearance_percentage >= 45
                              ? "#f59e0b"
                              : "#ef4444"
                          }
                          strokeWidth="8"
                          strokeDasharray="264"
                          strokeDashoffset={
                            264 - (264 * result.clearance_percentage) / 100
                          }
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-2xl font-black font-mono text-white">
                          {result.clearance_percentage.toFixed(1)}%
                        </span>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-blue-300">
                          SOLVABILITY
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 flex-1 w-full">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Triage Classification:</span>
                        <span className="font-bold text-white">{result.triage_priority}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-mono">Golden Response Target:</span>
                        <span className="font-mono font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/40">
                          ⏱️ {result.time_window_target}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-2 border border-slate-800 overflow-hidden mt-2">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${
                            result.clearance_percentage >= 70
                              ? "bg-gradient-to-r from-blue-500 to-sky-400"
                              : result.clearance_percentage >= 45
                              ? "bg-gradient-to-r from-amber-500 to-yellow-400"
                              : "bg-gradient-to-r from-rose-600 to-rose-400"
                          }`}
                          style={{ width: `${result.clearance_percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Evidentiary Impact Assessment */}
                  {result.evidentiary_factors && result.evidentiary_factors.length > 0 && (
                    <div className="space-y-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
                        <span>Evidentiary Impact Assessment</span>
                        <span className="text-slate-500 text-[10px]">Factor Influence on Score</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {result.evidentiary_factors.map((factor, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-slate-200">{factor.factor}</div>
                              <div className="text-[11px] text-slate-400">{factor.description}</div>
                            </div>
                            <span
                              className={`font-mono font-bold px-2.5 py-1 rounded text-xs shrink-0 ${
                                factor.status === "POSITIVE"
                                  ? "bg-blue-500/15 text-blue-300 border border-blue-500/30"
                                  : "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {factor.impact_pct > 0 ? `+${factor.impact_pct}%` : `${factor.impact_pct}%`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detective Action Protocol */}
                  <div className="space-y-3 pt-1">
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
              <Card className="rounded-2xl hud-bracket glow-card-blue">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Case Clearance Probability by Lead Response Window</CardTitle>
                  <CardDescription className="text-xs mt-1">
                    Resolution likelihood decreases sharply as critical response time extends past initial 72 hours.
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
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-16 text-center h-[520px] rounded-2xl hud-bracket">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                <Scale className="h-8 w-8 text-blue-400 stroke-[2.3]" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Awaiting Incident Parameters
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                Choose a 1-click scenario preset above or configure scene parameters and evidence in the left panel to execute solvability triage.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
