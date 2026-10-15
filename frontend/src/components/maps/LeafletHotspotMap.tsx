"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { HotspotCentroid } from "@/types/api";

interface LeafletHotspotMapProps {
  hotspots: HotspotCentroid[];
  districts: Array<{
    district: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    lon?: number;
    base_weight?: number;
  }>;
  selectedCity?: string;
  selectedOverlay?: "HEATMAP" | "SECTORS" | "PATROL";
}

type MapTheme = "dark" | "satellite" | "street";

interface TileConfig {
  name: string;
  url: string;
  referenceUrl?: string;
  attribution: string;
  maxZoom: number;
}

const TILE_CONFIGS: Record<MapTheme, TileConfig> = {
  dark: {
    name: "Dark Tactical (No Key Required)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    referenceUrl: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
    maxZoom: 16,
  },
  satellite: {
    name: "Satellite Recon (No Key Required)",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 18,
  },
  street: {
    name: "OpenStreetMap (No Key Required)",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

// Tactical Intercept Patrol Routes between District HQ and Hotspots in Tamil Nadu
const PATROL_CORRIDORS = [
  {
    name: "Chennai GST & Radial Express Intercept",
    from: [13.0827, 80.2707],
    to: [12.8342, 79.7036],
    callsign: "TN-DELTA-CRUISER-01",
    directive: "Continuous Mobile ANPR & Vehicle Barricade Screening",
    color: "#38bdf8",
  },
  {
    name: "Coimbatore Industrial - Avinashi Highway Intercept",
    from: [11.0168, 76.9558],
    to: [11.1085, 77.3411],
    callsign: "TN-WEST-PATROL-04",
    directive: "Nightly Saturation Beat & Commercial Screening",
    color: "#60a5fa",
  },
  {
    name: "Madurai South - Ring Road Highway Corridor",
    from: [9.9252, 78.1198],
    to: [10.3673, 77.9803],
    callsign: "TN-SOUTH-INTERCEPT-02",
    directive: "Highway Speed Checkpoint & Night Surveillance",
    color: "#f59e0b",
  },
  {
    name: "Salem - Trichy Delta Strategic Transit Link",
    from: [11.6643, 78.1460],
    to: [10.7905, 78.7047],
    callsign: "TN-CENTRAL-BEAT-03",
    directive: "Inter-District Checkpoint & Heavy Vehicle Screening",
    color: "#3b82f6",
  },
];

export default function LeafletHotspotMap({
  hotspots,
  districts,
  selectedCity,
  selectedOverlay = "HEATMAP",
}: LeafletHotspotMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const tileLayersRef = useRef<any[]>([]);
  const dataLayerGroupRef = useRef<any>(null);
  const leafletModuleRef = useRef<any>(null);

  const [activeTheme, setActiveTheme] = useState<MapTheme>("dark");
  const [mapReady, setMapReady] = useState(false);

  // Initialize Map Instance once
  useEffect(() => {
    let isCancelled = false;
    const containerEl = containerRef.current;

    async function initLeaflet() {
      if (typeof window === "undefined" || !containerEl) return;

      const L = await import("leaflet");
      if (isCancelled || !containerEl) return;
      leafletModuleRef.current = L;

      // Fix default Leaflet icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // Avoid duplicate init if already initialized
      if (mapRef.current) {
        return;
      }
      if ((containerEl as any)._leaflet_id) {
        (containerEl as any)._leaflet_id = null;
      }

      // Initialize map centered over Tamil Nadu (11.1271° N, 78.6569° E)
      const map = L.map(containerEl, {
        center: [11.1271, 78.6569],
        zoom: 7,
        zoomControl: true,
      });
      mapRef.current = map;

      // Layer group for dynamic markers/hotspots
      const dataLayerGroup = L.layerGroup().addTo(map);
      dataLayerGroupRef.current = dataLayerGroup;

      // Add default tile layers (Esri World Dark Gray - no API key watermark)
      applyTileTheme(map, L, "dark");

      setMapReady(true);
    }

    initLeaflet();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (containerEl) {
        (containerEl as any)._leaflet_id = null;
      }
      dataLayerGroupRef.current = null;
      tileLayersRef.current = [];
    };
  }, []);

  // Switch Tile Layer when activeTheme changes
  function applyTileTheme(mapInstance: any, L: any, theme: MapTheme) {
    if (!mapInstance || !L) return;

    // Remove old tile layers
    tileLayersRef.current.forEach((layer) => {
      if (mapInstance.hasLayer(layer)) {
        mapInstance.removeLayer(layer);
      }
    });
    tileLayersRef.current = [];

    const config = TILE_CONFIGS[theme];
    const baseLayer = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: config.maxZoom,
    }).addTo(mapInstance);
    tileLayersRef.current.push(baseLayer);

    // If reference label layer exists (e.g. Esri Dark Canvas city labels), add it on top
    if (config.referenceUrl) {
      const refLayer = L.tileLayer(config.referenceUrl, {
        maxZoom: config.maxZoom,
        opacity: 0.9,
      }).addTo(mapInstance);
      tileLayersRef.current.push(refLayer);
    }
  }

  // Handle Theme Change
  const handleThemeChange = (theme: MapTheme) => {
    setActiveTheme(theme);
    if (mapRef.current && leafletModuleRef.current) {
      applyTileTheme(mapRef.current, leafletModuleRef.current, theme);
    }
  };

  // Re-draw Layer Elements based on selectedOverlay (HEATMAP vs SECTORS vs PATROL)
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletModuleRef.current;
    const dataLayer = dataLayerGroupRef.current;

    if (!map || !L || !dataLayer) return;

    // Clear previous vector graphics
    dataLayer.clearLayers();

    if (selectedOverlay === "HEATMAP") {
      // ── 1. DENSITY HEATMAP LAYER ───────────────────────────────────────────
      hotspots.forEach((spot) => {
        const lat = Number(spot.latitude ?? (spot as any).lat);
        const lon = Number(spot.longitude ?? (spot as any).lon);
        if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return;

        const radius = Math.max(12000, (spot.normalized_intensity || 0.5) * 35000);
        const color =
          spot.normalized_intensity > 0.8
            ? "#ef4444" // Crimson (Critical)
            : spot.normalized_intensity > 0.6
            ? "#f59e0b" // Amber (Elevated)
            : "#3b82f6"; // Sapphire Blue (Baseline)

        // Gradient outer dispersion ring
        L.circle([lat, lon], {
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          radius: radius,
          weight: 1.5,
        }).addTo(dataLayer);

        // Core hotspot centroid pin
        const centroidDot = L.circleMarker([lat, lon], {
          radius: 5,
          color: "#ffffff",
          fillColor: color,
          fillOpacity: 0.95,
          weight: 2,
        }).addTo(dataLayer);

        centroidDot.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; line-height: 1.5; padding: 6px; background: #0b1528; border-radius: 6px; min-width: 200px;">
            <div style="color: #60a5fa; font-weight: bold; font-size: 12px; margin-bottom: 2px;">${spot.city || "Tamil Nadu Sector"}</div>
            <div>Priority Rank: <strong style="color: #fff;">#${spot.rank}</strong></div>
            <div>Spatial Density: <strong style="color: #93c5fd;">${(spot.estimated_intensity || 0).toFixed(1)}</strong></div>
            <div>Risk Category: <strong style="color: #38bdf8;">${spot.percentile_tier || "Elevated"}</strong></div>
            <hr style="border: 0; border-top: 1px solid #1e345a; margin: 6px 0;" />
            <div style="font-size: 10px; color: #94a3b8;">Patrol Directive: ${spot.recommended_patrol || "Active patrol"}</div>
          </div>
        `);
      });

      // Subtle district reference markers
      districts.forEach((d) => {
        const lat = Number(d.latitude ?? (d as any).lat);
        const lon = Number(d.longitude ?? (d as any).lon);
        if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return;

        L.circleMarker([lat, lon], {
          radius: 3.5,
          color: "#1e3a8a",
          fillColor: "#38bdf8",
          fillOpacity: 0.75,
          weight: 1,
        }).addTo(dataLayer);
      });
    } else if (selectedOverlay === "SECTORS") {
      // ── 2. SECTOR BEACONS LAYER ────────────────────────────────────────────
      districts.forEach((d) => {
        const lat = Number(d.latitude ?? (d as any).lat);
        const lon = Number(d.longitude ?? (d as any).lon);
        if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return;

        // Radar Pulse Ring around District Sector Beacon
        L.circle([lat, lon], {
          radius: 22000,
          color: "#0284c7",
          fillColor: "#0ea5e9",
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: "5, 8",
        }).addTo(dataLayer);

        // Radar Secondary Ping
        L.circle([lat, lon], {
          radius: 11000,
          color: "#38bdf8",
          fillColor: "#38bdf8",
          fillOpacity: 0.22,
          weight: 1.5,
        }).addTo(dataLayer);

        // Core Beacon Marker
        const beacon = L.circleMarker([lat, lon], {
          radius: 6,
          color: "#ffffff",
          fillColor: "#0284c7",
          fillOpacity: 1.0,
          weight: 2,
        }).addTo(dataLayer);

        beacon.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; padding: 6px; background: #0b1528; border-radius: 6px; min-width: 210px;">
            <div style="color: #38bdf8; font-weight: bold; font-size: 13px;">📡 ${d.district} Sector Beacon</div>
            <div style="margin-top: 3px;">Coordinates: <span style="color: #cbd5e1;">${lat.toFixed(4)}° N, ${lon.toFixed(4)}° E</span></div>
            <div>Incident Volume Index: <strong style="color: #93c5fd;">${d.base_weight ?? 75}/100</strong></div>
            <div>Status: <span style="color: #4ade80; font-weight: bold;">ACTIVE TELEMETRY PING</span></div>
            <hr style="border: 0; border-top: 1px solid #1e345a; margin: 6px 0;" />
            <div style="font-size: 10px; color: #94a3b8;">Coverage: 25km Tamil Nadu District Command Perimeter</div>
          </div>
        `);
      });
    } else if (selectedOverlay === "PATROL") {
      // ── 3. PATROL DIRECTIVES & INTERCEPT CORRIDORS ─────────────────────────
      PATROL_CORRIDORS.forEach((corridor) => {
        // Draw tactical polyline intercept path
        const line = L.polyline([corridor.from as [number, number], corridor.to as [number, number]], {
          color: corridor.color,
          weight: 3.5,
          dashArray: "6, 10",
          opacity: 0.85,
        }).addTo(dataLayer);

        line.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; padding: 6px; background: #0b1528; border-radius: 6px; min-width: 220px;">
            <div style="color: #60a5fa; font-weight: bold; font-size: 12px;">🛡️ ${corridor.name}</div>
            <div style="margin-top: 2px;">Assigned Cruiser: <strong style="color: #38bdf8;">${corridor.callsign}</strong></div>
            <div>Directive: <span style="color: #f1f5f9;">${corridor.directive}</span></div>
          </div>
        `);

        // Checkpoint marker at midpoint
        const midLat = (corridor.from[0] + corridor.to[0]) / 2;
        const midLon = (corridor.from[1] + corridor.to[1]) / 2;
        const checkpt = L.circleMarker([midLat, midLon], {
          radius: 5,
          color: "#ffffff",
          fillColor: "#ef4444",
          fillOpacity: 1.0,
          weight: 2,
        }).addTo(dataLayer);

        checkpt.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; padding: 4px; background: #0b1528;">
            <strong style="color: #ef4444;">🚨 Tactical Checkpoint Station</strong><br/>
            <span>Corridor: ${corridor.name}</span><br/>
            <span style="color: #38bdf8;">Mobile ANPR Camera Active</span>
          </div>
        `);
      });

      // Also render the Hotspot points with tactical directive badges
      hotspots.slice(0, 5).forEach((spot) => {
        const lat = Number(spot.latitude ?? (spot as any).lat);
        const lon = Number(spot.longitude ?? (spot as any).lon);
        if (isNaN(lat) || isNaN(lon) || !isFinite(lat) || !isFinite(lon)) return;

        const marker = L.circleMarker([lat, lon], {
          radius: 7,
          color: "#f59e0b",
          fillColor: "#1e1b4b",
          fillOpacity: 0.9,
          weight: 2.5,
        }).addTo(dataLayer);

        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; padding: 6px; background: #0b1528; border-radius: 6px;">
            <strong style="color: #f59e0b;">Target Sector: ${spot.city}</strong><br/>
            <span>Priority Intercept: Rank #${spot.rank}</span><br/>
            <span style="color: #60a5fa;">Directive: ${spot.recommended_patrol}</span>
          </div>
        `);
      });
    }
  }, [hotspots, districts, mapReady, selectedOverlay]);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-blue-900/50 shadow-2xl bg-slate-950">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Layer Selector Toolbar (Top Left) */}
      <div className="absolute top-3 left-14 z-[1000] flex items-center bg-slate-950/90 backdrop-blur-md border border-blue-900/60 rounded-lg p-1 text-[11px] font-mono shadow-xl pointer-events-auto">
        <span className="text-slate-400 px-2 uppercase tracking-wider text-[10px] font-semibold border-r border-blue-900/50 mr-1 hidden xs:inline">
          Map:
        </span>
        <button
          type="button"
          onClick={() => handleThemeChange("dark")}
          className={`px-2 py-1 rounded transition-colors ${
            activeTheme === "dark"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Tactical Dark
        </button>
        <button
          type="button"
          onClick={() => handleThemeChange("street")}
          className={`px-2 py-1 rounded transition-colors ${
            activeTheme === "street"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Cartography
        </button>
        <button
          type="button"
          onClick={() => handleThemeChange("satellite")}
          className={`px-2 py-1 rounded transition-colors ${
            activeTheme === "satellite"
              ? "bg-blue-600 text-white font-semibold"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Dynamic Overlay Mode Indicator (Top Right) */}
      <div className="hidden sm:block absolute top-3 right-3 z-[1000] bg-slate-950/90 backdrop-blur-md border border-blue-900/60 p-3 rounded-lg text-[11px] font-mono space-y-1.5 shadow-xl min-w-[190px] pointer-events-auto">
        <div className="text-blue-300 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Active Mode: {selectedOverlay}
        </div>
        {selectedOverlay === "HEATMAP" && (
          <>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-200">Critical (&gt;80th pct)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500 inline-block" />
              <span className="text-slate-200">Elevated (60th - 80th)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" />
              <span className="text-slate-200">Standard Baseline</span>
            </div>
          </>
        )}
        {selectedOverlay === "SECTORS" && (
          <>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block animate-ping" />
              <span className="text-slate-200">Station Radar Beacons</span>
            </div>
            <div className="text-[10px] text-slate-400 leading-tight">
              20 State Command Sectors active across Tamil Nadu
            </div>
          </>
        )}
        {selectedOverlay === "PATROL" && (
          <>
            <div className="flex items-center gap-2">
              <span className="h-2 w-4 bg-sky-400 inline-block rounded" />
              <span className="text-slate-200">Active Intercept Line</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block" />
              <span className="text-slate-200">Mobile ANPR Checkpoint</span>
            </div>
          </>
        )}
      </div>

      {/* Bottom Status Badge */}
      <div className="absolute bottom-2 left-2 z-[1000] bg-slate-950/85 backdrop-blur border border-blue-900/60 px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 flex items-center gap-2 pointer-events-auto shadow-md">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span>Jurisdiction: Tamil Nadu State Police &bull; Mode: {selectedOverlay}</span>
      </div>
    </div>
  );
}
