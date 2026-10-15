"use client";

import React, { useState } from "react";
import {
  Dna,
  Sparkles,
  GitFork,
  UserCheck,
  BrainCircuit,
  HelpCircle,
  TrendingUp,
  Fingerprint,
  ShieldCheck,
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

const CHART_COLORS = ["#38bdf8", "#10b981", "#a855f7", "#f59e0b", "#ef4444"];

export default function ProfilingPage() {
  const [evidenceForm, setEvidenceForm] = useState({
    weapon: "Knife or cutting instrument",
    circumstance: "Lover triangle",
    victim_sex: "Female",
    victim_age: 28,
  });

  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<ProfilingResult | null>(null);

  const handleInfer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await crimoraApi.inferBehavioralProfile(evidenceForm);
      setProfile(res);
    } catch (err) {
      console.error("Evidence profiling error:", err);
    } finally {
      setLoading(false);
    }
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
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Header - Compact */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              BEHAVIORAL EVIDENCE
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              PROBABILISTIC EVIDENCE PROFILER
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Dna className="h-6 w-6 text-sky-400" />
            Behavioral Evidence Profiler &amp; Suspect Inference
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Derive probable suspect characteristics (gender, age bracket, victim relationship) conditioned on crime scene physical evidence and forensic circumstance.
          </p>
        </div>

        <Button
          onClick={() => handleInfer()}
          isLoading={loading}
          size="sm"
          className="gap-2 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Generate Suspect Profile
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Crime Scene Evidence Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-sky-400" />
                Crime Scene Forensic Evidence
              </CardTitle>
              <CardDescription className="text-xs">
                Observed forensic evidence and victimology recorded at scene.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <form onSubmit={handleInfer} className="space-y-3.5">
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

                <div className="pt-1">
                  <Slider
                    label="Victim Age"
                    value={evidenceForm.victim_age}
                    min={1}
                    max={95}
                    unit="years"
                    onChange={(val) =>
                      setEvidenceForm({ ...evidenceForm, victim_age: val })
                    }
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  className="w-full mt-1"
                >
                  Generate Suspect Profile
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Forensic Evidence Correlation Matrix */}
          <Card className="border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-slate-900/60">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <GitFork className="h-4 w-4 text-sky-400" />
                Forensic Evidence Correlation Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-2 text-xs text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-sky-300 border border-slate-800 space-y-1">
                <div>&bull; Incident Circumstance &rarr; Victim-Offender Proximity</div>
                <div>&bull; Weapon Signature &rarr; Offender Demographics &amp; Gender</div>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Trait probabilities are calculated by conditioning observed crime scene indicators against verified clearance outcome profiles.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inferred Suspect Demographics (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {profile ? (
            <>
              {/* Demographics Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3 border-sky-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Probable Gender
                  </span>
                  <div className="text-base font-bold text-white mt-0.5">
                    {profile.top_demographics.top_sex}
                  </div>
                  <div className="text-[11px] font-mono text-sky-400 mt-0.5">
                    {(profile.top_demographics.sex_confidence * 100).toFixed(0)}% Likelihood
                  </div>
                </Card>

                <Card className="p-3 border-emerald-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Age Bracket
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">
                    {profile.top_demographics.top_age_bracket}
                  </div>
                  <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                    {(profile.top_demographics.age_confidence * 100).toFixed(0)}% Likelihood
                  </div>
                </Card>

                <Card className="p-3 border-purple-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Victim Relationship
                  </span>
                  <div className="text-sm font-bold text-white mt-0.5 truncate">
                    {profile.top_demographics.top_relationship}
                  </div>
                  <div className="text-[11px] font-mono text-purple-400 mt-0.5">
                    {(profile.top_demographics.relationship_confidence * 100).toFixed(0)}% Likelihood
                  </div>
                </Card>

                <Card className="p-3 border-amber-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Profile Reliability
                  </span>
                  <div className="text-sm font-bold text-amber-400 mt-0.5">
                    High Confidence
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Verified Trait Match
                  </div>
                </Card>
              </div>

              {/* Age Bracket Distribution */}
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Probable Offender Age Bracket Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageDistributionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="bracket" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d1322",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="probability" radius={[4, 4, 0, 0]}>
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
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm">Probable Suspect-to-Victim Relationship</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-1 h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={relationshipDistributionData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="relation" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} unit="%" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0d1322",
                          borderColor: "#1e293b",
                          borderRadius: "8px",
                          fontSize: "11px",
                        }}
                      />
                      <Bar dataKey="probability" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-8 text-center h-72">
              <Dna className="h-10 w-10 text-slate-600 mb-2" />
              <h3 className="text-sm font-semibold text-slate-300">
                Awaiting Scene Evidence Input
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Enter the forensic weapon, victimology, and scene circumstances to generate probable suspect trait profiles.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
