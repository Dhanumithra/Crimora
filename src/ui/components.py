"""Reusable UI Components for Streamlit Dashboard.

Day 8: Input validation helpers, improved metric cards, section headers,
alert rendering, structured placeholders, responsible-use notice,
and model result score cards — all hardened with graceful defaults.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import math
import streamlit as st


# ─────────────────────────────────────────────────────────────────────────────
# Input Validation Utilities
# ─────────────────────────────────────────────────────────────────────────────

def validate_numeric_input(
    value: Any,
    name: str,
    min_val: float = -float("inf"),
    max_val: float = float("inf"),
    allow_nan: bool = False,
) -> tuple[bool, str]:
    """Validate a numeric input value.

    Args:
        value: Value to validate.
        name: Display name for error messages.
        min_val: Minimum allowed value (inclusive).
        max_val: Maximum allowed value (inclusive).
        allow_nan: Whether NaN is acceptable.

    Returns:
        (is_valid: bool, error_message: str)
    """
    if value is None:
        return False, f"**{name}** is required and cannot be empty."
    try:
        v = float(value)
    except (ValueError, TypeError):
        return False, f"**{name}** must be a numeric value. Got: `{value!r}`."
    if not allow_nan and (math.isnan(v) or math.isinf(v)):
        return False, f"**{name}** must be a finite number. Got: `{value!r}`."
    if v < min_val:
        return False, f"**{name}** must be ≥ {min_val}. Got: `{v}`."
    if v > max_val:
        return False, f"**{name}** must be ≤ {max_val}. Got: `{v}`."
    return True, ""


def validate_categorical_input(
    value: Any,
    name: str,
    allowed_values: Optional[List[str]] = None,
) -> tuple[bool, str]:
    """Validate a categorical / string input value.

    Args:
        value: Value to validate.
        name: Display name for error messages.
        allowed_values: Optional list of valid choices.

    Returns:
        (is_valid: bool, error_message: str)
    """
    if value is None or (isinstance(value, str) and not value.strip()):
        return False, f"**{name}** must be provided and cannot be blank."
    if allowed_values and str(value) not in allowed_values:
        truncated = allowed_values[:10]
        more = "…" if len(allowed_values) > 10 else ""
        return False, (
            f"**{name}** value `{value!r}` is not in the allowed set: "
            f"{truncated}{more}."
        )
    return True, ""


def validate_coordinate(
    lat: Any,
    lon: Any,
) -> tuple[bool, str]:
    """Validate a geographic coordinate pair.

    Args:
        lat: Latitude value.
        lon: Longitude value.

    Returns:
        (is_valid: bool, error_message: str)
    """
    ok_lat, msg = validate_numeric_input(lat, "Latitude", -90.0, 90.0)
    if not ok_lat:
        return False, msg
    ok_lon, msg = validate_numeric_input(lon, "Longitude", -180.0, 180.0)
    if not ok_lon:
        return False, msg
    return True, ""


def show_validation_errors(errors: List[str]) -> bool:
    """Display collected validation error messages and return True if any exist.

    Args:
        errors: List of error message strings.

    Returns:
        True if errors were displayed.
    """
    if errors:
        for err in errors:
            st.error(err)
        return True
    return False


# ─────────────────────────────────────────────────────────────────────────────
# Page Header
# ─────────────────────────────────────────────────────────────────────────────

def render_page_header(
    title: str,
    subtitle: str,
    icon: str = "🔍",
    badge_text: str = "Person B Track",
    badge_type: str = "active",
    badge_color: str = "",  # legacy alias ignored; badge_type takes effect
) -> None:
    """Render a standardized page header with icon, title, subtitle, and status badge.

    Args:
        title: Main page title text.
        subtitle: Explanatory subtitle displayed below the title.
        icon: Emoji or character prefix for the title.
        badge_text: Label text rendered as the status badge.
        badge_type: Badge style — 'active' | 'pending' | 'info' | 'danger'.
        badge_color: Legacy alias; has no effect (badge_type governs styling).
    """
    col1, col2 = st.columns([0.82, 0.18])
    with col1:
        st.markdown(f"## {icon} {title}")
        st.markdown(
            f"<div style='color:#64748b;font-size:0.9rem;margin-top:-0.5rem;"
            f"margin-bottom:1.1rem;line-height:1.5;'>{subtitle}</div>",
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"<div style='text-align:right;margin-top:0.75rem;'>"
            f"<span class='badge badge-{badge_type}'>{badge_text}</span>"
            f"</div>",
            unsafe_allow_html=True,
        )
    st.markdown(
        "<hr style='margin-top:0;margin-bottom:1.25rem;border-color:#e2e8f0;'>",
        unsafe_allow_html=True,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Section Header
# ─────────────────────────────────────────────────────────────────────────────

def render_section_header(title: str, description: Optional[str] = None) -> None:
    """Render a clean section divider with optional description.

    Args:
        title: Section heading text (rendered as h4).
        description: Optional muted subtext below the heading.
    """
    st.markdown(f"#### {title}")
    if description:
        st.markdown(
            f"<div style='color:#64748b;font-size:0.85rem;margin-top:-0.4rem;"
            f"margin-bottom:0.85rem;line-height:1.5;'>{description}</div>",
            unsafe_allow_html=True,
        )


# ─────────────────────────────────────────────────────────────────────────────
# Metric Card
# ─────────────────────────────────────────────────────────────────────────────

def render_metric_card(
    title: str,
    value: Any,
    subtitle: Optional[str] = None,
    delta: Optional[str] = None,
    delta_color: str = "normal",
    delta_positive: bool = True,
    **kwargs: Any,
) -> None:
    """Render a white card with a labelled KPI metric.

    Args:
        title: Short uppercase label.
        value: Primary metric value (number or string).
        subtitle: Optional muted contextual note below the value.
        delta: Optional delta / trend indicator text.
        delta_color: Unused legacy param kept for API compatibility.
        delta_positive: Controls delta text color — green if True, blue if False.
        **kwargs: Ignored extra kwargs for forward-compatibility.
    """
    sub_html = f"<div class='metric-subtitle'>{subtitle}</div>" if subtitle else ""
    if delta:
        color_hex = "#16a34a" if delta_positive else "#2563eb"
        delta_html = (
            f"<div style='font-size:0.775rem;color:{color_hex};"
            f"margin-top:0.25rem;font-weight:500;'>{delta}</div>"
        )
    else:
        delta_html = ""

    st.markdown(
        f"""
        <div class='metric-container'>
            <div class='metric-title'>{title}</div>
            <div class='metric-value'>{value}</div>
            {delta_html}
            {sub_html}
        </div>
        """,
        unsafe_allow_html=True,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Alert / Callout
# ─────────────────────────────────────────────────────────────────────────────

def render_alert(message: str, alert_type: str = "info") -> None:
    """Display a Streamlit native alert box.

    Args:
        message: Alert content text.
        alert_type: 'info' | 'warning' | 'error' | 'success'.
    """
    dispatch = {
        "info": st.info,
        "warning": st.warning,
        "error": st.error,
        "success": st.success,
    }
    dispatch.get(alert_type, st.info)(message)


# ─────────────────────────────────────────────────────────────────────────────
# Responsible Use Notice
# ─────────────────────────────────────────────────────────────────────────────

def render_responsible_notice() -> None:
    """Render the academic decision-support ethics disclaimer banner.

    This notice must appear on every page that presents model predictions
    or statistical inferences. It clarifies that outputs are NOT:
    - proof of guilt
    - identification of a specific offender
    - a guaranteed case outcome
    - an exact offender residence location
    """
    st.markdown(
        """
        <div class='notice-box'>
            <b>⚖️ Academic Decision-Support Prototype — Responsible Use Notice</b><br>
            Crimora provides statistical pattern analysis and exploratory predictive estimation
            for <b>academic and research purposes only</b>.
            Outputs <b>must not</b> be interpreted as:
            <ul style='margin:0.4rem 0 0 1.2rem;padding:0;'>
                <li>Proof of an individual's guilt or criminal involvement</li>
                <li>Identification of a specific offender or suspect</li>
                <li>A guaranteed prediction of case clearance outcome</li>
                <li>An exact or probable offender residential location</li>
            </ul>
            All results require interpretation by a trained investigative professional.
            No raw datasets were modified by this platform.
        </div>
        """,
        unsafe_allow_html=True,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Placeholder Interface (Person A modules)
# ─────────────────────────────────────────────────────────────────────────────

def render_placeholder_interface(
    feature_title: str,
    owner: str = "Person A",
    planned_day: str = "Day 7",
    methodology: str = "Unsupervised Clustering & Behavioral Synthesis",
    input_schema: Optional[List[str]] = None,
    expected_output: Optional[str] = None,
    # Legacy aliases accepted but mapped to canonical params
    module_name: Optional[str] = None,
    description: Optional[str] = None,
    expected_inputs: Optional[List[str]] = None,
    expected_outputs: Optional[List[str]] = None,
) -> None:
    """Render a structured placeholder for an upcoming or partially available module.

    Accepts both the canonical signature and legacy kwarg names for API
    compatibility across Day 6/7 callers.

    Args:
        feature_title: Module name / title.
        owner: Responsible team member label.
        planned_day: Roadmap milestone label.
        methodology: Algorithmic or theoretical approach.
        input_schema: Expected input feature list.
        expected_output: Expected output description string.
        module_name: Legacy alias for feature_title.
        description: Legacy alias for methodology.
        expected_inputs: Legacy alias for input_schema.
        expected_outputs: Legacy alias for expected_output (list accepted).
    """
    # Resolve legacy aliases
    if module_name and not feature_title:
        feature_title = module_name
    if description and methodology == "Unsupervised Clustering & Behavioral Synthesis":
        methodology = description
    if expected_inputs and not input_schema:
        input_schema = expected_inputs
    if expected_outputs and not expected_output:
        expected_output = (
            "\n".join(f"- {o}" for o in expected_outputs)
            if isinstance(expected_outputs, list)
            else str(expected_outputs)
        )

    st.markdown(
        f"""
        <div class='crimora-card-highlight'>
            <div style='display:flex;justify-content:space-between;align-items:center;'>
                <h4 style='margin:0;color:#1e1b4b;'>{feature_title}</h4>
                <span class='badge badge-pending'>Awaiting {owner} ({planned_day})</span>
            </div>
            <p style='color:#475569;font-size:0.875rem;margin-top:0.5rem;'>
                <b>Methodology:</b> {methodology}
            </p>
            <p style='color:#64748b;font-size:0.825rem;margin:0;'>
                This interface is pre-wired and ready for integration once {owner}'s model is validated.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("##### 📥 Expected Input Features")
        if input_schema:
            for item in input_schema:
                st.markdown(f"- `{item}`")
        else:
            st.markdown("- Multi-attribute behavioral feature vectors\n- Temporal sequence markers")
    with col2:
        st.markdown("##### 📤 Expected Output")
        st.markdown(expected_output or "Probabilistic belief updates & cluster assignments.")


