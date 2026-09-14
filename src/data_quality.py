"""Data Quality Assessment and Profiling Utilities.

Provides structured auditing for missing values, exact and key duplicates,
column-level data types, semantic profiling, and human-readable quality reports.
"""

from typing import Any, Dict, List, Optional
import pandas as pd


def dataset_summary(df: pd.DataFrame, dataset_name: str = "Dataset") -> Dict[str, Any]:
    """Generate high-level metadata and memory metrics for a DataFrame.

    Args:
        df: Input DataFrame.
        dataset_name: Identifier name for the dataset.

    Returns:
        Dict[str, Any]: High-level summary dictionary.
    """
    total_rows, total_cols = df.shape
    total_cells = total_rows * total_cols
    missing_cells = int(df.isnull().sum().sum())
    missing_pct = round((missing_cells / total_cells * 100), 2) if total_cells > 0 else 0.0
    duplicate_rows = int(df.duplicated().sum())
    duplicate_pct = round((duplicate_rows / total_rows * 100), 2) if total_rows > 0 else 0.0
    memory_mb = round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)

    return {
        "dataset_name": dataset_name,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "total_cells": total_cells,
        "missing_cells": missing_cells,
        "missing_percentage": missing_pct,
        "duplicate_rows": duplicate_rows,
        "duplicate_percentage": duplicate_pct,
        "memory_usage_mb": memory_mb,
    }


def missing_value_report(df: pd.DataFrame) -> pd.DataFrame:
    """Generate an audit of missingness per column.

    Args:
        df: Input DataFrame.

    Returns:
        pd.DataFrame: Audit table of missing counts, percentages, and data types.
    """
    total_rows = len(df)
    missing = df.isnull().sum()
    pct = (missing / total_rows * 100).round(2) if total_rows > 0 else 0.0

    report = pd.DataFrame({
        "column": df.columns,
        "missing_count": missing.values,
        "missing_pct": pct.values,
        "dtype": [str(d) for d in df.dtypes.values],
    })
    return report.sort_values(by="missing_count", ascending=False).reset_index(drop=True)


def duplicate_report(df: pd.DataFrame, id_col: Optional[str] = None) -> Dict[str, Any]:
    """Inspect exact row duplication and identifier-specific duplication.

    Args:
        df: Input DataFrame.
        id_col: Optional identifier column to test for key collisions.

    Returns:
        Dict[str, Any]: Duplicate statistics.
    """
    exact_duplicates = int(df.duplicated().sum())
    result = {
        "total_rows": len(df),
        "exact_duplicate_rows": exact_duplicates,
        "has_exact_duplicates": exact_duplicates > 0,
        "id_column": id_col,
        "duplicate_ids_count": 0,
    }

    if id_col and id_col in df.columns:
        dup_ids = int(df.duplicated(subset=[id_col]).sum())
        result["duplicate_ids_count"] = dup_ids
        result["has_duplicate_ids"] = dup_ids > 0

    return result


def profile_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Profile every column in the dataset with semantic type inference.

    Args:
        df: Input DataFrame.

    Returns:
        pd.DataFrame: Profile table with column statistics and inferred feature category.
    """
    profiles: List[Dict[str, Any]] = []

    for col in df.columns:
        series = df[col]
        non_null = int(series.notnull().sum())
        null_cnt = int(series.isnull().sum())
        null_pct = round(null_cnt / len(df) * 100, 2) if len(df) > 0 else 0.0
        unique_cnt = int(series.nunique(dropna=True))

        # Semantic category inference
        col_lower = col.lower()
        if col_lower in ["uid", "id", "sl no", "sl_no", "slno"]:
            inferred = "identifier"
        elif col_lower in ["disposition", "crime_solved", "status", "solved"]:
            inferred = "target"
        elif col_lower in ["lat", "latitude", "lon", "long", "longitude"]:
            inferred = "geographic (coordinate)"
        elif any(k in col_lower for k in ["district", "city", "state"]):
            inferred = "geographic (administrative)"
        elif any(k in col_lower for k in ["date", "year", "month"]):
            inferred = "temporal"
        elif any(k in col_lower for k in ["victim_first", "victim_last", "name"]):
            inferred = "unsuitable for modeling (PII)"
        elif pd.api.types.is_numeric_dtype(series):
            inferred = "numerical"
        elif unique_cnt < 50:
            inferred = "categorical"
        else:
            inferred = "text / high cardinality"

        sample_vals = series.dropna().unique()[:3].tolist()
        sample_str = ", ".join(str(v) for v in sample_vals)

        profiles.append({
            "column": col,
            "dtype": str(series.dtype),
            "inferred_type": inferred,
            "non_null_count": non_null,
            "null_count": null_cnt,
            "null_pct": null_pct,
            "unique_count": unique_cnt,
            "samples": sample_str,
        })

    return pd.DataFrame(profiles)


def generate_quality_report(df: pd.DataFrame, dataset_name: str = "Dataset") -> str:
    """Produce a formatted human-readable data quality report.

    Args:
        df: Input DataFrame.
        dataset_name: Title of the dataset.

    Returns:
        str: Formatted report text.
    """
    summary = dataset_summary(df, dataset_name)
    col_profiles = profile_columns(df)

    lines = [
        "=" * 75,
        f"DATA QUALITY ASSESSMENT REPORT: {dataset_name}",
        "=" * 75,
        f"Total Records (Rows): {summary['total_rows']:,}",
        f"Total Attributes (Cols): {summary['total_columns']:,}",
        f"Memory Utilization: {summary['memory_usage_mb']} MB",
        f"Exact Duplicate Rows: {summary['duplicate_rows']} ({summary['duplicate_percentage']}%)",
        f"Total Missing Cells: {summary['missing_cells']:,} ({summary['missing_percentage']}%)",
        "-" * 75,
        f"{'Column':<32} {'Inferred Type':<20} {'Missing':<10} {'Unique':<8}",
        "-" * 75,
    ]

    for _, row in col_profiles.iterrows():
        col_name = str(row["column"])[:30]
        inf_type = str(row["inferred_type"])[:18]
        miss_str = f"{row['null_count']} ({row['null_pct']}%)"
        uniq_str = str(row["unique_count"])
        lines.append(f"{col_name:<32} {inf_type:<20} {miss_str:<10} {uniq_str:<8}")

    lines.append("=" * 75)
    return "\n".join(lines)
