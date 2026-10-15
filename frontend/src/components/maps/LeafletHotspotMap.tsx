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

export default function LeafletHotspotMap({
  hotspots,
  districts,
  selectedCity,
}: LeafletHotspotMapProps) {
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === "undefined") return;

      const L = await import("leaflet");
      if (isCancelled) return;

      // Fix Leaflet marker icons
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const container = document.getElementById("leaflet-crimora-map");
      if (!container) return;

      // Safely cleanup previous instance to avoid "Map container is already initialized"
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      (container as any)._leaflet_id = null;

      // Initialize map centered over Tamil Nadu (11.1271° N, 78.6569° E)
      const map = L.map(container, {
        center: [11.1271, 78.6569],
        zoom: 7,
        zoomControl: true,
      });
      mapRef.current = map;

      // Standard open-access dark tile provider
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Render Hotspot Circles with gradient radius based on spatial intensity
      hotspots.forEach((spot) => {
        const radius = Math.max(10000, spot.normalized_intensity * 35000);
        const color =
          spot.normalized_intensity > 0.8
            ? "#f43f5e"
            : spot.normalized_intensity > 0.6
            ? "#f59e0b"
            : "#6366f1";

        const circle = L.circle([spot.latitude, spot.longitude], {
          color: color,
          fillColor: color,
          fillOpacity: 0.35,
          radius: radius,
          weight: 1.5,
        }).addTo(map);

        circle.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; line-height: 1.5; padding: 4px;">
            <strong style="color: #818cf8; font-size: 12px;">${spot.city} Hotspot</strong><br/>
            <span>Priority Rank: <strong>#${spot.rank}</strong></span><br/>
            <span>Density Score: <strong>${spot.estimated_intensity.toFixed(1)}</strong></span><br/>
            <span>Risk Tier: <strong style="color: #10b981;">${spot.percentile_tier}</strong></span><br/>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 5px 0;" />
            <span style="font-size: 10px; color: #94a3b8;">Patrol Directive: ${spot.recommended_patrol}</span>
          </div>
        `);
      });

      // Render Tamil Nadu administrative district nodes
      districts.forEach((d) => {
        const marker = L.circleMarker([d.lat, d.lon], {
          radius: 4,
          color: "#10b981",
          fillColor: "#10b981",
          fillOpacity: 0.85,
          weight: 1,
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-family: monospace; font-size: 11px; color: #f8fafc; padding: 4px;">
            <strong style="color: #10b981;">${d.district} District HQ</strong><br/>
            <span>Coordinates: ${d.lat.toFixed(4)}° N, ${d.lon.toFixed(4)}° E</span><br/>
            <span>Incident Volume Weight: ${d.base_weight}</span>
          </div>
        `);
      });

      setMapLoaded(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      const container = document.getElementById("leaflet-crimora-map");
      if (container) {
        (container as any)._leaflet_id = null;
      }
    };
  }, [hotspots, districts]);

  return (
    <div className="relative w-full h-[500px] rounded-md overflow-hidden border border-slate-800 shadow-md">
      <div id="leaflet-crimora-map" className="w-full h-full" />
      <div className="absolute top-3 right-3 z-[400] bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-md text-[11px] font-mono space-y-1 shadow-md">
        <div className="text-slate-400 font-semibold uppercase tracking-wider mb-1">
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
          <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 inline-block" />
          <span className="text-slate-200">Standard Baseline</span>
        </div>
      </div>
    </div>
  );
}
