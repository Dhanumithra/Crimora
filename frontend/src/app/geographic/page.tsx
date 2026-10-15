"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Compass,
  Flame,
  Activity,
  Shield,
  Crosshair,
  Layers,
  Radio,
  Eye,
  HelpCircle,
  Info,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { GeographicSummary } from "@/types/api";

// Dynamically import Leaflet map with SSR disabled
const LeafletHotspotMap = dynamic(
  () => import("@/components/maps/LeafletHotspotMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-400 font-mono">
        <Activity className="h-5 w-5 text-blue-400 animate-spin mr-3" />
        Initializing Dark Matter Spatial Canvas &amp; Telemetry Feed...
      </div>
    ),
  }
);

export default function GeographicPage() {
  const [summary, setSummary] = useState<GeographicSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOverlay, setSelectedOverlay] = useState<"HEATMAP" | "SECTORS" | "PATROL">("HEATMAP");
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await crimoraApi.getGeographicSummary();
        setSummary(res);
      } catch (err) {
        console.error("Failed to load geographic summary:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hotspots = summary?.hotspots || [
    {
      rank: 1,
      latitude: 13.0827,
      longitude: 80.2707,
      city: "Chennai Central Metropolitan",
      estimated_intensity: 94.6,
      normalized_intensity: 0.95,
      relative_rank: 1,
      percentile_tier: "95th Percentile (Critical)",
      recommended_patrol: "Rapid Intercept Patrol & Mobile ANPR Deployment",
    },
    {
      rank: 2,
      latitude: 9.9252,
      longitude: 78.1198,
      city: "Madurai South Commercial",
      estimated_intensity: 87.2,
      normalized_intensity: 0.87,
      relative_rank: 2,
      percentile_tier: "90th Percentile (Severe)",
      recommended_patrol: "High-Visibility Evening Beat Patrol",
    },
    {
      rank: 3,
      latitude: 11.0168,
      longitude: 76.9558,
      city: "Coimbatore Industrial Corridor",
      estimated_intensity: 79.4,
      normalized_intensity: 0.79,
      relative_rank: 3,
      percentile_tier: "80th Percentile (High)",
      recommended_patrol: "Checkpoint & Sector Density Monitoring",
    },
    {
      rank: 4,
      latitude: 11.6643,
      longitude: 78.146,
      city: "Salem Junction District",
      estimated_intensity: 72.1,
      normalized_intensity: 0.72,
      relative_rank: 4,
      percentile_tier: "75th Percentile (Elevated)",
      recommended_patrol: "Transit Hub Static Security Post",
    },
    {
      rank: 5,
      latitude: 10.7905,
      longitude: 78.7047,
      city: "Tiruchirappalli Central",
      estimated_intensity: 66.8,
      normalized_intensity: 0.67,
      relative_rank: 5,
      percentile_tier: "70th Percentile (Elevated)",
      recommended_patrol: "Mobile Perimeter Surveillance",
    },
  ];

  const districts = summary?.tamil_nadu_focus_districts || [
    { district: "Chennai", lat: 13.0827, lon: 80.2707, base_weight: 95 },
    { district: "Madurai", lat: 9.9252, lon: 78.1198, base_weight: 88 },
    { district: "Coimbatore", lat: 11.0168, lon: 76.9558, base_weight: 80 },
    { district: "Salem", lat: 11.6643, lon: 78.146, base_weight: 73 },
    { district: "Tiruchirappalli", lat: 10.7905, lon: 78.7047, base_weight: 68 },
    { district: "Tirunelveli", lat: 8.7139, lon: 77.7567, base_weight: 62 },
    { district: "Vellore", lat: 12.9165, lon: 79.1325, base_weight: 59 },
    { district: "Erode", lat: 11.341, lon: 77.7172, base_weight: 55 },
    { district: "Thanjavur", lat: 10.787, lon: 79.1378, base_weight: 52 },
    { district: "Dindigul", lat: 10.3673, lon: 77.9803, base_weight: 48 },
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
                Spatial Intelligence
              </span>
              <span className="text-slate-600">&bull;</span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                TAMIL NADU STATE CANVAS
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-400 stroke-[2.3]" />
              Geographic Profiling &amp; Spatial Hotspots
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 mt-1.5 max-w-3xl leading-relaxed">
              High-density incident cluster mapping, spatial decay modeling, and tactical mobile intercept directives across state jurisdiction sectors.
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
            <Badge variant="success" className="font-mono text-xs px-3.5 py-1.5 shadow-[0_0_12px_rgba(37,99,235,0.25)]">
              10 Monitored Districts
            </Badge>
            <Badge variant="outline" className="font-mono text-xs px-3.5 py-1.5 bg-slate-900/60 border-slate-700">
              2,500 Monitored Sectors
            </Badge>
          </div>
        </div>
        <div className="cyber-scanline w-full mt-6" />
      </div>

      {/* User Guide Banner */}
      {showHelp && (
        <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 shadow-[0_4px_20px_rgba(37,99,235,0.15)] animate-fade-in text-xs text-slate-300 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
            <Info className="h-4.5 w-4.5 text-blue-400" />
            Quick User Guide: How Geographic Profiling Works
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">1</span>
                Interactive Leaflet Canvas
              </div>
              <p className="text-[11px] text-slate-400">
                Zoom, drag, and click on circular hotspots or district HQ markers on the map to view instant incident density and patrol protocols.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">2</span>
                Switch Overlays
              </div>
              <p className="text-[11px] text-slate-400">
                Use the layer buttons below the banner to toggle between Density Heatmap, Sector Beacons, and Active Patrol Directives.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-900/40">
              <div className="font-bold text-blue-300 mb-1 flex items-center gap-1.5">
                <span className="h-5 w-5 rounded-full bg-blue-600/30 text-blue-300 text-[10px] flex items-center justify-center font-mono">3</span>
                Prioritize Dispatch
              </div>
              <p className="text-[11px] text-slate-400">
                Inspect the ranked hotspot table below to see which sectors require immediate high-visibility patrols, static check-posts, or ANPR cameras.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Tactical Map Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-950/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-blue-400 shrink-0" />
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
            Layer Telemetry:
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Tamil Nadu Grid: 13.0827°N / 80.2707°E (Datum: WGS84)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {[
            { id: "HEATMAP", label: "Density Heatmap", icon: Flame },
            { id: "SECTORS", label: "Sector Beacons", icon: Radio },
            { id: "PATROL", label: "Patrol Directives", icon: Shield },
          ].map((layer) => {
            const Icon = layer.icon;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedOverlay(layer.id as any)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedOverlay === layer.id
                    ? "bg-blue-600/25 text-blue-200 border-blue-500 shadow-sm font-semibold"
                    : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spatial Map Canvas */}
      <Card className="p-3 border-blue-950/80 bg-slate-900/90 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.5)] overflow-hidden hud-bracket glow-card-blue">
        <LeafletHotspotMap
          hotspots={hotspots}
          districts={districts}
        />
      </Card>

      {/* Grid Stats & Hotspot Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Tactical Patrol Strategy Card (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between rounded-2xl hud-bracket glow-card-blue">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Compass className="h-5 w-5 text-blue-400" />
                Spatial Decay &amp; Patrol Strategy
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                Incident dispersal modeling for police intercept deployment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-xs">
              <div className="p-4 rounded-xl bg-slate-950/70 border border-blue-950/80 space-y-2 shadow-inner">
                <div className="text-[11px] font-mono text-blue-300 font-semibold uppercase tracking-wider">
                  Offender Spatial Decay Principle
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Offender mobility decreases as transit distance increases from primary comfort zones. High-density nodes require targeted stationary checkpoints and roving cruisers.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Monitored Sectors:</span>
                  <span className="font-mono font-bold text-white bg-slate-800/60 px-2 py-0.5 rounded border border-slate-700/50">2,500 Grid Sectors</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Target Jurisdiction:</span>
                  <span className="font-mono font-medium text-slate-200">
                    Tamil Nadu State Police
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Surveillance Focus:</span>
                  <span className="font-mono font-semibold text-blue-300 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
                    Mobile ANPR &amp; Evening Beats
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotspot Rankings Table (8 Cols) */}
        <div className="lg:col-span-8">
          <Card className="rounded-2xl overflow-hidden hud-bracket glow-card-blue">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Flame className="h-5 w-5 text-rose-400" />
                  Top Priority Crime Hotspot Locations
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  Ranked by spatial incident concentration with active patrol directives.
                </CardDescription>
              </div>
              <Badge variant="danger" className="font-mono text-xs px-2.5 py-1">
                5 High-Density Sectors
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Location Centroid</TableHead>
                    <TableHead>Density Score</TableHead>
                    <TableHead>Risk Tier</TableHead>
                    <TableHead>Tactical Patrol Directive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotspots.map((spot) => (
                    <TableRow key={spot.rank} className="hover:bg-blue-950/20">
                      <TableCell className="font-mono font-semibold text-slate-300 text-xs">
                        #{spot.rank}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-slate-200">
                        <div className="font-medium">{spot.city}</div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {spot.latitude.toFixed(4)}° N, {spot.longitude.toFixed(4)}° E
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-blue-300 text-xs">
                        {spot.estimated_intensity.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            spot.normalized_intensity > 0.8
                              ? "danger"
                              : spot.normalized_intensity > 0.7
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[10px]"
                        >
                          {spot.percentile_tier}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {spot.recommended_patrol}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
