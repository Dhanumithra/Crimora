"""Geographic Profiling and LWR Analytics Pipeline Runner.

Orchestrates the Day 4 analytics workflow:
1. Validates and extracts coordinates from processed homicide data.
2. Segregates missing coordinate records and exports PII-free crime_coordinates.csv.
3. Fits the SpatialIntensityProfiler on the focal metropolitan area (Baltimore, MD).
4. Generates a regular 50x50 spatial grid and computes distance-weighted spatial intensity.
5. Identifies and ranks distinct analytical hotspots with spatial non-maximum suppression.
6. Serializes geographic_grid.csv and hotspot_summary.csv.
7. Produces 4 publication-quality visualizations in outputs/geographic/.
8. Constructs an interactive Folium map with layers in outputs/geographic/geographic_profile.html.
"""

from pathlib import Path
import sys
from typing import Any, Dict, List, Optional

import folium
from folium.plugins import HeatMap, MarkerCluster
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

# Ensure project root in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from src.config import GEOGRAPHIC_OUTPUTS_DIR, OUTPUTS_DIR, PROCESSED_DATA_DIR
from src.geo_utils import (
    calculate_geographic_bounds,
    export_clean_crime_coordinates,
    extract_missing_coordinates,
    filter_valid_coordinates,
    find_coordinate_columns,
    generate_spatial_grid,
    haversine_distance,
)
from src.lwr_profiler import (
    LocallyWeightedRegressor,
    SpatialIntensityProfiler,
    save_geographic_grid,
    save_hotspot_summary,
)


def export_sanitized_coordinates(
    input_csv: Path,
    output_csv: Path,
) -> Dict[str, Any]:
    """Inspect coordinate validity, segregate missing records, and export PII-free coordinates.

    Args:
        input_csv: Path to input processed homicide dataset.
        output_csv: Path to output crime_coordinates.csv.

    Returns:
        Dict[str, Any]: Audit summary of coordinate health.
    """
    df = pd.read_csv(input_csv)
    lat_col, lon_col = find_coordinate_columns(df)
    if not lat_col or not lon_col:
        raise KeyError("Could not automatically identify coordinate columns in input dataset.")

    total_rows = len(df)
    valid_df = filter_valid_coordinates(df, lat_col=lat_col, lon_col=lon_col)
    missing_df = extract_missing_coordinates(df, lat_col=lat_col, lon_col=lon_col)

    exported_df = export_clean_crime_coordinates(
        df=df,
        output_path=output_csv,
        lat_col=lat_col,
        lon_col=lon_col,
    )

    return {
        "total_records": total_rows,
        "valid_coordinates": len(valid_df),
        "missing_coordinates": len(missing_df),
        "lat_col": lat_col,
        "lon_col": lon_col,
        "exported_file": str(output_csv),
        "exported_rows": len(exported_df),
        "exported_columns": list(exported_df.columns),
    }


