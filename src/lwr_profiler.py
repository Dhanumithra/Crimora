"""Geographic Profiling and Locally Weighted Regression (LWR) Analytics Module.

Implements defensible spatial profiling methodology:
1. Kernel-Weighted Spatial Intensity Estimation (Geographic Activity-Area Profiling)
   - Gaussian, Epanechnikov, Tri-cube, and Exponential spatial kernels
   - Vectorized Haversine distance weighting
   - Configurable and data-driven bandwidth selection
   - Intensity surface normalization
   - Local hotspot detection with spatial non-maximum suppression
2. Locally Weighted Regression (LWR / LOESS)
   - Mathematically valid closed-form local linear regression: (X'WX + lambda*I)^(-1) X'Wy
   - Formal theoretical documentation on point processes vs. continuous response regression

Terminology strictly adheres to academic criminology standards:
- 'geographic activity-area estimation'
- 'crime concentration'
- 'spatial intensity'
- 'historical geographic pattern'
- 'analytical hotspot'
(Never claims offender residence or individual guilt).
"""

from pathlib import Path
from typing import Callable, Dict, List, Optional, Tuple, Union
import numpy as np
import pandas as pd

from src.geo_utils import haversine_distance, pairwise_haversine_matrix


# =====================================================================
# 1. Spatial Kernel Weighting Functions
# =====================================================================

def gaussian_kernel(u: np.ndarray) -> np.ndarray:
    """Standard Gaussian (radial basis) kernel: K(u) = (1 / sqrt(2*pi)) * exp(-0.5 * u^2).

    Args:
        u: Scaled distance array (distance / bandwidth).

    Returns:
        np.ndarray: Kernel weights.
    """
    return (1.0 / np.sqrt(2.0 * np.pi)) * np.exp(-0.5 * (u ** 2))


def epanechnikov_kernel(u: np.ndarray) -> np.ndarray:
    """Epanechnikov parabolic kernel: K(u) = 0.75 * (1 - u^2) for |u| <= 1, 0 otherwise.

    Optimal in minimum mean integrated squared error sense.

    Args:
        u: Scaled distance array (distance / bandwidth).

    Returns:
        np.ndarray: Kernel weights.
    """
    weights = np.zeros_like(u)
    mask = np.abs(u) <= 1.0
    weights[mask] = 0.75 * (1.0 - u[mask] ** 2)
    return weights


def tricube_kernel(u: np.ndarray) -> np.ndarray:
    """Tri-cube kernel (Cleveland LOESS standard): K(u) = (1 - |u|^3)^3 for |u| <= 1, 0 otherwise.

    Provides smooth continuous second derivatives at boundary.

    Args:
        u: Scaled distance array (distance / bandwidth).

    Returns:
        np.ndarray: Kernel weights.
    """
    weights = np.zeros_like(u)
    abs_u = np.abs(u)
    mask = abs_u <= 1.0
    weights[mask] = (1.0 - (abs_u[mask] ** 3)) ** 3
    return weights


def exponential_kernel(u: np.ndarray) -> np.ndarray:
    """Exponential distance decay kernel: K(u) = exp(-u) for u >= 0.

    Models continuous monotonic spatial decay (Rossmo-style distance attenuation).

    Args:
        u: Scaled distance array (distance / bandwidth).

    Returns:
        np.ndarray: Kernel weights.
    """
    return np.exp(-np.abs(u))


KERNEL_REGISTRY: Dict[str, Callable[[np.ndarray], np.ndarray]] = {
    "gaussian": gaussian_kernel,
    "epanechnikov": epanechnikov_kernel,
    "tricube": tricube_kernel,
    "exponential": exponential_kernel,
}


def get_kernel_function(name: str) -> Callable[[np.ndarray], np.ndarray]:
    """Retrieve kernel weighting function by identifier.

    Args:
        name: Name of kernel ('gaussian', 'epanechnikov', 'tricube', 'exponential').

    Returns:
        Callable: Kernel function.
    """
    clean_name = name.strip().lower()
    if clean_name not in KERNEL_REGISTRY:
        raise ValueError(
            f"Unknown kernel '{name}'. Supported kernels: {list(KERNEL_REGISTRY.keys())}"
        )
    return KERNEL_REGISTRY[clean_name]


