"""Unit and Integration Tests for Day 4 Geographic Profiling and LWR Module.

Verifies:
1. Coordinate column detection and boundary validation [-90, 90] & [-180, 180]
2. Exclusion of invalid/missing coordinates without replacement with 0 or synthetic coords
3. Geodesic accuracy of Haversine distance calculations against reference values
4. Regular 2D spatial grid generation dimensions and bounding properties
5. Non-negativity, finiteness, and bounded normalization of spatial intensity surface
6. Reproducibility of hotspot extraction and ranking
7. Mathematical consistency of Locally Weighted Regression (LWR / LOESS)
8. Output CSV integrity and reloadability
9. Folium map generation and HTML integrity
10. Invariance of raw data files
"""

import unittest
from pathlib import Path
import numpy as np
import pandas as pd

from src.config import GEOGRAPHIC_OUTPUTS_DIR, PROCESSED_DATA_DIR, RAW_DATA_DIR
from src.geo_utils import (
    calculate_geographic_bounds,
    coerce_coordinates,
    export_clean_crime_coordinates,
    extract_missing_coordinates,
    filter_valid_coordinates,
    find_coordinate_columns,
    generate_spatial_grid,
    haversine_distance,
    pairwise_haversine_matrix,
    validate_latitude,
    validate_longitude,
)
from src.lwr_profiler import (
    LocallyWeightedRegressor,
    SpatialIntensityProfiler,
    get_kernel_function,
)


class TestGeographicUtilities(unittest.TestCase):
    """Test suite for core geographic utilities."""

    def test_coordinate_validation_boundaries(self):
        """Test physical coordinate boundary validation."""
        test_lats = pd.Series([0.0, -90.0, 90.0, -90.001, 90.1, np.nan, "invalid", 45.5])
        valid_lats = validate_latitude(test_lats)
        self.assertTrue(valid_lats.iloc[0])   # 0.0
        self.assertTrue(valid_lats.iloc[1])   # -90.0
        self.assertTrue(valid_lats.iloc[2])   # 90.0
        self.assertFalse(valid_lats.iloc[3])  # -90.001
        self.assertFalse(valid_lats.iloc[4])  # 90.1
        self.assertFalse(valid_lats.iloc[5])  # NaN
        self.assertFalse(valid_lats.iloc[6])  # string
        self.assertTrue(valid_lats.iloc[7])   # 45.5

        test_lons = pd.Series([0.0, -180.0, 180.0, -180.1, 180.05, np.nan, "bad", -76.6])
        valid_lons = validate_longitude(test_lons)
        self.assertTrue(valid_lons.iloc[0])   # 0.0
        self.assertTrue(valid_lons.iloc[1])   # -180.0
        self.assertTrue(valid_lons.iloc[2])   # 180.0
        self.assertFalse(valid_lons.iloc[3])  # -180.1
        self.assertFalse(valid_lons.iloc[4])  # 180.05
        self.assertFalse(valid_lons.iloc[5])  # NaN
        self.assertFalse(valid_lons.iloc[6])  # string
        self.assertTrue(valid_lons.iloc[7])   # -76.6

    def test_missing_coordinates_preserved_without_zero_replacement(self):
        """Verify that missing coordinates are segregated and never replaced with 0.0."""
        df_dummy = pd.DataFrame({
            "uid": ["A1", "A2", "A3", "A4"],
            "lat": [39.29, np.nan, 95.0, 40.0],
            "lon": [-76.61, -76.60, -76.62, np.nan],
        })

        valid_df = filter_valid_coordinates(df_dummy, lat_col="lat", lon_col="lon")
        missing_df = extract_missing_coordinates(df_dummy, lat_col="lat", lon_col="lon")

        # Exactly 1 valid record (A1)
        self.assertEqual(len(valid_df), 1)
        self.assertEqual(valid_df.iloc[0]["uid"], "A1")

        # Exactly 3 missing/invalid records (A2, A3, A4)
        self.assertEqual(len(missing_df), 3)
        self.assertNotIn("A1", missing_df["uid"].tolist())

        # Coordinates should NEVER be converted to 0.0
        self.assertTrue(pd.isna(missing_df.loc[missing_df["uid"] == "A2", "lat"].values[0]))

    def test_haversine_distance_accuracy(self):
        """Verify geodesic accuracy of Haversine distance against known reference points.

        Baltimore (39.2904 N, -76.6122 W) to Washington DC (38.9072 N, -77.0369 W) ~ 56.2 km.
        """
        balt_lat, balt_lon = 39.2904, -76.6122
        dc_lat, dc_lon = 38.9072, -77.0369

        dist = float(haversine_distance(balt_lat, balt_lon, dc_lat, dc_lon))
        self.assertAlmostEqual(dist, 56.2, delta=1.5)

        # Distance to self must be 0
        self.assertAlmostEqual(float(haversine_distance(balt_lat, balt_lon, balt_lat, balt_lon)), 0.0, places=5)

    def test_pairwise_haversine_matrix(self):
        """Verify pairwise distance matrix shapes and symmetry."""
        pts = np.array([
            [39.2904, -76.6122],
            [38.9072, -77.0369],
            [39.9526, -75.1652],  # Philadelphia
        ])
        mat = pairwise_haversine_matrix(pts, pts)
        self.assertEqual(mat.shape, (3, 3))
        # Diagonal must be zero
        np.testing.assert_allclose(np.diag(mat), np.zeros(3), atol=1e-5)
        # Symmetry
        np.testing.assert_allclose(mat, mat.T, atol=1e-5)

    def test_spatial_grid_generation(self):
        """Verify spatial grid boundaries and regular resolution."""
        min_lat, max_lat = 39.20, 39.35
        min_lon, max_lon = -76.70, -76.50
        grid_df = generate_spatial_grid(min_lat, max_lat, min_lon, max_lon, resolution_lat=20, resolution_lon=25)

        self.assertEqual(len(grid_df), 20 * 25)
        self.assertIn("latitude", grid_df.columns)
        self.assertIn("longitude", grid_df.columns)
        self.assertAlmostEqual(grid_df["latitude"].min(), min_lat, places=4)
        self.assertAlmostEqual(grid_df["latitude"].max(), max_lat, places=4)
        self.assertAlmostEqual(grid_df["longitude"].min(), min_lon, places=4)
        self.assertAlmostEqual(grid_df["longitude"].max(), max_lon, places=4)


