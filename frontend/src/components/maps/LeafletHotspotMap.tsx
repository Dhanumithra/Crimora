"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { HotspotCentroid } from "@/types/api";

interface LeafletHotspotMapProps {
  hotspots: HotspotCentroid[];
  districts: Array<{
    district: string;
    lat: number;
    lon: number;
    base_weight: number;
  }>;
  selectedCity?: string;
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

export default function LeafletHotspotMap({
  hotspots,
  districts,
  selectedCity,
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

    async function initLeaflet() {
      if (typeof window === "undefined" || !containerRef.current) return;

      const L = await import("leaflet");
      if (isCancelled || !containerRef.current) return;
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
      if ((containerRef.current as any)._leaflet_id) {
        (containerRef.current as any)._leaflet_id = null;
      }

      // Initialize map centered over Tamil Nadu (11.1271° N, 78.6569° E)
      const map = L.map(containerRef.current, {
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
      if (containerRef.current) {
        (containerRef.current as any)._leaflet_id = null;
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

  // Re-draw Hotspots and Districts whenever data changes WITHOUT re-initializing the whole map
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletModuleRef.current;
    const dataLayer = dataLayerGroupRef.current;

    if (!map || !L || !dataLayer) return;

    // Clear previous vector graphics
    dataLayer.clearLayers();

    // Render Hotspot Circles with gradient radius based on spatial intensity
    hotspots.forEach((spot) => {
      const radius = Math.max(10000, spot.normalized_intensity * 35000);
      const color =
        spot.normalized_intensity > 0.8
          ? "#ef4444" // Crimson
          : spot.normalized_intensity > 0.6
          ? "#f59e0b" // Amber
          : "#3b82f6"; // Sapphire Blue

      const circle = L.circle([spot.latitude, spot.longitude], {
        color: color,
        fillColor: color,
        fillOpacity: 0.35,
        radius: radius,
        weight: 1.5,
      }).addTo(dataLayer);

      circle.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #f8fafc; line-height: 1.5; padding: 4px; background: #0b1528; border-radius: 6px;">
          <strong style="color: #60a5fa; font-size: 12px;">${spot.city} Hotspot</strong><br/>
          <span>Priority Rank: <strong style="color: #fff;">#${spot.rank}</strong></span><br/>
          <span>Density Score: <strong style="color: #93c5fd;">${spot.estimated_intensity.toFixed(1)}</strong></span><br/>
          <span>Risk Tier: <strong style="color: #38bdf8;">${spot.percentile_tier}</strong></span><br/>
          <hr style="border: 0; border-top: 1px solid #1e345a; margin: 6px 0;" />
          <span style="font-size: 10px; color: #94a3b8;">Patrol Directive: ${spot.recommended_patrol}</span>
        </div>
      `);
    });

    // Render Tamil Nadu administrative district nodes
    districts.forEach((d) => {
      const marker = L.circleMarker([d.lat, d.lon], {
        radius: 4,
        color: "#2563eb",
        fillColor: "#38bdf8",
        fillOpacity: 0.85,
        weight: 1.5,
      }).addTo(dataLayer);

      marker.bindPopup(`
        <div style="font-family: monospace; font-size: 11px; color: #f8fafc; padding: 4px; background: #0b1528; border-radius: 6px;">
          <strong style="color: #93c5fd;">${d.district} District HQ</strong><br/>
          <span>Coordinates: ${d.lat.toFixed(4)}° N, ${d.lon.toFixed(4)}° E</span><br/>
          <span>Incident Volume Weight: ${d.base_weight}</span>
        </div>
      `);
    });
  }, [hotspots, districts, mapReady]);

  return (
    <div className="relative w-full h-[540px] rounded-xl overflow-hidden border border-blue-900/50 shadow-2xl bg-slate-950">
      {/* Map Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Layer Selector Toolbar (Top Left) */}
      <div className="absolute top-3 left-14 z-[400] flex items-center bg-slate-950/90 backdrop-blur-md border border-blue-900/60 rounded-lg p-1 text-[11px] font-mono shadow-lg">
        <span className="text-slate-400 px-2 uppercase tracking-wider text-[10px] font-semibold border-r border-blue-900/50 mr-1">
          Map Layer:
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

      {/* Spatial Density Legend (Top Right) */}
      <div className="absolute top-3 right-3 z-[400] bg-slate-950/90 backdrop-blur-md border border-blue-900/60 p-3 rounded-lg text-[11px] font-mono space-y-1.5 shadow-lg">
        <div className="text-blue-300 font-semibold uppercase tracking-wider text-[10px] mb-1 flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
          Spatial Density Legend
        </div>
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
      </div>

      {/* Bottom Status Badge */}
      <div className="absolute bottom-2 left-2 z-[400] bg-slate-950/80 backdrop-blur border border-blue-950 px-2.5 py-1 rounded text-[10px] font-mono text-slate-400 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500" />
        <span>Provider: {TILE_CONFIGS[activeTheme].name}</span>
      </div>
    </div>
  );
}
