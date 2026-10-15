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
      console.error("Bayesian inference error:", err);
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              MODULE 04
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              BAYESIAN BELIEF NETWORK (BBN)
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <Dna className="h-7 w-7 text-sky-400" />
            Behavioral Profiling & Causal Demographics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Infers conditional suspect trait distributions{" "}
            <span className="text-sky-300 font-mono">
              P(Offender Demographic | Crime Scene Evidence)
            </span>{" "}
            using Bayesian directed acyclic graphs.
          </p>
        </div>

        <Button
          onClick={() => handleInfer()}
          isLoading={loading}
          size="md"
          className="gap-2 shrink-0"
        >
          <Sparkles className="h-4 w-4" />
          Update Bayesian Posterior
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Crime Scene Evidence Form (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Crime Scene Physical Evidence</CardTitle>
              <CardDescription>
                Observed forensic evidence conditioned as evidence nodes in the
                DAG.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleInfer} className="space-y-4">
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

                <div className="pt-2">
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
                  className="w-full mt-2"
                >
                  Compute Inferred Demographics
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Causal DAG Architecture Card */}
          <Card className="border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-slate-900/60">
            <CardHeader>
              <CardTitle className="text-sm">
                <GitFork className="h-4 w-4 text-sky-400" />
                Bayesian Directed Graph (pgmpy)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs text-slate-400">
              <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-sky-300 border border-slate-800 space-y-1">
                <div>(Circumstance) &rarr; (Relationship) &rarr; (Offender_Age)</div>
                <div>(Weapon) &rarr; (Offender_Sex) &rarr; (Offender_Race)</div>
              </div>
              <p>
                Inference utilizes Variable Elimination over joint probability
                factor tables trained on historical homicide clearances.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Inferred Suspect Demographics (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {profile ? (
            <>
              {/* Demographics Scorecards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Card className="p-3.5 border-sky-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Inferred Sex
                  </span>
                  <div className="text-base font-bold text-white mt-1">
                    {profile.top_demographics.top_sex}
                  </div>
                  <div className="text-xs font-mono text-sky-400 mt-1">
                    {(profile.top_demographics.sex_confidence * 100).toFixed(0)}% Conf.
                  </div>
                </Card>

                <Card className="p-3.5 border-emerald-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Age Bracket
                  </span>
                  <div className="text-sm font-bold text-white mt-1 truncate">
                    {profile.top_demographics.top_age_bracket}
                  </div>
                  <div className="text-xs font-mono text-emerald-400 mt-1">
                    {(profile.top_demographics.age_confidence * 100).toFixed(0)}% Conf.
                  </div>
                </Card>

                <Card className="p-3.5 border-purple-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Relationship
                  </span>
                  <div className="text-sm font-bold text-white mt-1 truncate">
                    {profile.top_demographics.top_relationship}
                  </div>
                  <div className="text-xs font-mono text-purple-400 mt-1">
                    {(profile.top_demographics.relationship_confidence * 100).toFixed(0)}% Conf.
                  </div>
                </Card>

                <Card className="p-3.5 border-amber-500/30 bg-slate-900/80">
                  <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider">
                    Offender Race
                  </span>
                  <div className="text-sm font-bold text-white mt-1">
                    {profile.top_demographics.top_race}
                  </div>
                  <div className="text-xs font-mono text-amber-400 mt-1">
                    {(profile.top_demographics.race_confidence * 100).toFixed(0)}% Conf.
                  </div>
                </Card>
              </div>

              {/* Conditional Distribution Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Offender Age Posterior P(Age | E)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ageDistributionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                        <YAxis
                          type="category"
                          dataKey="bracket"
                          stroke="#64748b"
                          fontSize={10}
                          width={80}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0d1322",
                            borderColor: "#1e293b",
                            borderRadius: "8px",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="probability" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">
                      Relationship Posterior P(Relation | E)
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={relationshipDistributionData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis type="number" stroke="#64748b" fontSize={10} domain={[0, 100]} />
                        <YAxis
                          type="category"
                          dataKey="relation"
                          stroke="#64748b"
                          fontSize={10}
                          width={85}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#0d1322",
                            borderColor: "#1e293b",
                            borderRadius: "8px",
                            fontSize: "11px",
                          }}
                        />
                        <Bar dataKey="probability" fill="#10b981" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Deductions Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    <BrainCircuit className="h-4 w-4 text-sky-400" />
                    Automated Investigative Causal Deductions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {profile.causal_deductions.map((deduction, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans"
                    >
                      {deduction}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-dashed border-slate-800 bg-slate-900/30 flex flex-col items-center justify-center p-12 text-center h-80">
              <Dna className="h-12 w-12 text-slate-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-300">
                No Behavioral Query Active
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Select the observed weapon, crime circumstance, and victim traits
                on the left to calculate Bayesian demographic posterior
                probabilities.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