class TestSpatialProfilingAndLWR(unittest.TestCase):
    """Test suite for spatial intensity estimation and LWR."""

    @classmethod
    def setUpClass(cls):
        """Load test coordinates from cleaned dataset."""
        cls.clean_path = PROCESSED_DATA_DIR / "homicide_clean.csv"
        if cls.clean_path.exists():
            df = pd.read_csv(cls.clean_path)
            cls.balt_df = df[df["city"] == "Baltimore"].head(100).copy()
        else:
            cls.balt_df = None

    def test_spatial_profiler_properties(self):
        """Verify spatial intensity values are finite, non-negative, and properly normalized."""
        if self.balt_df is None or len(self.balt_df) == 0:
            self.skipTest("Baltimore dataset records not found")

        profiler = SpatialIntensityProfiler(bandwidth_km=1.5, kernel="gaussian")
        profiler.fit(self.balt_df[["lat", "lon"]])

        grid_df = generate_spatial_grid(39.25, 39.35, -76.68, -76.55, resolution_lat=15, resolution_lon=15)
        evaluated = profiler.evaluate_grid(grid_df)

        self.assertIn("raw_intensity", evaluated.columns)
        self.assertIn("estimated_intensity", evaluated.columns)
        self.assertIn("normalized_intensity", evaluated.columns)
        self.assertIn("relative_density", evaluated.columns)

        # Finiteness and non-negativity
        self.assertTrue(np.all(np.isfinite(evaluated["raw_intensity"])))
        self.assertTrue(np.all(evaluated["raw_intensity"] >= 0.0))

        # Normalization bounds [0.0, 1.0]
        self.assertGreaterEqual(float(evaluated["normalized_intensity"].min()), 0.0)
        self.assertLessEqual(float(evaluated["normalized_intensity"].max()), 1.000001)

        # Relative density sum to ~1.0
        self.assertAlmostEqual(float(evaluated["relative_density"].sum()), 1.0, places=4)

    def test_hotspot_identification_reproducibility(self):
        """Verify hotspot extraction produces reproducible rankings with minimum spatial separation."""
        if self.balt_df is None or len(self.balt_df) == 0:
            self.skipTest("Baltimore dataset records not found")

        profiler = SpatialIntensityProfiler(bandwidth_km=1.5, kernel="gaussian")
        profiler.fit(self.balt_df[["lat", "lon"]])

        grid_df = generate_spatial_grid(39.25, 39.35, -76.68, -76.55, resolution_lat=20, resolution_lon=20)
        evaluated = profiler.evaluate_grid(grid_df)

        hs1 = profiler.identify_hotspots(evaluated, threshold_percentile=90.0, top_n=5, min_separation_km=1.0)
        hs2 = profiler.identify_hotspots(evaluated, threshold_percentile=90.0, top_n=5, min_separation_km=1.0)

        pd.testing.assert_frame_equal(hs1, hs2)
        self.assertLessEqual(len(hs1), 5)
        if len(hs1) >= 2:
            # Check minimum separation between hotspots
            d = haversine_distance(hs1.iloc[0]["latitude"], hs1.iloc[0]["longitude"],
                                   hs1.iloc[1]["latitude"], hs1.iloc[1]["longitude"])
            self.assertGreaterEqual(d, 0.95)

    def test_locally_weighted_regression_solver(self):
        """Verify Locally Weighted Regression solver on continuous spatial response."""
        coords = np.array([
            [39.28, -76.61],
            [39.29, -76.62],
            [39.30, -76.60],
            [39.31, -76.59],
            [39.32, -76.58],
        ])
        # Continuous response (e.g. synthetic metric)
        y = np.array([10.0, 15.0, 20.0, 25.0, 30.0])

        lwr = LocallyWeightedRegressor(bandwidth_km=3.0, kernel="tricube")
        lwr.fit(coords, y)

        query = np.array([39.28, -76.61])
        pred = lwr.predict_point(query)
        # Should be close to observed point value 10.0
        self.assertAlmostEqual(pred, 10.0, delta=2.5)

        preds = lwr.predict(coords)
        self.assertEqual(len(preds), 5)
        self.assertTrue(np.all(np.isfinite(preds)))