# =====================================================================
# 2. Bandwidth Selection Utilities
# =====================================================================

def estimate_silverman_bandwidth(coords: np.ndarray) -> float:
    """Estimate spatial bandwidth using Silverman's rule of thumb adapted for 2D geographic coordinates.

    Formula:
        h = (4 / (d + 2))^(1 / (d + 4)) * sigma * n^(-1 / (d + 4))
        For d = 2: h = (1.0) * sigma * n^(-1/6)
        where sigma is the pooled standard deviation in kilometers.

    Args:
        coords: Array of shape (N, 2) where col 0 is lat, col 1 is lon.

    Returns:
        float: Estimated bandwidth in kilometers.
    """
    n = len(coords)
    if n < 2:
        return 1.0

    lat_std = float(np.std(coords[:, 0]))
    lon_std = float(np.std(coords[:, 1]))
    mid_lat = float(np.mean(coords[:, 0]))

    # Convert degrees to approximate kilometers (1 deg lat ~ 111 km, 1 deg lon ~ 111 * cos(lat) km)
    lat_km_std = lat_std * 111.0
    lon_km_std = lon_std * (111.0 * np.cos(np.radians(mid_lat)))

    pooled_sigma = np.sqrt(0.5 * (lat_km_std ** 2 + lon_km_std ** 2))
    if pooled_sigma <= 1e-6:
        return 1.0

    h = pooled_sigma * (n ** (-1.0 / 6.0))
    # Bound between 0.2 km (urban block level) and 10.0 km
    return float(np.clip(h, 0.2, 10.0))


# =====================================================================
# 3. Spatial Intensity Profiler (Distance-Weighted Geographic Profiling)
# =====================================================================