# ─────────────────────────────────────────────────────────────────────────────
# Model Score Badge
# ─────────────────────────────────────────────────────────────────────────────

def render_model_score_badge(
    prediction: int,
    probability: float,
    model_name: Optional[str] = None,
    **kwargs: Any,
) -> None:
    """Render a solvability prediction result card.

    Args:
        prediction: Binary class label (1 = Solved, 0 = Unsolved).
        probability: Model's estimated probability of clearance (0.0–1.0).
        model_name: Optional model identifier string.
        **kwargs: Ignored extras for forward-compatibility.
    """
    # Guard input
    try:
        probability = float(probability)
        if math.isnan(probability) or math.isinf(probability):
            probability = 0.5
        probability = max(0.0, min(1.0, probability))
    except (TypeError, ValueError):
        probability = 0.5

    if prediction == 1:
        status_text = "LIKELY CLEARED BY ARREST"
        badge_class = "badge-active"
        prob_color = "#059669"
        border_color = "#10b981"
    else:
        status_text = "HIGH CLEARANCE DIFFICULTY"
        badge_class = "badge-danger"
        prob_color = "#dc2626"
        border_color = "#f87171"

    model_sub = (
        f"<div style='font-size:0.775rem;font-weight:600;color:#475569;"
        f"margin-bottom:0.4rem;'>Model: {model_name}</div>"
        if model_name else ""
    )

    st.markdown(
        f"""
        <div style='background:#ffffff;border:2px solid {border_color};border-radius:10px;
                    padding:1.25rem;text-align:center;margin-top:1rem;'>
            {model_sub}
            <span class='badge {badge_class}'
                  style='font-size:0.8rem;padding:0.3rem 0.85rem;'>
                {status_text}
            </span>
            <div style='font-size:2.25rem;font-weight:800;color:{prob_color};
                        margin-top:0.75rem;line-height:1;'>
                {probability * 100:.1f}%
            </div>
            <div style='color:#64748b;font-size:0.8rem;margin-top:0.3rem;'>
                Estimated Probability of Clearance by Arrest
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )


# ─────────────────────────────────────────────────────────────────────────────
# Empty State
# ─────────────────────────────────────────────────────────────────────────────

def render_empty_state(message: str, icon: str = "📭") -> None:
    """Render a styled empty-state placeholder panel.

    Args:
        message: Descriptive text explaining what data is absent.
        icon: Optional decorative emoji prefix.
    """
    st.markdown(
        f"<div class='empty-state'>{icon} {message}</div>",
        unsafe_allow_html=True,
    )
