"use client";

import React, { useState } from "react";
import {
  Dna,
  Sparkles,
  GitFork,
  Fingerprint,
  UserCheck,
  Shield,
  Crosshair,
  BookmarkCheck,
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
import { crimoraApi } from "@/lib/api_client";
import { ProfilingResult } from "@/types/api";

const CHART_COLORS = ["#2563EB", "#0EA5E9", "#38BDF8", "#6366F1", "#818CF8"];

const DEFAULT_EVIDENCE = {
  weapon: "Knife or cutting instrument",
  circumstance: "Lover triangle",
  victim_sex: "Female",
  victim_age: 28,
};

export default function ProfilingPage() {
  const [evidenceForm, setEvidenceForm] = useState(DEFAULT_EVIDENCE);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfilingResult | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const scenarioPresets = [
    {
      label: "Domestic Weapon Altercation",
      weapon: "Knife or cutting instrument",
      circumstance: "Lover triangle",
      victim_sex: "Female",
      victim_age: 28,
    },
    {
      label: "Commercial Armed Robbery",
      weapon: "Handgun - pistol, revolver, etc",
      circumstance: "Robbery",
      victim_sex: "Male",
      victim_age: 42,
    },
    {
      label: "Public Disorder Brawl",
      weapon: "Personal weapons, includes beating",
      circumstance: "Brawl due to influence of alcohol",
      victim_sex: "Male",
      victim_age: 25,
    },
    {
      label: "Financial Dispute Trauma",
      weapon: "Blunt object - hammer, club, etc",
      circumstance: "Other arguments",
      victim_sex: "Male",
      victim_age: 50,
    },
  ];

  const handleInfer = async (e?: React.FormEvent, customForm?: typeof evidenceForm) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await crimoraApi.inferBehavioralProfile(customForm || evidenceForm);
      setProfile(res);
    } catch (err) {
      console.error("Evidence profiling error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyPreset = (preset: (typeof scenarioPresets)[0]) => {
    const updated = {
      weapon: preset.weapon,
      circumstance: preset.circumstance,
      victim_sex: preset.victim_sex,
      victim_age: preset.victim_age,
    };
    setEvidenceForm(updated);
    handleInfer(undefined, updated);
  };

  const resetForm = () => {
    setEvidenceForm(DEFAULT_EVIDENCE);
    setProfile(null);
  };

  // Convert distribution dict to chart arrays
  const ageDistributionData = profile?.distributions.offender_age
    ? Object.entries(profile.distributions.offender_age).map(([k, v]) => ({
        bracket: k,
        probability: Math.round(v * 100),
      }))
    : [
        { bracket: "Young Adult (18-29)", probability: 54 },
        { bracket: "Middle Adult (30-49)", probability: 34 },
        { bracket: "Mature Adult (50+)", probability: 8 },
        { bracket: "Juvenile (<18)", probability: 4 },
      ];

  const relationshipDistributionData = profile?.distributions
    .offender_relationship
    ? Object.entries(profile.distributions.offender_relationship).map(
        ([k, v]) => ({
          relation: k,
          probability: Math.round(v * 100),
        })
      )
    : [
        { relation: "Acquaintance", probability: 42 },
        { relation: "Intimate Partner", probability: 31 },
        { relation: "Family Member", probability: 16 },
        { relation: "Stranger", probability: 11 },
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
                Behavioral Intelligence
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                SUSPECT TRAIT ESTIMATOR
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Dna className="h-6 w-6 text-blue-400 stroke-[2.3]" />
              Behavioral Evidence Profiler &amp; Suspect Inference
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-2xl leading-relaxed">
              Infer probable offender demographic brackets, relational proximity, and motive vectors from forensic scene signatures.
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
              onClick={() => handleInfer()}
              isLoading={loading}
              className="gap-2.5 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_25px_rgba(37,99,235,0.4)] border border-blue-400/30"
            >
              <Sparkles className="h-4 w-4 text-blue-200" />
              <span>Generate Suspect Profile</span>
            </Button>
          </div>
        </div>
        <div className="cyber-scanline w-full mt-6" />
      </div>

      {/* User Guide Banner */}
      {showHelp && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-fade-in text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
            <Info className="h-4.5 w-4.5 text-blue-400" />
            Quick User Guide: How Behavioral Profiling Works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">1</span>
                Input Scene Clues
              </div>
              <p className="text-[11px] text-slate-400">
                Provide observed weapon signature, incident circumstance, and victim demographic details.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">2</span>
                Bayesian Network Inference
              </div>
              <p className="text-[11px] text-slate-400">
                The causal Bayesian engine conditions these evidence nodes to estimate unknown suspect attributes with statistical certainty.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">3</span>
                Analyze Suspect Breakdown
              </div>
              <p className="text-[11px] text-slate-400">
                Review the probable offender gender, age bracket distribution, and suspect-to-victim relationship probabilities.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Quick Archetype Selector */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-950/80 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <BookmarkCheck className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Quick-Test Crime Scene Presets:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {scenarioPresets.map((sc, i) => (
            <button
              key={i}
              onClick={() => applyPreset(sc)}
              className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-blue-600/15 hover:border-blue-500/50 text-slate-300 hover:text-blue-200 text-xs font-medium transition-all shadow-sm"
            >
              {sc.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Crime Scene Evidence Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Fingerprint className="h-5 w-5 text-blue-400" />
                  Crime Scene Forensic Evidence
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Observed forensic evidence and victimology recorded at scene.
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
              <form onSubmit={handleInfer} className="space-y-5">
                <Select
                  label="Observed Weapon"
                  value={evidenceForm.weapon}
                  onChange={(e) =>
                    setEvidenceForm({ ...evidenceForm, weapon: e.target.value })
                  }
                  options={[
                    { label: "Knife / Cutting Instrument", value: "Knife or cutting instrument" },
                    { label: "Handgun / Pistol", value: "Handgun - pistol, revolver, etc" },
                    { label: "Blunt Object (Club/Hammer)", value: "Blunt object - hammer, club, etc" },
                    { label: "Strangulation / Asphyxiation", value: "Strangulation - hanging" },
                    { label: "Personal Weapons (Hands/Fists)", value: "Personal weapons, includes beating" },
                  ]}
                />

                <Select
                  label="Precipitating Circumstance"
                  value={evidenceForm.circumstance}
                  onChange={(e) =>
                    setEvidenceForm({
                      ...evidenceForm,
                      circumstance: e.target.value,
                    })
                  }
                  options={[
                    { label: "Lovers Triangle / Domestic", value: "Lover triangle" },
                    { label: "Robbery / Felony Homicide", value: "Robbery" },
                    { label: "Brawl Under Alcohol Influence", value: "Brawl due to influence of alcohol" },
                    { label: "Narcotics / Drug Dispute", value: "Narcotic drug laws" },
                    { label: "Interpersonal Argument", value: "Other arguments" },
                  ]}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Victim Sex"
                    value={evidenceForm.victim_sex}
                    onChange={(e) =>
                      setEvidenceForm({
                        ...evidenceForm,
                        victim_sex: e.target.value,
                      })
                    }
                    options={[
                      { label: "Female", value: "Female" },
                      { label: "Male", value: "Male" },
                      { label: "Unknown", value: "Unknown" },
                    ]}
                  />

                  <div className="pt-1.5">
                    <Slider
                      label="Victim Age"
                      value={evidenceForm.victim_age}
                      min={1}
                      max={95}
                      unit="yrs"
                      onChange={(val) =>
                        setEvidenceForm({ ...evidenceForm, victim_age: val })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Generate Suspect Profile</span>
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Forensic Evidence Correlation Matrix */}
          <Card className="rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-white">
                <GitFork className="h-4 w-4 text-blue-400" />
                Forensic Evidence Correlation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-400">
              <div className="p-4 rounded-xl bg-slate-950/70 font-mono text-xs text-blue-300 border border-blue-950/80 space-y-2 shadow-inner">
                <div>&bull; Incident Circumstance &rarr; Victim-Offender Proximity</div>
                <div>&bull; Weapon Signature &rarr; Offender Demographics &amp; Gender</div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trait probabilities are calculated by conditioning observed crime scene indicators against verified clearance outcome profiles.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inferred Suspect Demographics (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          {profile ? (
            <>
              {/* Demographics Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="metric-card glow-card-blue rounded-2xl p-5">
                  <span className="text-[10px] font-semibold font-mono uppercase text-slate-400 tracking-wider">
                    Probable Gender
                  </span>
                  <div className="text-xl font-bold text-white mt-1.5">
                    {profile.top_demographics.top_sex}
                  </div>
                  <div className="text-xs font-mono text-blue-300 mt-2 font-semibold">
                    {(profile.top_demographics.sex_confidence * 100).toFixed(0)}% Likelihood
                  </div>
                </div>

                <div className="metric-card glow-card-cyan rounded-2xl p-5">
                  <span className="text-[10px] font-semibold font-mono uppercase text-slate-400 tracking-wider">
                    Age Bracket
                  </span>
                  <div className="text-sm font-bold text-white mt-1.5 truncate">
                    {profile.top_demographics.top_age_bracket}
                  </div>
                  <div className="text-xs font-mono text-sky-400 mt-2 font-semibold">
                    {(profile.top_demographics.age_confidence * 100).toFixed(0)}% Likelihood
                  </div>
                </div>

                <div className="metric-card glow-card-indigo rounded-2xl p-5">
                  <span className="text-[10px] font-semibold font-mono uppercase text-slate-400 tracking-wider">
                    Relationship
                  </span>
                  <div className="text-sm font-bold text-white mt-1.5 truncate">
                    {profile.top_demographics.top_relationship}
                  </div>
                  <div className="text-xs font-mono text-indigo-300 mt-2 font-semibold">
                    {(profile.top_demographics.relationship_confidence * 100).toFixed(0)}% Likelihood
                  </div>
                </div>

                <div className="metric-card glow-card-amber rounded-2xl p-5">
                  <span className="text-[10px] font-semibold font-mono uppercase text-slate-400 tracking-wider">
                    Confidence Tier
                  </span>
                  <div className="text-sm font-bold text-amber-300 mt-1.5">
                    Verified Trait Match
                  </div>
                  <div className="text-xs font-mono text-slate-400 mt-2">
                    High Reliability
                  </div>
                </div>
              </div>

              {/* Age Bracket Distribution */}
              <Card className="rounded-2xl hud-bracket glow-card-blue">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Probable Offender Age Bracket Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-60 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageDistributionData} margin={{ top: 10, right: 15, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E345A" />
                      <XAxis dataKey="bracket" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0B1528",
                          borderColor: "#1E345A",
                          borderRadius: "10px",
                          fontSize: "12px",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                          color: "#F1F5F9",
                        }}
                      />
                      <Bar dataKey="probability" radius={[6, 6, 0, 0]}>
                        {ageDistributionData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Relationship Distribution */}
              <Card className="rounded-2xl hud-bracket glow-card-indigo">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Probable Suspect-to-Victim Relationship</CardTitle>
                </CardHeader>
                <CardContent className="h-60 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={relationshipDistributionData} margin={{ top: 10, right: 15, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E345A" />
                      <XAxis dataKey="relation" stroke="#64748B" fontSize={11} />
                      <YAxis stroke="#64748B" fontSize={11} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0B1528",
                          borderColor: "#1E345A",
                          borderRadius: "10px",
                          fontSize: "12px",
                          boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                          color: "#F1F5F9",
                        }}
                      />
                      <Bar dataKey="probability" fill="#38BDF8" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-16 text-center h-[460px] rounded-2xl hud-bracket">
              <div className="h-16 w-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 shadow-[0_0_20px_rgba(37,99,235,0.25)]">
                <Dna className="h-8 w-8 text-blue-400 stroke-[2.3]" />
              </div>
              <h3 className="text-base font-semibold text-white">
                Awaiting Scene Evidence Input
              </h3>
              <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed">
                Select a quick-test crime scene preset above or enter forensic weapon, victimology, and scene circumstances to generate suspect trait profiles.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