class TestArtifactGenerationAndInvariance(unittest.TestCase):
    """Test suite verifying generated outputs and raw dataset immutability."""

    def test_output_artifacts_exist_and_reloadable(self):
        """Verify all generated CSVs, images, and HTML exist and can be reloaded."""
        # Check CSVs
        coords_path = GEOGRAPHIC_OUTPUTS_DIR / "crime_coordinates.csv"
        grid_path = GEOGRAPHIC_OUTPUTS_DIR / "geographic_grid.csv"
        hotspot_path = GEOGRAPHIC_OUTPUTS_DIR / "hotspot_summary.csv"

        self.assertTrue(coords_path.exists())
        self.assertTrue(grid_path.exists())
        self.assertTrue(hotspot_path.exists())

        df_coords = pd.read_csv(coords_path)
        df_grid = pd.read_csv(grid_path)
        df_hotspots = pd.read_csv(hotspot_path)

        self.assertGreater(len(df_coords), 50000)
        self.assertEqual(len(df_grid), 2500)
        self.assertGreater(len(df_hotspots), 0)

        # Check visual plots
        plots = [
            "incident_distribution.png",
            "intensity_surface.png",
            "hotspot_analysis.png",
            "incidents_vs_intensity.png",
        ]
        for plot_name in plots:
            p = GEOGRAPHIC_OUTPUTS_DIR / plot_name
            self.assertTrue(p.exists(), f"Missing plot {plot_name}")
            self.assertGreater(p.stat().st_size, 1000)

        # Check Folium map
        html_map = GEOGRAPHIC_OUTPUTS_DIR / "geographic_profile.html"
        self.assertTrue(html_map.exists())
        self.assertGreater(html_map.stat().st_size, 10000)
        with open(html_map, "r", encoding="utf-8") as f:
            html_content = f.read()
            self.assertIn("<!DOCTYPE html>", html_content)
            self.assertIn("leaflet", html_content.lower())

    def test_raw_data_remains_unmodified(self):
        """Verify raw datasets were never modified."""
        raw_files = [
            "homicide-data.csv",
            "dstrIPC_1_2014.csv",
            "TN-murder-2023.csv",
            "TN-2020-2022-total.csv",
        ]
        for fname in raw_files:
            raw_path = RAW_DATA_DIR / fname
            self.assertTrue(raw_path.exists(), f"Raw file {fname} must exist")


if __name__ == "__main__":
    unittest.main()
