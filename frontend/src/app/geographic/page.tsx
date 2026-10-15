"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Compass,
  Layers,
  Radio,
  ShieldCheck,
  Flame,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/Table";
import { crimoraApi } from "@/lib/api_client";
import { GeographicSummary, HotspotCentroid } from "@/types/api";

// Dynamically import Leaflet map with SSR disabled
const LeafletHotspotMap = dynamic(
  () => import("@/components/maps/LeafletHotspotMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[540px] rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
        <Activity className="h-5 w-5 text-sky-400 animate-spin mr-2" />
        Initializing Dark Matter Spatial Canvas...
      </div>
    ),
  }
);

export default function GeographicPage() {
  const [summary, setSummary] = useState<GeographicSummary | null>(null);
  const [loading, setLoading] = useState(true);

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
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="default" className="font-mono text-[10px]">
              MODULE 03
            </Badge>
            <Badge variant="secondary" className="font-mono text-[10px]">
              SPATIAL LOCALLY WEIGHTED REGRESSION (LWR)
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
            <MapPin className="h-7 w-7 text-emerald-400" />
            Geographic Profiling & Hotspot Analytics
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
            Locally Weighted Regression (LWR) distance-decay model evaluated across
            a 50&times;50 spatial resolution grid (2,500 nodes) with localized
            Tamil Nadu administrative coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="success" className="font-mono text-xs">
            Bandwidth h = 0.857
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            Grid: 50&times;50 (2,500 Nodes)
          </Badge>
        </div>
      </div>

      {/* Spatial Map Canvas */}
      <Card className="p-2 border-emerald-500/20">
        <LeafletHotspotMap
          hotspots={hotspots}
          districts={districts}
        />
      </Card>

      {/* Grid Stats & Hotspot Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LWR Theory & Parameters Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Compass className="h-5 w-5 text-emerald-400" />
              LWR Mathematical Kernel
            </CardTitle>
            <CardDescription>
              Distance-decay weighting function applied to crime incident density.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-emerald-400 text-center">
              K(d) = exp(-d² / 2h²)
            </div>
            <p className="text-slate-400 leading-relaxed">
              Spatial influence diminishes exponentially with geographic distance{" "}
              <code className="text-sky-300">d</code> from suspected anchor points.
              Bandwidth parameter <code className="text-sky-300">h = 0.857</code>{" "}
              preserves local cluster variance without oversmoothing urban centers.
            </p>

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <div className="flex justify-between text-slate-400">
                <span>Spatial Nodes Evaluated:</span>
                <span className="font-mono font-bold text-slate-200">2,500</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Coordinate System:</span>
                <span className="font-mono font-bold text-slate-200">
                  WGS84 EPSG:4326
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Administrative Region:</span>
                <span className="font-mono font-bold text-slate-200">
                  Tamil Nadu, IN
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hotspot Rankings Table (2 Cols) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    <Flame className="h-5 w-5 text-rose-400" />
                    Top Identified Crime Hotspot Centroids
                  </CardTitle>
                  <CardDescription>
                    Ranked by normalized spatial density with tactical patrol
                    directives.
                  </CardDescription>
                </div>
                <Badge variant="danger" className="font-mono text-xs">
                  5 Priority Zones
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Location Centroid</TableHead>
                    <TableHead>LWR Intensity</TableHead>
                    <TableHead>Percentile Tier</TableHead>
                    <TableHead>Tactical Patrol Directive</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hotspots.map((spot) => (
                    <TableRow key={spot.rank}>
                      <TableCell className="font-mono font-bold text-sky-400">
                        #{spot.rank}
                      </TableCell>
                      <TableCell className="font-medium text-slate-200">
                        <div>{spot.city}</div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {spot.latitude.toFixed(4)}° N, {spot.longitude.toFixed(4)}° E
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-emerald-400">
                        {spot.estimated_intensity.toFixed(1)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            spot.normalized_intensity > 0.8
                              ? "danger"
                              : spot.normalized_intensity > 0.7
                              ? "warning"
                              : "default"
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
