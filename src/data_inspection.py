"""Dataset Inspection Utility.

Provides reusable functionality to inspect CSV datasets prior to feature engineering
and ML modeling. Inspects dimensions, schema, data types, missing values, duplicates,
and sample records without modifying the underlying dataset.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Union
import pandas as pd


def inspect_dataset(
    file_path: Union[str, Path],
    sample_size: int = 5,
    encodings_to_try: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """Inspect a CSV dataset and return a comprehensive report dictionary.

    This function is strictly read-only and does not modify the source file or data.

    Args:
        file_path: Path to the CSV file to inspect.
        sample_size: Number of sample records to preview (default: 5).
        encodings_to_try: Optional list of character encodings to attempt.
            Defaults to ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252'].

    Returns:
        Dict[str, Any]: Dictionary containing inspection results or error details.
    """
    path = Path(file_path)

    if encodings_to_try is None:
        encodings_to_try = ["utf-8", "latin-1", "iso-8859-1", "cp1252"]

    report: Dict[str, Any] = {
        "filename": path.name,
        "filepath": str(path.resolve()) if path.exists() else str(path),
        "file_exists": path.exists(),
        "status": "pending",
        "error_message": None,
        "encoding_used": None,
        "num_rows": 0,
        "num_columns": 0,
        "columns": [],
        "dtypes": {},
        "missing_values": {},
        "total_missing": 0,
        "missing_percentage": {},
        "duplicate_count": 0,
        "duplicate_percentage": 0.0,
        "sample_records": [],
    }

    if not path.exists():
        report["status"] = "error"
        report["error_message"] = f"File not found: {path}"
        return report

    if not path.is_file():
        report["status"] = "error"
        report["error_message"] = f"Path is not a regular file: {path}"
        return report

    if path.stat().st_size == 0:
        report["status"] = "error"
        report["error_message"] = f"File is empty (0 bytes): {path}"
        return report

    df: Optional[pd.DataFrame] = None
    last_encoding_error: Optional[Exception] = None

    for enc in encodings_to_try:
        try:
            df = pd.read_csv(path, encoding=enc)
            report["encoding_used"] = enc
            break
        except UnicodeDecodeError as exc:
            last_encoding_error = exc
            continue
        except pd.errors.EmptyDataError:
            report["status"] = "error"
            report["error_message"] = f"CSV contains no data or header: {path}"
            return report
        except pd.errors.ParserError as exc:
            report["status"] = "error"
            report["error_message"] = f"CSV parsing error: {exc}"
            return report
        except Exception as exc:
            report["status"] = "error"
            report["error_message"] = f"Unexpected error reading CSV: {exc}"
            return report

    if df is None:
        report["status"] = "error"
        report["error_message"] = (
            f"Encoding error: Unable to decode file using encodings {encodings_to_try}. "
            f"Last error: {last_encoding_error}"
        )
        return report

    if df.empty and len(df.columns) == 0:
        report["status"] = "error"
        report["error_message"] = f"Dataset is empty (0 rows, 0 columns): {path}"
        return report

    # Gather dataset metadata without modifying dataframe
    num_rows, num_columns = df.shape
    columns = list(df.columns)
    dtypes = {str(col): str(dtype) for col, dtype in df.dtypes.items()}
    missing_series = df.isnull().sum()
    missing_values = {str(col): int(val) for col, val in missing_series.items()}
    total_missing = int(missing_series.sum())

    missing_percentage = {
        str(col): round(float((val / num_rows) * 100), 2) if num_rows > 0 else 0.0
        for col, val in missing_series.items()
    }

    duplicate_count = int(df.duplicated().sum())
    duplicate_percentage = (
        round(float((duplicate_count / num_rows) * 100), 2) if num_rows > 0 else 0.0
    )

    sample_df = df.head(sample_size)
    sample_records = sample_df.to_dict(orient="records")

    report.update(
        {
            "status": "success",
            "num_rows": num_rows,
            "num_columns": num_columns,
            "columns": columns,
            "dtypes": dtypes,
            "missing_values": missing_values,
            "total_missing": total_missing,
            "missing_percentage": missing_percentage,
            "duplicate_count": duplicate_count,
            "duplicate_percentage": duplicate_percentage,
            "sample_records": sample_records,
        }
    )

    return report


def format_inspection_report(report: Dict[str, Any]) -> str:
    """Format an inspection result dictionary into a structured text report.

    Args:
        report: Dictionary generated by inspect_dataset.

    Returns:
        str: Formatted human-readable report string.
    """
    lines: List[str] = [
        "=" * 70,
        f"DATASET INSPECTION REPORT: {report.get('filename', 'Unknown')}",
        "=" * 70,
        f"File Path: {report.get('filepath')}",
        f"Inspection Status: {report.get('status', 'unknown').upper()}",
    ]

    if report.get("status") != "success":
        lines.append(f"Error Details: {report.get('error_message')}")
        lines.append("=" * 70)
        return "\n".join(lines)

    lines.extend(
        [
            f"Character Encoding: {report.get('encoding_used')}",
            f"Row Count: {report.get('num_rows'):,}",
            f"Column Count: {report.get('num_columns')}",
            f"Duplicate Rows: {report.get('duplicate_count'):,} ({report.get('duplicate_percentage')}%)",
            f"Total Missing Cells: {report.get('total_missing'):,}",
            "-" * 70,
            f"{'Column Name':<35} {'Dtype':<15} {'Missing':<10} {'Missing %':<10}",
            "-" * 70,
        ]
    )

    columns = report.get("columns", [])
    dtypes = report.get("dtypes", {})
    missing_vals = report.get("missing_values", {})
    missing_pcts = report.get("missing_percentage", {})

    for col in columns:
        col_str = str(col)[:33]
        dtype_str = dtypes.get(col, "unknown")[:14]
        miss_str = str(missing_vals.get(col, 0))
        pct_str = f"{missing_pcts.get(col, 0.0):.2f}%"
        lines.append(f"{col_str:<35} {dtype_str:<15} {miss_str:<10} {pct_str:<10}")

    lines.append("-" * 70)
    lines.append(f"Sample Records Preview (first {len(report.get('sample_records', []))} records):")

    samples = report.get("sample_records", [])
    if samples:
        for idx, sample in enumerate(samples, start=1):
            lines.append(f"  Record #{idx}: {sample}")
    else:
        lines.append("  (No records available to display)")

    lines.append("=" * 70)
    return "\n".join(lines)


def print_inspection_report(report: Dict[str, Any]) -> None:
    """Print the formatted inspection report to standard output."""
    print(format_inspection_report(report))


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        target_path = Path(sys.argv[1])
        res = inspect_dataset(target_path)
        print_inspection_report(res)
    else:
        print("Usage: python -m src.data_inspection <path_to_csv_file>")