class SpatialIntensityProfiler:
    """Distance-Weighted Geographic Profiler for spatial crime concentration estimation.

    Estimates spatial point process intensity lambda(x) at continuous grid evaluation points:
        lambda(x) = (1 / (N * h^2)) * sum_{i=1}^N K( d(x, x_i) / h )
    where d(x, x_i) is the geodesic Haversine distance in kilometers and h is bandwidth.
    """

    def __init__(
        self,
        bandwidth_km: Optional[float] = None,
        kernel: str = "gaussian",
    ) -> None:
        """Initialize profiler.

        Args:
            bandwidth_km: Bandwidth in kilometers. If None, auto-estimated on fit.
            kernel: Kernel function name ('gaussian', 'epanechnikov', 'tricube', 'exponential').
        """
        self.bandwidth_km = bandwidth_km
        self.kernel_name = kernel
        self.kernel_fn = get_kernel_function(kernel)
        self.train_coords: Optional[np.ndarray] = None
        self.n_samples: int = 0

    def fit(self, coords: Union[np.ndarray, pd.DataFrame]) -> "SpatialIntensityProfiler":
        """Fit profiler with observed incident coordinates.

        Args:
            coords: (N, 2) array or DataFrame with lat in col 0, lon in col 1.

        Returns:
            SpatialIntensityProfiler: Fitted instance.
        """
        if isinstance(coords, pd.DataFrame):
            if "latitude" in coords.columns and "longitude" in coords.columns:
                arr = coords[["latitude", "longitude"]].to_numpy(dtype=float)
            elif "lat" in coords.columns and "lon" in coords.columns:
                arr = coords[["lat", "lon"]].to_numpy(dtype=float)
            else:
                arr = coords.iloc[:, :2].to_numpy(dtype=float)
        else:
            arr = np.asarray(coords, dtype=float)

        if arr.ndim != 2 or arr.shape[1] != 2:
            raise ValueError(f"Expected coords array of shape (N, 2), got {arr.shape}.")

        # Drop non-finite rows safely
        finite_mask = np.isfinite(arr[:, 0]) & np.isfinite(arr[:, 1])
        self.train_coords = arr[finite_mask]
        self.n_samples = len(self.train_coords)

        if self.n_samples == 0:
            raise ValueError("No valid coordinates provided for spatial profiling.")

        if self.bandwidth_km is None or self.bandwidth_km <= 0:
            self.bandwidth_km = estimate_silverman_bandwidth(self.train_coords)

        return self

    def predict_intensity(
        self,
        query_coords: Union[np.ndarray, pd.DataFrame],
        batch_size: int = 500,
    ) -> np.ndarray:
        """Calculate unnormalized and normalized spatial intensity at query points.

        Uses batched computation to maintain low memory overhead even for large grids.

        Args:
            query_coords: (M, 2) array of evaluation coordinates.
            batch_size: Number of query points to evaluate concurrently.

        Returns:
            np.ndarray: Array of estimated spatial intensity values of length M.
        """
        if self.train_coords is None or self.bandwidth_km is None:
            raise RuntimeError("Profiler must be fitted before predict_intensity.")

        if isinstance(query_coords, pd.DataFrame):
            if "latitude" in query_coords.columns and "longitude" in query_coords.columns:
                q_arr = query_coords[["latitude", "longitude"]].to_numpy(dtype=float)
            elif "lat" in query_coords.columns and "lon" in query_coords.columns:
                q_arr = query_coords[["lat", "lon"]].to_numpy(dtype=float)
            else:
                q_arr = query_coords.iloc[:, :2].to_numpy(dtype=float)
        else:
            q_arr = np.asarray(query_coords, dtype=float)

        m = len(q_arr)
        intensities = np.zeros(m, dtype=float)
        h = float(self.bandwidth_km)
        area_scale = 1.0 / (self.n_samples * (h ** 2))

        for start_idx in range(0, m, batch_size):
            end_idx = min(start_idx + batch_size, m)
            batch_q = q_arr[start_idx:end_idx]  # (B, 2)

            # Pairwise distance matrix: shape (B, N)
            dist_matrix = pairwise_haversine_matrix(batch_q, self.train_coords)
            scaled_dist = dist_matrix / h
            weights = self.kernel_fn(scaled_dist)

            intensities[start_idx:end_idx] = np.sum(weights, axis=1) * area_scale

        return intensities

    def evaluate_grid(
        self,
        grid_df: pd.DataFrame,
        lat_col: str = "latitude",
        lon_col: str = "longitude",
    ) -> pd.DataFrame:
        """Evaluate spatial profile over a regular spatial grid DataFrame.

        Appends:
        - raw_intensity: Absolute kernel density estimation
        - normalized_intensity: Scaled to [0.0, 1.0] (min-max)
        - relative_density: Scaled so that sum(relative_density) == 1.0

        Args:
            grid_df: DataFrame containing spatial grid coordinates.
            lat_col: Latitude column name.
            lon_col: Longitude column name.

        Returns:
            pd.DataFrame: Grid DataFrame augmented with intensity measures.
        """
        out_df = grid_df.copy()
        q_coords = out_df[[lat_col, lon_col]].to_numpy(dtype=float)

        raw_intensity = self.predict_intensity(q_coords)
        out_df["raw_intensity"] = raw_intensity
        out_df["estimated_intensity"] = raw_intensity

        # Normalization to [0, 1]
        min_val = float(raw_intensity.min())
        max_val = float(raw_intensity.max())
        span = max_val - min_val

        if span > 1e-12:
            out_df["normalized_intensity"] = (raw_intensity - min_val) / span
        else:
            out_df["normalized_intensity"] = np.zeros_like(raw_intensity)

        # Relative density summing to 1.0
        total_intensity = float(raw_intensity.sum())
        if total_intensity > 1e-12:
            out_df["relative_density"] = raw_intensity / total_intensity
        else:
            out_df["relative_density"] = np.zeros_like(raw_intensity)

        return out_df

    def identify_hotspots(
        self,
        evaluated_grid: pd.DataFrame,
        threshold_percentile: float = 95.0,
        top_n: int = 10,
        min_separation_km: float = 1.0,
        lat_col: str = "latitude",
        lon_col: str = "longitude",
    ) -> pd.DataFrame:
        """Identify peak concentration hotspot centroids with spatial non-maximum suppression.

        Filters grid cells exceeding the percentile threshold and applies spatial suppression
        so that neighboring cells belonging to the same geographic cluster are grouped into a
        single distinct peak hotspot.

        Args:
            evaluated_grid: DataFrame output from evaluate_grid.
            threshold_percentile: Minimum intensity percentile to qualify as candidate hotspot.
            top_n: Maximum number of distinct hotspot centroids to report.
            min_separation_km: Minimum distance in km between reported distinct hotspots.
            lat_col: Latitude column name.
            lon_col: Longitude column name.

        Returns:
            pd.DataFrame: Hotspot summary table containing hotspot_id, latitude, longitude,
                          estimated_intensity, normalized_intensity, relative_rank, percentile.
        """
        intensity_col = "estimated_intensity" if "estimated_intensity" in evaluated_grid.columns else "raw_intensity"
        threshold_val = float(np.percentile(evaluated_grid[intensity_col], threshold_percentile))
        candidates = evaluated_grid[evaluated_grid[intensity_col] >= threshold_val].copy()
        candidates = candidates.sort_values(by=intensity_col, ascending=False).reset_index(drop=True)

        if candidates.empty:
            return pd.DataFrame(columns=[
                "hotspot_id", lat_col, lon_col, "estimated_intensity", "normalized_intensity", "relative_rank"
            ])

        selected_hotspots: List[Dict[str, Any]] = []

        for _, row in candidates.iterrows():
            cand_lat = float(row[lat_col])
            cand_lon = float(row[lon_col])

            # Check distance to already selected hotspots
            too_close = False
            for selected in selected_hotspots:
                d = haversine_distance(cand_lat, cand_lon, selected[lat_col], selected[lon_col])
                if d < min_separation_km:
                    too_close = True
                    break

            if not too_close:
                selected_hotspots.append({
                    "hotspot_id": len(selected_hotspots) + 1,
                    lat_col: round(cand_lat, 6),
                    lon_col: round(cand_lon, 6),
                    "estimated_intensity": float(row[intensity_col]),
                    "normalized_intensity": round(float(row["normalized_intensity"]), 4),
                    "relative_rank": len(selected_hotspots) + 1,
                    "percentile_tier": f">={threshold_percentile}th",
                })

            if len(selected_hotspots) >= top_n:
                break

        hotspots_df = pd.DataFrame(selected_hotspots)
        return hotspots_df


