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
  Shield,
  Car,
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
      <div className="w-full h-[500px] rounded-md bg-slate-950 border border-slate-800 flex items-center justify-center text-xs text-slate-500 font-mono">
        <Activity className="h-4 w-4 text-indigo-400 animate-spin mr-2" />
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
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header - Enterprise Clean */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">
              Spatial Intelligence
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              Tamil Nadu State Canvas
            </span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-100 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-emerald-400" />
            Geographic Profiling &amp; Spatial Hotspots
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="font-mono text-xs">
            10 Monitored Districts
          </Badge>
          <Badge variant="outline" className="font-mono text-xs">
            2,500 Monitored Sectors
          </Badge>
        </div>
      </div>

      {/* Spatial Map Canvas */}
      <Card className="p-1.5 border-slate-800 bg-slate-900">
        <LeafletHotspotMap
          hotspots={hotspots}
          districts={districts}
        />
      </Card>

      {/* Grid Stats & Hotspot Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tactical Patrol Strategy Card (4 cols) */}
        <div className="lg:col-span-4">
          <Card className="h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-4 w-4 text-indigo-400" />
                Spatial Distance-Decay &amp; Patrol Strategy
              </CardTitle>
              <CardDescription>
                Incident dispersal modeling for police intercept deployment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 rounded-md bg-slate-950 border border-slate-800 space-y-1">
                <div className="text-[10px] font-mono text-indigo-400 font-semibold uppercase">
                  Offender Spatial Decay Principle
                </div>
                <p className="text-[11px] text-slate-300 leading-normal">
                  Offender mobility decreases as transit distance increases from primary comfort zones. High-density nodes require targeted stationary checkpoints and roving cruisers.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Monitored Sectors:</span>
                  <span className="font-mono font-medium text-slate-200">2,500 Grid Sectors</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Target Jurisdiction:</span>
                  <span className="font-mono font-medium text-slate-200">
                    Tamil Nadu State Police
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Surveillance Focus:</span>
                  <span className="font-mono font-medium text-emerald-400">
                    Mobile ANPR &amp; Evening Beats
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotspot Rankings Table (8 Cols) */}
        <div className="lg:col-span-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-rose-400" />
                  Top Priority Crime Hotspot Locations
                </CardTitle>
                <CardDescription>
                  Ranked by spatial incident concentration with active patrol directives.
                </CardDescription>
              </div>
              <Badge variant="danger" className="font-mono text-[10px]">
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
                    <TableRow key={spot.rank}>
                      <TableCell className="font-mono font-semibold text-slate-300 text-xs">
                        #{spot.rank}
                      </TableCell>
                      <TableCell className="font-medium text-xs text-slate-200">
                        <div>{spot.city}</div>
                        <div className="text-[10px] font-mono text-slate-500">
                          {spot.latitude.toFixed(4)}° N, {spot.longitude.toFixed(4)}° E
                        </div>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-emerald-400 text-xs">
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
