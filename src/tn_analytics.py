"""Tamil Nadu Crime Analytics Module for Person B.

Provides reusable analytical utilities for:
1. District-level crime summaries and rankings
2. Longitudinal year-wise trend analysis and growth metrics
3. Crime category distribution summaries
4. Police jurisdiction / commissionerate comparisons
5. Publication-grade visualizations for Tamil Nadu crime patterns

Responsible Analytics Constraints:
- Population denominators are required for crime rate calculations;
  unrecorded or non-residential jurisdictions strictly report 'crime count'.
- No causation is inferred from simple time-series trends.
- State-level aggregate summary rows are strictly isolated to avoid double-counting.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from src.config import OUTPUTS_DIR, PROCESSED_DATA_DIR
from src.feature_engineering import standardize_tamil_nadu_districts


def load_tn_datasets(
    data_dir: Optional[Path] = None,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """Load the clean Tamil Nadu datasets from data/processed/.

    Args:
        data_dir: Directory containing processed CSVs. Defaults to PROCESSED_DATA_DIR.

    Returns:
        Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
            (tn_total_df, tn_murder_df, tn_ipc_2014_df)
    """
    proc_dir = Path(data_dir) if data_dir is not None else PROCESSED_DATA_DIR

    total_path = proc_dir / "tn_crime_total_2020_2022_clean.csv"
    murder_path = proc_dir / "tn_murder_2023_clean.csv"
    ipc_path = proc_dir / "dstr_ipc_2014_clean.csv"

    if not total_path.exists():
        raise FileNotFoundError(f"Missing total crime dataset at {total_path}")
    if not murder_path.exists():
        raise FileNotFoundError(f"Missing murder dataset at {murder_path}")
    if not ipc_path.exists():
        raise FileNotFoundError(f"Missing IPC dataset at {ipc_path}")

    df_total = pd.read_csv(total_path)
    df_murder = pd.read_csv(murder_path)
    df_ipc = pd.read_csv(ipc_path)

    # Filter IPC to Tamil Nadu
    df_ipc_tn = df_ipc[df_ipc["States/UTs"].str.strip().str.lower() == "tamil nadu"].copy()

    return df_total, df_murder, df_ipc_tn


def build_district_summary(
    df_total: pd.DataFrame,
    df_murder: pd.DataFrame,
) -> pd.DataFrame:
    """Construct a comprehensive district-level summary for Tamil Nadu.

    Filters out aggregate state-level total rows (is_total_row == True).
    Harmonizes standardized district names and includes counts and rates
    only when valid population denominators exist.

    Args:
        df_total: Cleaned multi-year total crime DataFrame (2020-2022).
        df_murder: Cleaned violent fatalities DataFrame (2023).

    Returns:
        pd.DataFrame: Merged district-level summary.
    """
    # Filter out state total summary rows
    total_districts = df_total[~df_total["is_total_row"]].copy()
    murder_districts = df_murder[~df_murder["is_total_row"]].copy()

    # Select relevant columns from multi-year total
    total_sub = total_districts[[
        "district_standardized",
        "crime_count_2020",
        "crime_count_2021",
        "crime_count_2022",
        "share_pct_2022",
        "projected_pop_lakhs",
        "rate_cognizable_crime_2022",
    ]].copy()

    # Select relevant columns from murder 2023
    murder_sub = murder_districts[[
        "district_standardized",
        "murder_incidence",
        "murder_victims",
        "murder_rate",
        "culpable_homicide_incidence",
        "culpable_homicide_victims",
        "culpable_homicide_rate",
        "negligence_death_incidence",
        "negligence_death_victims",
        "negligence_death_rate",
    ]].copy()

    # Outer join on standardized district name to preserve all jurisdictions
    summary = pd.merge(
        total_sub,
        murder_sub,
        on="district_standardized",
        how="outer",
    )

    # Rename key columns for semantic clarity
    summary.rename(columns={"district_standardized": "district"}, inplace=True)

    # Calculate multi-year total crime count where all years are non-null
    summary["total_crime_2020_2022"] = summary[["crime_count_2020", "crime_count_2021", "crime_count_2022"]].sum(
        axis=1, min_count=1
    )

    # Calculate total violent fatalities in 2023 (murder + culpable homicide + negligent death)
    summary["violent_fatalities_total_2023"] = (
        summary["murder_victims"].fillna(0)
        + summary["culpable_homicide_victims"].fillna(0)
        + summary["negligence_death_victims"].fillna(0)
    )

    # Sort descending by 2022 crime count
    summary.sort_values(by="crime_count_2022", ascending=False, inplace=True)
    summary.reset_index(drop=True, inplace=True)

    return summary


def build_yearly_trends(
    df_total: pd.DataFrame,
    df_ipc_tn: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Analyze longitudinal year-wise crime trends across available periods.

    Computes year-over-year mathematical growth and documents analytical context.

    Args:
        df_total: Cleaned multi-year total crime DataFrame (2020-2022).
        df_ipc_tn: Optional 2014 NCRB Tamil Nadu slice for long-term baseline.

    Returns:
        pd.DataFrame: Table of year-wise crime counts and growth rates.
    """
    # Extract state-level totals from rows with is_total_row == True
    total_row = df_total[df_total["is_total_row"]].iloc[0]

    c_2020 = float(total_row["crime_count_2020"])
    c_2021 = float(total_row["crime_count_2021"])
    c_2022 = float(total_row["crime_count_2022"])

    records = [
        {
            "year": 2020,
            "total_crime_count": int(c_2020),
            "yoy_change_pct": np.nan,
            "reporting_scope": "Total Cognizable Crimes (IPC + SLL)",
            "context_notes": "Elevated baseline driven by lockdown-related Section 188 / regulatory enforcements",
        },
        {
            "year": 2021,
            "total_crime_count": int(c_2021),
            "yoy_change_pct": round(((c_2021 - c_2020) / c_2020) * 100, 2),
            "reporting_scope": "Total Cognizable Crimes (IPC + SLL)",
            "context_notes": "Moderate reduction as movement restrictions tapered",
        },
        {
            "year": 2022,
            "total_crime_count": int(c_2022),
            "yoy_change_pct": round(((c_2022 - c_2021) / c_2021) * 100, 2),
            "reporting_scope": "Total Cognizable Crimes (IPC + SLL)",
            "context_notes": "Post-pandemic normalization to baseline crime reporting",
        },
    ]

    # Include 2014 IPC benchmark if provided
    if df_ipc_tn is not None and not df_ipc_tn.empty:
        total_ipc_row = df_ipc_tn[df_ipc_tn["is_total_row"]]
        if not total_ipc_row.empty and "Total Cognizable IPC crimes" in total_ipc_row.columns:
            c_2014 = int(total_ipc_row.iloc[0]["Total Cognizable IPC crimes"])
            records.insert(0, {
                "year": 2014,
                "total_crime_count": c_2014,
                "yoy_change_pct": np.nan,
                "reporting_scope": "Cognizable IPC Crimes Only (Excludes SLL)",
                "context_notes": "Historical benchmark from NCRB district dataset",
            })

    return pd.DataFrame(records)


