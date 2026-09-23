"""Reusable UI Components for Streamlit Dashboard.

Provides standardized, executive presentation elements:
- Page headers with status badges
- Metric cards
- Section dividers
- Alerts and callout boxes
- Structured placeholders for Person A's future modules
- Case solvability score cards
- Academic responsible-use disclaimer
"""

from typing import Any, Dict, List, Optional
import streamlit as st


def render_page_header(
    title: str,
    subtitle: str,
    icon: str = "🔍",
    badge_text: str = "Person B Track",
    badge_type: str = "active",
) -> None:
    """Render a standardized page header with breadcrumb and status badge.

    Args:
        title: Main page title.
        subtitle: Explanatory subtitle or scope.
        icon: Page icon character or emoji.
        badge_text: Label text for badge.
        badge_type: Badge style ('active', 'pending', 'info', 'danger').
    """
    col1, col2 = st.columns([0.82, 0.18])
    with col1:
        st.markdown(f"## {icon} {title}")
        st.markdown(
            f"<div style='color: #64748b; font-size: 0.95rem; margin-top: -0.5rem; margin-bottom: 1.25rem;'>"
            f"{subtitle}</div>",
            unsafe_allow_html=True,
        )
    with col2:
        st.markdown(
            f"<div style='text-align: right; margin-top: 0.75rem;'>"
            f"<span class='badge badge-{badge_type}'>{badge_text}</span>"
            f"</div>",
            unsafe_allow_html=True,
        )
    st.markdown("<hr style='margin-top: 0; margin-bottom: 1.25rem; border-color: #e2e8f0;'>", unsafe_allow_html=True)


def render_section_header(title: str, description: Optional[str] = None) -> None:
    """Render a clean section header.

    Args:
        title: Section title.
        description: Optional descriptive text.
    """
    st.markdown(f"#### {title}")
    if description:
        st.markdown(
            f"<div style='color: #64748b; font-size: 0.875rem; margin-top: -0.4rem; margin-bottom: 0.85rem;'>"
            f"{description}</div>",
            unsafe_allow_html=True,
        )


def render_metric_card(
    title: str,
    value: Any,
    subtitle: Optional[str] = None,
    delta: Optional[str] = None,
    delta_color: str = "normal",
    delta_positive: bool = True,
    **kwargs: Any,
) -> None:
    """Render a styled metric container card.

    Args:
        title: Metric label.
        value: Primary metric number or text.
        subtitle: Optional contextual subtext.
        delta: Optional delta or change indicator.
        delta_color: Color mode ('normal', 'inverse', 'off').
        delta_positive: Whether delta represents positive/favorable status.
        **kwargs: Additional optional layout parameters.
    """
    sub_html = f"<div class='metric-subtitle'>{subtitle}</div>" if subtitle else ""
    color_hex = "#16a34a" if delta_positive else "#2563eb"
    delta_html = f"<div style='font-size: 0.8rem; color: {color_hex}; margin-top: 0.2rem;'>{delta}</div>" if delta else ""

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



def render_alert(message: str, alert_type: str = "info") -> None:
    """Render an informational, warning, or success callout box.

    Args:
        message: Content text.
        alert_type: Type ('info', 'warning', 'error', 'success').
    """
    if alert_type == "info":
        st.info(message)
    elif alert_type == "warning":
        st.warning(message)
    elif alert_type == "error":
        st.error(message)
    elif alert_type == "success":
        st.success(message)


def render_responsible_notice() -> None:
    """Render the academic decision-support ethics notice banner."""
    st.markdown(
        """
        <div class='notice-box'>
            <b>⚖️ Academic Decision-Support Prototype Notice</b><br>
            This system provides statistical pattern organization and exploratory predictive estimation.
            Outputs represent historical analytical tendencies and <b>never guarantee</b> case solvability,
            individual guilt, or exact offender residences. It is engineered strictly to assist trained
            analysts and does not replace professional investigative discretion.
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_placeholder_interface(
    feature_title: str,
    owner: str = "Person A",
    planned_day: str = "Day 7",
    methodology: str = "Unsupervised Clustering & Behavioral Synthesis",
    input_schema: Optional[List[str]] = None,
    expected_output: Optional[str] = None,
) -> None:
    """Render a structured, professional placeholder interface for upcoming modules.

    Avoids fabricating synthetic or fake results while displaying the complete
    expected contract, parameter schema, and analytical architecture.

    Args:
        feature_title: Name of the upcoming feature.
        owner: Responsible teammate ('Person A').
        planned_day: Development roadmap milestone.
        methodology: Theoretical or algorithmic foundation.
        input_schema: List of expected input variables.
        expected_output: Description of target output artifacts.
    """
    st.markdown(
        f"""
        <div class='crimora-card-highlight'>
            <div style='display: flex; justify-content: space-between; align-items: center;'>
                <h4 style='margin: 0; color: #1e1b4b;'>{feature_title}</h4>
                <span class='badge badge-pending'>Awaiting {owner} ({planned_day})</span>
            </div>
            <p style='color: #475569; font-size: 0.9rem; margin-top: 0.5rem;'>
                <b>Methodological Framework:</b> {methodology}
            </p>
            <p style='color: #64748b; font-size: 0.85rem;'>
                In accordance with the collaborative project roadmap, this module interface is reserved
                for <b>{owner}</b>. The UI contract and parameter controls are pre-wired below to ensure
                seamless zero-downtime integration once models are validated.
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    col1, col2 = st.columns(2)
    with col1:
        st.markdown("##### 📥 Planned Input Feature Parameters")
        if input_schema:
            for item in input_schema:
                st.markdown(f"- `{item}`")
        else:
            st.markdown("- Multi-attribute behavioral feature vectors\n- Temporal sequence markers\n- Jurisdictional codes")

    with col2:
        st.markdown("##### 📤 Target Output Contract")
        st.markdown(expected_output if expected_output else "Probabilistic belief updates & cluster assignments.")


def render_model_score_badge(
    prediction: int,
    probability: float,
    model_name: Optional[str] = None,
    **kwargs: Any,
) -> None:
    """Render a clean card displaying predicted case solvability status.

    Args:
        prediction: Binary prediction (1 = Solved, 0 = Unsolved).
        probability: Float confidence score between 0.0 and 1.0.
        model_name: Optional model name to display.
        **kwargs: Additional layout parameters.
    """
    if prediction == 1:
        status_text = "LIKELY SOLVED (Arrest Outcome Indicated)"
        badge_class = "badge-active"
        prob_color = "#059669"
        border_color = "#10b981"
    else:
        status_text = "POTENTIALLY UNSOLVED / HIGH CLEARANCE DIFFICULTY"
        badge_class = "badge-danger"
        prob_color = "#dc2626"
        border_color = "#f87171"

    model_sub = f"<div style='font-size: 0.8rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem;'>Model: {model_name}</div>" if model_name else ""

    st.markdown(
        f"""
        <div style='background: #ffffff; border: 2px solid {border_color}; border-radius: 10px; padding: 1.25rem; text-align: center; margin-top: 1rem;'>
            {model_sub}
            <span class='badge {badge_class}' style='font-size: 0.85rem; padding: 0.35rem 0.85rem;'>{status_text}</span>
            <div style='font-size: 2.25rem; font-weight: 800; color: {prob_color}; margin-top: 0.75rem;'>
                {probability * 100:.1f}%
            </div>
            <div style='color: #64748b; font-size: 0.825rem; margin-top: 0.25rem;'>
                Estimated Probability of Case Clearance by Arrest
            </div>
        </div>
        """,
        unsafe_allow_html=True,
    )

