"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Scale,
  Award,
  Search,
  HelpCircle,
  Info,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { DistrictMetric, YearlyTrend, DistrictComparison } from "@/types/api";
import { formatNumber } from "@/lib/utils";

export default function AnalyticsPage() {
  const [districts, setDistricts] = useState<DistrictMetric[]>([]);
  const [trends, setTrends] = useState<YearlyTrend[]>([]);
  const [searchDistrict, setSearchDistrict] = useState("");
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  // Head-to-head comparison
  const [compDistrictA, setCompDistrictA] = useState("Chennai City");
  const [compDistrictB, setCompDistrictB] = useState("Madurai City");
  const [comparison, setComparison] = useState<DistrictComparison | null>(null);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [distRes, trendRes] = await Promise.all([
          crimoraApi.getTamilNaduDistricts(),
          crimoraApi.getYearlyTrends(),
        ]);
        setDistricts(distRes);
        setTrends(trendRes);

        // Run initial comparison
        const initialComp = await crimoraApi.compareDistricts(
          "Chennai City",
          "Madurai City"
        );
        setComparison(initialComp);
      } catch (err) {
        console.error("Failed to load analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleCompare = async () => {
    setComparing(true);
    try {
      const res = await crimoraApi.compareDistricts(
        compDistrictA,
        compDistrictB
      );
      setComparison(res);
    } catch (err) {
      console.error("Comparison error:", err);
    } finally {
      setComparing(false);
    }
  };

  const filteredDistricts = districts.filter((d) =>
    d.district.toLowerCase().includes(searchDistrict.toLowerCase())
  );

  const districtOptions = districts.map((d) => ({
    label: d.district,
    value: d.district,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header - Enterprise Clean in Blue */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-blue-950/80">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/40 text-[10px] font-mono uppercase tracking-[0.14em] text-blue-300 font-semibold shadow-[0_0_12px_rgba(37,99,235,0.25)]">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Regional Intelligence
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[11px] font-mono uppercase tracking-[0.1em] text-slate-400 font-medium">
              Longitudinal IPC Database
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            Tamil Nadu Regional Crime Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/80 mt-1 max-w-3xl leading-relaxed">
            District-level historical crime trends, comparative jurisdictional telemetry, and annual IPC statutory offence aggregates.
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
          <Badge variant="outline" className="font-mono text-xs px-3.5 py-1.5 bg-blue-950/40 border-blue-500/40 text-blue-300 shrink-0">
            Longitudinal Window: 2014 &ndash; 2023
          </Badge>
        </div>
      </div>

      {/* User Guide Banner */}
      {showHelp && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-fade-in text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
            <Info className="h-4.5 w-4.5 text-blue-400" />
            Quick User Guide: How Regional Analytics Works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">1</span>
                Yearly Longitudinal Trend
              </div>
              <p className="text-[11px] text-slate-400">
                Hover over the interactive area chart above to trace statewide annual crime incidence from 2014 through 2023.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">2</span>
                Direct District Matchups
              </div>
              <p className="text-[11px] text-slate-400">
                Select any two districts in the Comparison Tool to benchmark relative per-capita crime rates and murder counts.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">3</span>
                Instant League Search
              </div>
              <p className="text-[11px] text-slate-400">
                Type any district name into the search bar of the League Table below to instantly filter all 38 districts.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Top Section: Longitudinal Trend Chart */}
      <Card className="rounded-2xl glow-card-blue">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg text-white">
              <TrendingUp className="h-5 w-5 text-blue-400 inline mr-2" />
              Tamil Nadu Total Cognizable IPC Crimes (2014 - 2023)
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Statewide annual volume of reported cognizable offenses under IPC.
            </CardDescription>
          </div>
          <Badge variant="success" className="font-mono text-xs px-2.5 py-1">
            Statewide Aggregation
          </Badge>
        </CardHeader>
        <CardContent className="h-72 pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 15, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="trendBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E345A" />
              <XAxis dataKey="year" stroke="#64748B" fontSize={11} />
              <YAxis
                stroke="#64748B"
                fontSize={11}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0B1528",
                  borderColor: "#1E345A",
                  borderRadius: "10px",
                  fontSize: "12px",
                  boxShadow: "0 12px 30px rgba(0,0,0,0.7)",
                  color: "#F1F5F9",
                }}
                formatter={(val: any) => [formatNumber(Number(val)), "Reported Crimes"]}
              />
              <Area
                type="monotone"
                dataKey="total_crime_count"
                stroke="#38BDF8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendBlue)"
                name="Annual IPC Crimes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Head-to-Head District Comparison */}
      <Card className="rounded-2xl glow-card-blue">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-lg text-white">
              <Scale className="h-5 w-5 text-blue-400 inline mr-2" />
              Head-to-Head District Comparison Tool
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Compare two Tamil Nadu administrative districts directly across overall crime volume and murder rates.
            </CardDescription>
          </div>
          <Badge variant="outline" className="font-mono text-xs px-2.5 py-1">
            Comparative Analysis
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-end">
            <Select
              label="District A"
              value={compDistrictA}
              onChange={(e) => setCompDistrictA(e.target.value)}
              options={
                districtOptions.length > 0
                  ? districtOptions
                  : [
                      { label: "Chennai City", value: "Chennai City" },
                      { label: "Madurai City", value: "Madurai City" },
                    ]
              }
            />

            <Select
              label="District B"
              value={compDistrictB}
              onChange={(e) => setCompDistrictB(e.target.value)}
              options={
                districtOptions.length > 0
                  ? districtOptions
                  : [
                      { label: "Madurai City", value: "Madurai City" },
                      { label: "Coimbatore City", value: "Coimbatore City" },
                    ]
              }
            />

            <button
              onClick={handleCompare}
              disabled={comparing}
              className="w-full h-10 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(37,99,235,0.35)] border border-blue-400/30 transition-all flex items-center justify-center gap-2"
            >
              <Scale className="h-4 w-4" />
              <span>Compare Districts</span>
            </button>
          </div>

          {comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-800/80">
              {/* District A Card */}
              <div className="p-5 rounded-2xl border border-blue-950/80 bg-slate-950/70 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-blue-300 font-mono">
                    {comparison.district_a.district}
                  </h4>
                  <Badge variant="outline">
                    Pop: {comparison.district_a.projected_pop_lakhs} Lakhs
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Total Crime (2020-22)</span>
                    <div className="font-mono font-bold text-slate-100 text-xs mt-0.5">
                      {formatNumber(comparison.district_a.total_crime_2020_2022)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Crime Rate (per Lakh)</span>
                    <div className="font-mono font-bold text-blue-300 text-xs mt-0.5">
                      {comparison.district_a.crime_rate_2022.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Murder Count</span>
                    <div className="font-mono font-bold text-amber-300 text-xs mt-0.5">
                      {comparison.district_a.murder_incidence}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-md bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Share of TN Crime</span>
                    <div className="font-mono font-bold text-sky-400 text-xs mt-0.5">
                      {comparison.district_a.share_pct_2022.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* District B Card */}
              <div className="p-5 rounded-2xl border border-blue-950/80 bg-slate-950/70 space-y-4 shadow-inner">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-sky-300 font-mono">
                    {comparison.district_b.district}
                  </h4>
                  <Badge variant="outline">
                    Pop: {comparison.district_b.projected_pop_lakhs} Lakhs
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Total Crime (2020-22)</span>
                    <div className="font-mono font-bold text-white text-sm mt-1">
                      {formatNumber(comparison.district_b.total_crime_2020_2022)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Crime Rate (per Lakh)</span>
                    <div className="font-mono font-bold text-blue-300 text-sm mt-1">
                      {comparison.district_b.crime_rate_2022.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Murder Count</span>
                    <div className="font-mono font-bold text-amber-300 text-sm mt-1">
                      {comparison.district_b.murder_incidence}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-mono uppercase">Share of TN Crime</span>
                    <div className="font-mono font-bold text-sky-400 text-sm mt-1">
                      {comparison.district_b.share_pct_2022.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* District Rankings Table */}
      <Card className="rounded-2xl overflow-hidden glow-card-blue">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
          <div>
            <CardTitle className="text-lg text-white">
              <Award className="h-5 w-5 text-amber-400 inline mr-2" />
              Tamil Nadu District Crime League Table
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              Comprehensive breakdown of IPC crime rates, population, and murder rates across 38 administrative districts.
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search district..."
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-blue-900/40 bg-slate-950/80 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors shadow-inner"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Total Crime (2020-22)</TableHead>
                <TableHead>Crime Rate (per Lakh)</TableHead>
                <TableHead>State Share</TableHead>
                <TableHead>Murder Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 w-8 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-slate-800 animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDistricts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500 text-xs">
                    No matching districts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDistricts.map((d, idx) => (
                  <TableRow key={d.district} className="hover:bg-blue-950/20">
                    <TableCell className="font-mono font-semibold text-slate-300 text-xs">
                      #{idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-xs text-slate-200">
                      {d.district}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {formatNumber(d.total_crime_2020_2022)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-semibold text-blue-300">
                      {d.crime_rate_2022.toFixed(1)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {d.share_pct_2022.toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-300">
                      {d.murder_rate.toFixed(2)}
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