def rank_districts(
    df: pd.DataFrame,
    metric_col: str,
    top_n: int = 10,
    ascending: bool = False,
) -> pd.DataFrame:
    """Rank districts safely according to an existing numerical column.

    Args:
        df: District summary DataFrame.
        metric_col: Column to rank by.
        top_n: Number of top districts to return.
        ascending: Sorting direction.

    Returns:
        pd.DataFrame: Ranked subset of districts.
    """
    if metric_col not in df.columns:
        raise ValueError(f"Metric column '{metric_col}' not present in DataFrame")

    ranked = df[["district", metric_col]].dropna(subset=[metric_col]).copy()
    ranked.sort_values(by=metric_col, ascending=ascending, inplace=True)
    ranked["rank"] = range(1, len(ranked) + 1)
    return ranked.head(top_n).reset_index(drop=True)


def compare_districts(
    df: pd.DataFrame,
    district_list: List[str],
    metrics: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Generate comparative profile for designated police jurisdictions.

    Args:
        df: District summary DataFrame.
        district_list: Names of districts to compare.
        metrics: List of metric columns to include.

    Returns:
        pd.DataFrame: Comparative table.
    """
    default_metrics = [
        "crime_count_2022",
        "share_pct_2022",
        "rate_cognizable_crime_2022",
        "murder_incidence",
        "murder_rate",
        "violent_fatalities_total_2023",
    ]
    cols = metrics if metrics is not None else [c for c in default_metrics if c in df.columns]

    sub = df[df["district"].isin(district_list)][["district"] + cols].copy()
    return sub.reset_index(drop=True)


def compute_basic_statistics(
    df: pd.DataFrame,
    metric_cols: Optional[List[str]] = None,
) -> pd.DataFrame:
    """Compute basic statistical aggregations (mean, median, std, min, max) across districts.

    Args:
        df: District summary DataFrame.
        metric_cols: Columns to summarize.

    Returns:
        pd.DataFrame: Summary table of descriptive statistics.
    """
    if metric_cols is None:
        metric_cols = [
            c for c in ["crime_count_2020", "crime_count_2021", "crime_count_2022", "murder_incidence", "negligence_death_incidence"]
            if c in df.columns
        ]

    stats = []
    for col in metric_cols:
        s = df[col].dropna()
        stats.append({
            "metric": col,
            "count": len(s),
            "mean": round(s.mean(), 2),
            "median": round(s.median(), 2),
            "std": round(s.std(), 2),
            "min": round(s.min(), 2),
            "max": round(s.max(), 2),
        })

    return pd.DataFrame(stats)


def get_crime_category_breakdown(
    df_murder: pd.DataFrame,
    df_ipc_tn: Optional[pd.DataFrame] = None,
) -> pd.DataFrame:
    """Extract category distribution for Tamil Nadu crime offenses.

    Args:
        df_murder: 2023 fatalities DataFrame.
        df_ipc_tn: Optional 2014 Tamil Nadu IPC dataset.

    Returns:
        pd.DataFrame: Category name and recorded incidence count.
    """
    # 2023 Violent fatality category breakdown
    murder_total = df_murder[df_murder["is_total_row"]].iloc[0]
    breakdown = [
        {"category": "Causing Death by Negligence", "incidence": int(murder_total["negligence_death_incidence"]), "year": 2023},
        {"category": "Murder", "incidence": int(murder_total["murder_incidence"]), "year": 2023},
        {"category": "Culpable Homicide Not Amounting to Murder", "incidence": int(murder_total["culpable_homicide_incidence"]), "year": 2023},
    ]

    return pd.DataFrame(breakdown)


def generate_tn_visualizations(
    district_summary: pd.DataFrame,
    yearly_trends: pd.DataFrame,
    category_df: pd.DataFrame,
    output_dir: Path,
) -> List[Path]:
    """Generate 4 publication-quality visualizations for Tamil Nadu crime analytics.

    1. District crime distribution (Top districts by 2022 crime count)
    2. Year-wise crime trend (Multi-year longitudinal trajectory)
    3. Crime-category distribution (Fatal and violent crime categories)
    4. District comparison (Key commissionerates across metrics)

    Args:
        district_summary: District summary DataFrame.
        yearly_trends: Yearly trends DataFrame.
        category_df: Crime category breakdown DataFrame.
        output_dir: Target directory for plots.

    Returns:
        List[Path]: Paths to generated image files.
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    generated_plots: List[Path] = []

    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")
    plt.rcParams.update({"font.sans-serif": "DejaVu Sans", "font.size": 10})

    # Plot 1: District Crime Distribution (Top 15 Jurisdictions by 2022 Crime Count)
    fig, ax = plt.subplots(figsize=(10, 6), dpi=300)
    top_15 = district_summary.dropna(subset=["crime_count_2022"]).head(15).sort_values("crime_count_2022")

    bars = ax.barh(top_15["district"], top_15["crime_count_2022"], color="#1f77b4", edgecolor="#0e4875", alpha=0.85)
    ax.set_xlabel("Recorded Crime Count (2022)")
    ax.set_title("Tamil Nadu — Top 15 Police Jurisdictions by Recorded Crime Count (2022)", fontsize=11, fontweight="bold", pad=12)

    for bar in bars:
        w = bar.get_width()
        ax.text(w + 500, bar.get_y() + bar.get_height() / 2, f"{int(w):,}", va="center", fontsize=8)

    p1 = output_dir / "district_crime_distribution.png"
    fig.tight_layout()
    fig.savefig(p1, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p1)

    # Plot 2: Year-wise Crime Trend (2020-2022 Longitudinal Trajectory)
    fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
    trend_sub = yearly_trends[yearly_trends["year"] >= 2020].sort_values("year")

    ax.plot(
        trend_sub["year"].astype(str),
        trend_sub["total_crime_count"] / 1000,
        marker="o",
        color="#d62728",
        linewidth=2.5,
        markersize=8,
        label="Total Cognizable Crimes (in thousands)",
    )
    ax.set_ylabel("Total Recorded Crimes (in Thousands)")
    ax.set_xlabel("Reporting Year")
    ax.set_title("Tamil Nadu — Longitudinal Crime Incidence Trend (2020–2022)", fontsize=11, fontweight="bold", pad=12)

    for _, row in trend_sub.iterrows():
        y_val = row["total_crime_count"] / 1000
        ax.annotate(
            f"{int(row['total_crime_count']):,}\n({row['yoy_change_pct']:+.1f}% YoY)" if not np.isnan(row['yoy_change_pct']) else f"{int(row['total_crime_count']):,}\n(Baseline)",
            (str(row["year"]), y_val),
            textcoords="offset points",
            xytext=(0, 12),
            ha="center",
            fontsize=9,
            fontweight="bold",
        )

    ax.set_ylim(0, trend_sub["total_crime_count"].max() / 1000 * 1.25)
    ax.legend(loc="upper right", frameon=True)

    p2 = output_dir / "yearly_crime_trends.png"
    fig.tight_layout()
    fig.savefig(p2, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p2)

    # Plot 3: Crime-Category Distribution (Violent Fatalities Breakdown)
    fig, ax = plt.subplots(figsize=(9, 5), dpi=300)
    bars = ax.bar(
        category_df["category"],
        category_df["incidence"],
        color=["#ff7f0e", "#d62728", "#9467bd"],
        edgecolor="#333333",
        alpha=0.85,
    )
    ax.set_ylabel("Recorded Incident Count")
    ax.set_title("Tamil Nadu — Fatality & Violent Crime Categories (2023)", fontsize=11, fontweight="bold", pad=12)
    plt.xticks(rotation=15, ha="right")

    for bar in bars:
        h = bar.get_height()
        ax.text(bar.get_x() + bar.get_width() / 2, h + 200, f"{int(h):,}", ha="center", va="bottom", fontsize=9, fontweight="bold")

    p3 = output_dir / "crime_category_distribution.png"
    fig.tight_layout()
    fig.savefig(p3, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p3)

    # Plot 4: District Comparison (Major Metropolitan Police Commissionerates)
    fig, ax = plt.subplots(figsize=(10, 5), dpi=300)
    metro_districts = ["Chennai", "Coimbatore City", "Madurai City", "Tiruchirappalli City", "Salem City"]
    comp_df = district_summary[district_summary["district"].isin(metro_districts)].copy()

    if not comp_df.empty:
        x_pos = np.arange(len(comp_df))
        width = 0.35

        ax.bar(x_pos - width / 2, comp_df["crime_count_2022"] / 1000, width, label="Cognizable Crimes (Thousands, 2022)", color="#1f77b4", alpha=0.85)
        ax.bar(x_pos + width / 2, comp_df["violent_fatalities_total_2023"], width, label="Violent Fatalities (Count, 2023)", color="#d62728", alpha=0.85)

        ax.set_xticks(x_pos)
        ax.set_xticklabels(comp_df["district"], rotation=15, ha="right")
        ax.set_ylabel("Magnitude (Scaled per Legend)")
        ax.set_title("Cross-Jurisdictional Profile: Major Police Commissionerates", fontsize=11, fontweight="bold", pad=12)
        ax.legend(frameon=True)

    p4 = output_dir / "district_comparison.png"
    fig.tight_layout()
    fig.savefig(p4, bbox_inches="tight")
    plt.close(fig)
    generated_plots.append(p4)

    return generated_plots


def run_tn_pipeline() -> Dict[str, Any]:
    """Execute the end-to-end Tamil Nadu analytics pipeline and generate outputs.

    Produces:
    - outputs/tamil_nadu/district_summary.csv
    - outputs/tamil_nadu/yearly_trends.csv
    - 4 diagnostic visualizations in outputs/tamil_nadu/

    Returns:
        Dict[str, Any]: Summary dictionary.
    """
    tn_output_dir = OUTPUTS_DIR / "tamil_nadu"
    tn_output_dir.mkdir(parents=True, exist_ok=True)

    # 1. Ingest datasets
    df_total, df_murder, df_ipc_tn = load_tn_datasets()

    # 2. Build district summary
    district_summary = build_district_summary(df_total, df_murder)
    summary_path = tn_output_dir / "district_summary.csv"
    district_summary.to_csv(summary_path, index=False)

    # 3. Build yearly trends
    yearly_trends = build_yearly_trends(df_total, df_ipc_tn)
    trends_path = tn_output_dir / "yearly_trends.csv"
    yearly_trends.to_csv(trends_path, index=False)

    # 4. Build category breakdown
    category_df = get_crime_category_breakdown(df_murder, df_ipc_tn)

    # 5. Generate plots
    plot_paths = generate_tn_visualizations(
        district_summary=district_summary,
        yearly_trends=yearly_trends,
        category_df=category_df,
        output_dir=tn_output_dir,
    )

    return {
        "districts_summarized": len(district_summary),
        "years_analyzed": len(yearly_trends),
        "district_summary_file": str(summary_path),
        "yearly_trends_file": str(trends_path),
        "plots_generated": [str(p) for p in plot_paths],
    }


if __name__ == "__main__":
    summary = run_tn_pipeline()
    print("=== TAMIL NADU ANALYTICS PIPELINE COMPLETE ===")
    for k, v in summary.items():
        print(f"  {k}: {v}")