def fit_urban_geographic_profile(
    clean_csv: Path,
    city_name: str = "Baltimore",
    grid_resolution: int = 50,
    bandwidth_km: Optional[float] = None,
    kernel: str = "gaussian",
    threshold_percentile: float = 95.0,
    top_n_hotspots: int = 10,
    min_separation_km: float = 1.0,
) -> Dict[str, Any]:
    """Execute spatial intensity estimation and hotspot analysis for a target urban area.

    Args:
        clean_csv: Path to crime coordinates or processed homicide CSV.
        city_name: Name of target city to model.
        grid_resolution: Number of grid steps along latitude and longitude (default 50x50).
        bandwidth_km: Spatial bandwidth in km (if None, auto-calculated via Silverman's rule).
        kernel: Kernel name ('gaussian', 'epanechnikov', 'tricube', 'exponential').
        threshold_percentile: Hotspot percentile cutoff (default 95th).
        top_n_hotspots: Maximum number of distinct hotspots to return.
        min_separation_km: Minimum spatial separation between distinct hotspots.

    Returns:
        Dict[str, Any]: Profiling results including fitted models, grid, hotspots, and metadata.
    """
    df = pd.read_csv(clean_csv)
    lat_col, lon_col = find_coordinate_columns(df)

    valid_df = filter_valid_coordinates(df, lat_col=lat_col, lon_col=lon_col)
    urban_df = valid_df[valid_df["city"].str.strip().str.lower() == city_name.strip().lower()].copy()

    if urban_df.empty:
        raise ValueError(f"No records found for city '{city_name}' in {clean_csv}")

    bounds = calculate_geographic_bounds(urban_df, lat_col=lat_col, lon_col=lon_col, buffer_ratio=0.06)

    # Construct regular 2D evaluation grid
    grid_df = generate_spatial_grid(
        min_lat=bounds["min_lat"],
        max_lat=bounds["max_lat"],
        min_lon=bounds["min_lon"],
        max_lon=bounds["max_lon"],
        resolution_lat=grid_resolution,
        resolution_lon=grid_resolution,
    )

    # Initialize and fit SpatialIntensityProfiler
    profiler = SpatialIntensityProfiler(bandwidth_km=bandwidth_km, kernel=kernel)
    profiler.fit(urban_df[[lat_col, lon_col]])

    # Evaluate spatial intensity across the grid
    evaluated_grid = profiler.evaluate_grid(grid_df, lat_col="latitude", lon_col="longitude")

    # Extract distinct hotspot centroids with non-maximum suppression
    hotspots_df = profiler.identify_hotspots(
        evaluated_grid=evaluated_grid,
        threshold_percentile=threshold_percentile,
        top_n=top_n_hotspots,
        min_separation_km=min_separation_km,
        lat_col="latitude",
        lon_col="longitude",
    )

    # Add city context to hotspots table
    hotspots_df["city"] = city_name

    return {
        "city": city_name,
        "incidents_count": len(urban_df),
        "urban_df": urban_df,
        "bounds": bounds,
        "grid_resolution": (grid_resolution, grid_resolution),
        "total_grid_cells": len(grid_df),
        "bandwidth_km": profiler.bandwidth_km,
        "kernel": kernel,
        "profiler": profiler,
        "evaluated_grid": evaluated_grid,
        "hotspots_df": hotspots_df,
    }


