"use client";

import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  MapPin,
  ArrowRight,
  Filter,
  Layers,
  Scale,
  Award,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              MODULE 06
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              LONGITUDINAL IPC DATABASE
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <BarChart3 className="h-7 w-7 text-sky-400" />
            Tamil Nadu Regional Crime Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            District-level longitudinal IPC crime analysis across 38 Tamil Nadu
            jurisdictions. Includes 10-year trend tracking and head-to-head
            comparisons.
          </p>
        </div>

        <Badge variant="outline" className="font-mono text-xs">
          Longitudinal Window: 2014 &ndash; 2023
        </Badge>
      </div>

      {/* Top Section: Longitudinal Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                <TrendingUp className="h-5 w-5 text-sky-400" />
                Tamil Nadu Total Cognizable IPC Crimes (2014 - 2023)
              </CardTitle>
              <CardDescription>
                Statewide annual volume of reported cognizable offenses under IPC.
              </CardDescription>
            </div>
            <Badge variant="success" className="font-mono text-xs">
              Statewide Aggregation
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trends} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="year" stroke="#64748b" fontSize={11} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickFormatter={(val) => `${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1322",
                  borderColor: "#1e293b",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(val: any) => [formatNumber(Number(val)), "Reported Crimes"]}
              />
              <Area
                type="monotone"
                dataKey="total_crime_count"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#trendColor)"
                name="Annual IPC Crimes"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Head-to-Head District Comparison */}
      <Card className="border-sky-500/20 bg-gradient-to-b from-sky-500/5 to-slate-900/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              <Scale className="h-5 w-5 text-sky-400" />
              Head-to-Head District Comparison Tool
            </CardTitle>
            <Badge variant="default" className="font-mono text-xs">
              Comparative Analysis
            </Badge>
          </div>
          <CardDescription>
            Compare two Tamil Nadu administrative districts directly across
            overall crime rate and murder incidence.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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

            <Button
              onClick={handleCompare}
              variant="primary"
              isLoading={comparing}
              className="gap-2"
            >
              Compare Districts
            </Button>
          </div>

          {comparison && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              {/* District A Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-sky-400 font-mono">
                    {comparison.district_a.district}
                  </h4>
                  <Badge variant="outline">
                    Pop: {comparison.district_a.projected_pop_lakhs} Lakhs
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Total Crime (2020-22)</span>
                    <div className="font-mono font-bold text-white text-sm mt-0.5">
                      {formatNumber(comparison.district_a.total_crime_2020_2022)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Crime Rate (per Lakh)</span>
                    <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                      {comparison.district_a.crime_rate_2022.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Murder Count</span>
                    <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                      {comparison.district_a.murder_incidence}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Share of TN Crime</span>
                    <div className="font-mono font-bold text-purple-400 text-sm mt-0.5">
                      {comparison.district_a.share_pct_2022.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* District B Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/70 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-emerald-400 font-mono">
                    {comparison.district_b.district}
                  </h4>
                  <Badge variant="outline">
                    Pop: {comparison.district_b.projected_pop_lakhs} Lakhs
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Total Crime (2020-22)</span>
                    <div className="font-mono font-bold text-white text-sm mt-0.5">
                      {formatNumber(comparison.district_b.total_crime_2020_2022)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Crime Rate (per Lakh)</span>
                    <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                      {comparison.district_b.crime_rate_2022.toFixed(1)}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Murder Count</span>
                    <div className="font-mono font-bold text-amber-400 text-sm mt-0.5">
                      {comparison.district_b.murder_incidence}
                    </div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80">
                    <span className="text-slate-400">Share of TN Crime</span>
                    <div className="font-mono font-bold text-purple-400 text-sm mt-0.5">
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
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>
                <Award className="h-5 w-5 text-amber-400" />
                Tamil Nadu District Crime League Table
              </CardTitle>
              <CardDescription>
                Comprehensive breakdown of IPC crime rates, population, and murder
                rates across administrative districts.
              </CardDescription>
            </div>
            <div className="w-full md:w-64">
              <input
                type="text"
                placeholder="Search district name..."
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>
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
                    <TableCell><div className="h-4 w-10 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-28 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-20 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-slate-800 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-4 w-14 bg-slate-800 animate-pulse rounded" /></TableCell>
                  </TableRow>
                ))
              ) : filteredDistricts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    No matching districts found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDistricts.map((d, idx) => (
                  <TableRow key={d.district}>
                    <TableCell className="font-mono font-bold text-sky-400 text-xs">
                      #{idx + 1}
                    </TableCell>
                    <TableCell className="font-medium text-slate-200">
                      {d.district}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {formatNumber(d.total_crime_2020_2022)}
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-emerald-400">
                      {d.crime_rate_2022.toFixed(1)}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-300">
                      {d.share_pct_2022.toFixed(1)}%
                    </TableCell>
                    <TableCell className="font-mono text-xs text-amber-400">
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