# =====================================================================
# 4. Locally Weighted Regression (LWR / LOESS) Implementation
# =====================================================================

class LocallyWeightedRegressor:
    """Locally Weighted Linear Regression (LWR / LOESS) Solver.

    Mathematical formulation:
    Given training points X in R^(N x d) and continuous response y in R^N,
    for any query point x_0 in R^d:
        min_{beta} sum_{i=1}^N w_i(x_0) * (y_i - [1, x_i]^T beta)^2 + lambda * ||beta||^2
    where w_i(x_0) = K( d(x_0, x_i) / h ).
    Closed form solution:
        beta_hat(x_0) = (X_aug^T W(x_0) X_aug + lambda * I)^(-1) X_aug^T W(x_0) y
        y_hat(x_0) = [1, x_0]^T beta_hat(x_0)

    Methodological Note:
    Standard crime occurrences represent a spatial point pattern (locations of discrete events),
    which is modeled via spatial intensity estimation. LWR is used when a continuous spatial
    attribute y (such as local case solvability probability, victim age, or time-to-arrest)
    is regressed against geographic space.
    """

    def __init__(
        self,
        bandwidth_km: float = 2.0,
        kernel: str = "tricube",
        regularization: float = 1e-4,
    ) -> None:
        """Initialize LWR solver.

        Args:
            bandwidth_km: Spatial bandwidth parameter in kilometers.
            kernel: Weighting kernel ('tricube', 'gaussian', 'epanechnikov').
            regularization: Ridge parameter lambda to ensure numerical invertibility.
        """
        self.bandwidth_km = float(bandwidth_km)
        self.kernel_name = kernel
        self.kernel_fn = get_kernel_function(kernel)
        self.regularization = float(regularization)
        self.X_train: Optional[np.ndarray] = None
        self.y_train: Optional[np.ndarray] = None

    def fit(
        self,
        X: Union[np.ndarray, pd.DataFrame],
        y: Union[np.ndarray, pd.Series],
    ) -> "LocallyWeightedRegressor":
        """Fit LWR model with spatial coordinates and response variable.

        Args:
            X: Spatial coordinates of shape (N, 2).
            y: Continuous response variable of shape (N,).

        Returns:
            LocallyWeightedRegressor: Fitted model instance.
        """
        X_arr = np.asarray(X, dtype=float)
        y_arr = np.asarray(y, dtype=float).ravel()

        if len(X_arr) != len(y_arr):
            raise ValueError(f"X ({len(X_arr)}) and y ({len(y_arr)}) must have equal length.")

        valid_mask = np.isfinite(X_arr[:, 0]) & np.isfinite(X_arr[:, 1]) & np.isfinite(y_arr)
        self.X_train = X_arr[valid_mask]
        self.y_train = y_arr[valid_mask]

        if len(self.X_train) == 0:
            raise ValueError("No valid finite training samples provided to LWR.")

        return self

    def predict_point(self, x0: np.ndarray) -> float:
        """Predict continuous response for a single query coordinate x0 = [lat, lon].

        Args:
            x0: 1D array of shape (2,) [lat, lon].

        Returns:
            float: Predicted local response value.
        """
        if self.X_train is None or self.y_train is None:
            raise RuntimeError("LWR regressor must be fitted before prediction.")

        x0 = np.asarray(x0, dtype=float).ravel()
        # Compute Haversine distance from x0 to all training points
        distances = haversine_distance(x0[0], x0[1], self.X_train[:, 0], self.X_train[:, 1])
        scaled_d = distances / self.bandwidth_km
        weights = self.kernel_fn(scaled_d)

        # If effective sample weight is too low, return global mean
        sum_weights = np.sum(weights)
        if sum_weights < 1e-8:
            return float(np.mean(self.y_train))

        # Augment training design matrix with bias column [1, lat, lon]
        n = len(self.X_train)
        X_aug = np.column_stack([np.ones(n), self.X_train])
        x0_aug = np.array([1.0, x0[0], x0[1]])

        # Weighted least squares: (X' W X + lambda * I) beta = X' W y
        # Multiply design matrix by sqrt(W)
        sqrt_W = np.sqrt(weights)[:, np.newaxis]
        X_w = X_aug * sqrt_W
        y_w = self.y_train * np.sqrt(weights)

        XtWX = X_w.T @ X_w + self.regularization * np.eye(3)
        XtWy = X_w.T @ y_w

        try:
            beta = np.linalg.solve(XtWX, XtWy)
            return float(x0_aug @ beta)
        except np.linalg.LinAlgError:
            return float(np.average(self.y_train, weights=weights))

    def predict(
        self,
        X_query: Union[np.ndarray, pd.DataFrame],
    ) -> np.ndarray:
        """Predict response across multiple query locations.

        Args:
            X_query: Array of shape (M, 2) containing query coordinates.

        Returns:
            np.ndarray: Array of predicted values of shape (M,).
        """
        Q = np.asarray(X_query, dtype=float)
        preds = np.empty(len(Q), dtype=float)
        for i in range(len(Q)):
            preds[i] = self.predict_point(Q[i])
        return preds


# =====================================================================
# 5. Serialization Utilities
# =====================================================================

def save_geographic_grid(
    grid_df: pd.DataFrame,
    output_path: Union[str, Path],
) -> None:
    """Save calculated spatial grid coordinates and intensity to CSV.

    Args:
        grid_df: Evaluated spatial grid DataFrame.
        output_path: Target CSV file destination.
    """
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    grid_df.to_csv(path, index=False)


def save_hotspot_summary(
    hotspots_df: pd.DataFrame,
    output_path: Union[str, Path],
) -> None:
    """Save identified hotspot summary to CSV.

    Args:
        hotspots_df: Hotspot summary DataFrame.
        output_path: Target CSV file destination.
    """
    path = Path(output_path)
    path.parent.mkdir(parents=True, exist_ok=True)
    hotspots_df.to_csv(path, index=False)