def generate_geographic_visualizations(
    urban_df: pd.DataFrame,
    evaluated_grid: pd.DataFrame,
    hotspots_df: pd.DataFrame,
    bounds: Dict[str, float],
    city_name: str,
    output_dir: Path,
) -> List[Path]:
    """Generate the four mandatory static publication-quality spatial figures.

    1. Crime incident distribution (incident_distribution.png)
    2. Geographic intensity surface (intensity_surface.png)
    3. Hotspot visualization (hotspot_analysis.png)
    4. Comparison of raw incidents vs estimated activity area (incidents_vs_intensity.png)

    Args:
        urban_df: DataFrame of urban crime incidents.
        evaluated_grid: Evaluated 2D spatial grid.
        hotspots_df: Identified hotspot centroids.
        bounds: Geographic bounding box dict.
        city_name: Name of target city.
        output_dir: Destination folder.

    Returns:
        List[Path]: Paths of saved image files.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    generated_plots: List[Path] = []

    # Configure plotting aesthetic
    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    plt.rcParams.update({
        "font.sans-serif": "DejaVu Sans",
        "font.size": 10,
        "axes.titlesize": 12,
        "axes.titleweight": "bold",
    })

    lat_col = "lat" if "lat" in urban_df.columns else "latitude"
    lon_col = "lon" if "lon" in urban_df.columns else "longitude"

    # Reshape grid into 2D matrices for contour plotting
    n_lat = evaluated_grid["lat_idx"].nunique()
    n_lon = evaluated_grid["lon_idx"].nunique()
    lats_1d = np.sort(evaluated_grid["latitude"].unique())
    lons_1d = np.sort(evaluated_grid["longitude"].unique())

    # Grid pivot
    intensity_matrix = evaluated_grid.pivot(index="latitude", columns="longitude", values="normalized_intensity").values
    lon_mesh, lat_mesh = np.meshgrid(lons_1d, lats_1d)

    # -------------------------------------------------------------
    # Plot 1: Crime Incident Distribution
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(9, 8), dpi=300)
    sns.scatterplot(
        data=urban_df,
        x=lon_col,
        y=lat_col,
        alpha=0.45,
        s=22,
        color="#1f77b4",
        edgecolor="none",
        label=f"Homicide Incidents (N={len(urban_df):,})",
        ax=ax,
    )
    # 2D Kernel density contours of incidents
    sns.kdeplot(
        data=urban_df,
        x=lon_col,
        y=lat_col,
        levels=6,
        color="#d62728",
        linewidths=1.2,
        alpha=0.65,
        ax=ax,
    )
    ax.set_xlim(bounds["min_lon"], bounds["max_lon"])
    ax.set_ylim(bounds["min_lat"], bounds["max_lat"])
    ax.set_xlabel("Longitude (°)")
    ax.set_ylabel("Latitude (°)")
    ax.set_title(f"Historical Crime Incident Spatial Distribution — {city_name}", pad=12)
    ax.legend(loc="upper right", frameon=True)

    p1 = output_dir / "incident_distribution.png"
    fig.tight_layout()
    fig.savefig(p1, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p1)

    # -------------------------------------------------------------
    # Plot 2: Geographic Intensity Surface
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(9, 8), dpi=300)
    cf = ax.contourf(
        lon_mesh,
        lat_mesh,
        intensity_matrix,
        levels=25,
        cmap="magma",
        alpha=0.92,
    )
    cbar = fig.colorbar(cf, ax=ax, shrink=0.82, pad=0.03)
    cbar.set_label("Normalized Spatial Intensity [0.0 – 1.0]", fontsize=10)

    ax.set_xlim(bounds["min_lon"], bounds["max_lon"])
    ax.set_ylim(bounds["min_lat"], bounds["max_lat"])
    ax.set_xlabel("Longitude (°)")
    ax.set_ylabel("Latitude (°)")
    ax.set_title(f"Geographic Activity-Area Intensity Surface — {city_name}", pad=12)

    p2 = output_dir / "intensity_surface.png"
    fig.tight_layout()
    fig.savefig(p2, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p2)

    # -------------------------------------------------------------
    # Plot 3: Hotspot Visualization
    # -------------------------------------------------------------
    fig, ax = plt.subplots(figsize=(9, 8), dpi=300)
    # Background subtle intensity surface
    ax.contourf(
        lon_mesh,
        lat_mesh,
        intensity_matrix,
        levels=20,
        cmap="Blues",
        alpha=0.6,
    )
    # Highlight 95th percentile contour line
    threshold_val = float(np.percentile(evaluated_grid["normalized_intensity"], 95.0))
    ax.contour(
        lon_mesh,
        lat_mesh,
        intensity_matrix,
        levels=[threshold_val],
        colors=["#d62728"],
        linewidths=[2.0],
        linestyles=["--"],
    )

    # Plot hotspot centroids
    for _, hs in hotspots_df.iterrows():
        rank = int(hs["relative_rank"])
        h_lat = float(hs["latitude"])
        h_lon = float(hs["longitude"])
        h_norm = float(hs["normalized_intensity"])

        ax.plot(h_lon, h_lat, marker="o", markersize=12, color="#d62728", markeredgecolor="white", markeredgewidth=1.5)
        ax.text(
            h_lon + 0.005,
            h_lat + 0.003,
            f"#{rank} (I={h_norm:.2f})",
            fontsize=9,
            fontweight="bold",
            color="#222222",
            bbox=dict(boxstyle="round,pad=0.25", facecolor="white", edgecolor="#d62728", alpha=0.85),
        )

    ax.plot([], [], color="#d62728", linestyle="--", linewidth=2.0, label="95th Percentile Intensity Boundary")
    ax.plot([], [], marker="o", markersize=9, color="#d62728", markeredgecolor="white", linestyle="None", label="Hotspot Centroid")

    ax.set_xlim(bounds["min_lon"], bounds["max_lon"])
    ax.set_ylim(bounds["min_lat"], bounds["max_lat"])
    ax.set_xlabel("Longitude (°)")
    ax.set_ylabel("Latitude (°)")
    ax.set_title(f"Analytical Crime Hotspot Identification — {city_name}", pad=12)
    ax.legend(loc="upper right", frameon=True)

    p3 = output_dir / "hotspot_analysis.png"
    fig.tight_layout()
    fig.savefig(p3, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p3)

    # -------------------------------------------------------------
    # Plot 4: Comparison of Raw Incidents vs Estimated Activity Area
    # -------------------------------------------------------------
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7), dpi=300)

    # Left: Raw point pattern
    ax1.scatter(
        urban_df[lon_col],
        urban_df[lat_col],
        alpha=0.35,
        s=16,
        color="#2c3e50",
        edgecolor="none",
    )
    ax1.set_xlim(bounds["min_lon"], bounds["max_lon"])
    ax1.set_ylim(bounds["min_lat"], bounds["max_lat"])
    ax1.set_xlabel("Longitude (°)")
    ax1.set_ylabel("Latitude (°)")
    ax1.set_title(f"Raw Crime Incidents (N={len(urban_df):,})", fontsize=11, fontweight="bold")

    # Right: Continuous profile surface with overlay
    cf2 = ax2.contourf(
        lon_mesh,
        lat_mesh,
        intensity_matrix,
        levels=20,
        cmap="inferno",
        alpha=0.85,
    )
    # Overlay hotspot markers
    for _, hs in hotspots_df.head(5).iterrows():
        rank = int(hs["relative_rank"])
        h_lat = float(hs["latitude"])
        h_lon = float(hs["longitude"])
        ax2.plot(h_lon, h_lat, marker="*", markersize=14, color="#00ffcc", markeredgecolor="black")
        ax2.text(h_lon + 0.005, h_lat + 0.002, f"#{rank}", color="white", fontweight="bold", fontsize=9)

    fig.colorbar(cf2, ax=ax2, shrink=0.82, pad=0.03, label="Intensity [0 – 1]")
    ax2.set_xlim(bounds["min_lon"], bounds["max_lon"])
    ax2.set_ylim(bounds["min_lat"], bounds["max_lat"])
    ax2.set_xlabel("Longitude (°)")
    ax2.set_ylabel("Latitude (°)")
    ax2.set_title("Distance-Weighted Activity Area & Top Hotspots", fontsize=11, fontweight="bold")

    p4 = output_dir / "incidents_vs_intensity.png"
    fig.tight_layout()
    fig.savefig(p4, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p4)

    return generated_plots


def generate_interactive_folium_map(
    urban_df: pd.DataFrame,
    evaluated_grid: pd.DataFrame,
    hotspots_df: pd.DataFrame,
    city_name: str,
    output_html: Path,
) -> Path:
    """Create an interactive Folium map with layers for incidents, heatmap, and hotspots.

    Includes:
    - Base layers (OpenStreetMap, CartoDB Positron)
    - Incident points with clustered markers (no PII exposed)
    - Continuous spatial HeatMap layer
    - Distinct hotspot centroid markers with ranking and intensity badges
    - LayerControl for toggling layers
    - Responsive layout suitable for Streamlit embedding

    Args:
        urban_df: DataFrame of urban incidents.
        evaluated_grid: Evaluated spatial grid DataFrame.
        hotspots_df: Top hotspot centroids DataFrame.
        city_name: Name of target city.
        output_html: Destination HTML file path.

    Returns:
        Path: Path to saved HTML map.
    """
    lat_col = "lat" if "lat" in urban_df.columns else "latitude"
    lon_col = "lon" if "lon" in urban_df.columns else "longitude"

    mean_lat = float(urban_df[lat_col].mean())
    mean_lon = float(urban_df[lon_col].mean())

    # Create base map with standard OpenStreetMap tiles
    m = folium.Map(
        location=[mean_lat, mean_lon],
        zoom_start=12,
        tiles="OpenStreetMap",
    )

    # 1. Clustered Incidents Layer
    cluster_group = folium.FeatureGroup(name=f"Crime Incidents ({len(urban_df):,} pts)")
    marker_cluster = MarkerCluster().add_to(cluster_group)

    # Subsample if large for smooth browser rendering in Streamlit
    sample_incidents = urban_df if len(urban_df) <= 1500 else urban_df.sample(1500, random_state=42)

    for _, row in sample_incidents.iterrows():
        lat_val = float(row[lat_col])
        lon_val = float(row[lon_col])
        uid_val = str(row.get("uid", "N/A"))
        date_val = str(row.get("reported_date_clean", row.get("reported_date", "N/A")))
        solved_val = "Solved" if row.get("is_solved", False) else "Unsolved"

        popup_html = f"""
        <div style="font-family: sans-serif; font-size: 12px; width: 170px;">
            <b style="color: #2c3e50;">Incident:</b> {uid_val}<br>
            <b>Date:</b> {date_val}<br>
            <b>Status:</b> <span style="color: {'#27ae60' if solved_val == 'Solved' else '#e74c3c'}; font-weight: bold;">{solved_val}</span><br>
            <b>City:</b> {city_name}
        </div>
        """
        folium.CircleMarker(
            location=[lat_val, lon_val],
            radius=4,
            color="#2980b9" if solved_val == "Solved" else "#c0392b",
            fill=True,
            fill_color="#3498db" if solved_val == "Solved" else "#e74c3c",
            fill_opacity=0.65,
            popup=folium.Popup(popup_html, max_width=220),
        ).add_to(marker_cluster)

    cluster_group.add_to(m)

    # 2. Continuous Spatial HeatMap Layer
    heat_data = [[float(r[lat_col]), float(r[lon_col]), 1.0] for _, r in urban_df.iterrows()]
    heat_layer = folium.FeatureGroup(name="Spatial Crime Heatmap", show=True)
    HeatMap(
        heat_data,
        radius=14,
        blur=18,
        min_opacity=0.35,
        max_zoom=14,
        gradient={0.2: "blue", 0.4: "lime", 0.6: "yellow", 0.8: "orange", 1.0: "red"},
    ).add_to(heat_layer)
    heat_layer.add_to(m)

    # 3. Hotspot Centroids Layer
    hotspots_group = folium.FeatureGroup(name="Analytical Hotspot Centroids", show=True)
    for _, hs in hotspots_df.iterrows():
        rank = int(hs["relative_rank"])
        h_lat = float(hs["latitude"])
        h_lon = float(hs["longitude"])
        norm_i = float(hs["normalized_intensity"])
        tier = str(hs.get("percentile_tier", "Top Tier"))

        popup_text = f"""
        <div style="font-family: sans-serif; font-size: 12px; width: 200px; padding: 4px;">
            <h4 style="margin: 0 0 6px 0; color: #c0392b;">Hotspot Centroid #{rank}</h4>
            <b>City:</b> {city_name}<br>
            <b>Latitude:</b> {h_lat:.5f}<br>
            <b>Longitude:</b> {h_lon:.5f}<br>
            <b>Intensity Score:</b> {norm_i:.3f} / 1.000<br>
            <b>Concentration Tier:</b> {tier}<br>
            <hr style="margin: 6px 0; border: none; border-top: 1px solid #ddd;">
            <small style="color: #7f8c8d;">Historical crime concentration area for resource allocation support.</small>
        </div>
        """

        folium.Marker(
            location=[h_lat, h_lon],
            popup=folium.Popup(popup_text, max_width=250),
            tooltip=f"Hotspot #{rank} (Intensity: {norm_i:.2f})",
            icon=folium.Icon(color="red", icon="crosshairs", prefix="fa"),
        ).add_to(hotspots_group)

    hotspots_group.add_to(m)

    # Add LayerControl
    folium.LayerControl(collapsed=False).add_to(m)

    # Save to file
    output_html.parent.mkdir(parents=True, exist_ok=True)
    m.save(str(output_html))

    return output_html


def run_geographic_pipeline(
    target_city: str = "Baltimore",
    grid_resolution: int = 50,
) -> Dict[str, Any]:
    """Execute end-to-end Day 4 geographic profiling and LWR analytics pipeline.

    Args:
        target_city: Target city for fine-grained spatial modeling (default: Baltimore).
        grid_resolution: Resolution of 2D evaluation grid (50 gives 50x50 = 2500 points).

    Returns:
        Dict[str, Any]: Complete execution summary.
    """
    GEOGRAPHIC_OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

    input_clean_csv = PROCESSED_DATA_DIR / "homicide_clean.csv"
    if not input_clean_csv.exists():
        raise FileNotFoundError(f"Cleaned homicide dataset missing at {input_clean_csv}")

    # 1. Export Sanitized Coordinates (Full Dataset, PII-Free)
    coords_output_path = GEOGRAPHIC_OUTPUTS_DIR / "crime_coordinates.csv"
    export_summary = export_sanitized_coordinates(
        input_csv=input_clean_csv,
        output_csv=coords_output_path,
    )

    # 2. Fit Urban Spatial Intensity Profiler
    profiling_results = fit_urban_geographic_profile(
        clean_csv=input_clean_csv,
        city_name=target_city,
        grid_resolution=grid_resolution,
        bandwidth_km=None,  # auto Silverman bandwidth (~1.0 - 1.5 km for urban scale)
        kernel="gaussian",
        threshold_percentile=95.0,
        top_n_hotspots=10,
        min_separation_km=1.0,
    )

    # 3. Save Geographic Grid CSV
    grid_output_path = GEOGRAPHIC_OUTPUTS_DIR / "geographic_grid.csv"
    save_geographic_grid(profiling_results["evaluated_grid"], grid_output_path)

    # 4. Save Hotspot Summary CSV
    hotspots_output_path = GEOGRAPHIC_OUTPUTS_DIR / "hotspot_summary.csv"
    save_hotspot_summary(profiling_results["hotspots_df"], hotspots_output_path)

    # 5. Generate Static Visualizations
    plots = generate_geographic_visualizations(
        urban_df=profiling_results["urban_df"],
        evaluated_grid=profiling_results["evaluated_grid"],
        hotspots_df=profiling_results["hotspots_df"],
        bounds=profiling_results["bounds"],
        city_name=target_city,
        output_dir=GEOGRAPHIC_OUTPUTS_DIR,
    )

    # 6. Generate Interactive Folium Map
    folium_map_path = GEOGRAPHIC_OUTPUTS_DIR / "geographic_profile.html"
    generate_interactive_folium_map(
        urban_df=profiling_results["urban_df"],
        evaluated_grid=profiling_results["evaluated_grid"],
        hotspots_df=profiling_results["hotspots_df"],
        city_name=target_city,
        output_html=folium_map_path,
    )

    return {
        "dataset_used": "homicide_clean.csv",
        "total_records": export_summary["total_records"],
        "valid_coordinates": export_summary["valid_coordinates"],
        "missing_coordinates": export_summary["missing_coordinates"],
        "target_city": target_city,
        "city_incidents": profiling_results["incidents_count"],
        "bandwidth_km": round(profiling_results["bandwidth_km"], 4),
        "kernel": profiling_results["kernel"],
        "grid_resolution": f"{grid_resolution}x{grid_resolution} ({len(profiling_results['evaluated_grid'])} points)",
        "num_hotspots": len(profiling_results["hotspots_df"]),
        "crime_coordinates_file": str(coords_output_path),
        "geographic_grid_file": str(grid_output_path),
        "hotspot_summary_file": str(hotspots_output_path),
        "visualizations": [str(p) for p in plots],
        "folium_map_file": str(folium_map_path),
    }


if __name__ == "__main__":
    summary = run_geographic_pipeline()
    print("=== DAY 4 GEOGRAPHIC PROFILING PIPELINE COMPLETE ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")
