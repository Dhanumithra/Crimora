"""Project Configuration Module.

Defines filesystem paths and directory management utilities using pathlib.
All paths are resolved relative to this module's location to guarantee portability
across different development environments without hardcoded absolute paths.
"""

from pathlib import Path
from typing import Dict, List

# Reusable project paths
PROJECT_ROOT: Path = Path(__file__).resolve().parent.parent

DATA_DIR: Path = PROJECT_ROOT / "data"
RAW_DATA_DIR: Path = DATA_DIR / "raw"
PROCESSED_DATA_DIR: Path = DATA_DIR / "processed"

MODELS_DIR: Path = PROJECT_ROOT / "models"
NOTEBOOKS_DIR: Path = PROJECT_ROOT / "notebooks"
OUTPUTS_DIR: Path = PROJECT_ROOT / "outputs"
ASSETS_DIR: Path = PROJECT_ROOT / "assets"
SRC_DIR: Path = PROJECT_ROOT / "src"
TESTS_DIR: Path = PROJECT_ROOT / "tests"

# Expected raw dataset filenames (subject to schema inspection when ingested)
EXPECTED_DATASET_NAMES: List[str] = [
    "homicide-data.csv",
    "dstrIPC_1_2014.csv",
    "TN-murder-2023.csv",
    "TN-2020-2022-total.csv",
]


def get_project_paths() -> Dict[str, Path]:
    """Return a dictionary of all standard project directory paths.

    Returns:
        Dict[str, Path]: Mapping of directory identifiers to their resolved Path objects.
    """
    return {
        "PROJECT_ROOT": PROJECT_ROOT,
        "DATA_DIR": DATA_DIR,
        "RAW_DATA_DIR": RAW_DATA_DIR,
        "PROCESSED_DATA_DIR": PROCESSED_DATA_DIR,
        "MODELS_DIR": MODELS_DIR,
        "NOTEBOOKS_DIR": NOTEBOOKS_DIR,
        "OUTPUTS_DIR": OUTPUTS_DIR,
        "ASSETS_DIR": ASSETS_DIR,
        "SRC_DIR": SRC_DIR,
        "TESTS_DIR": TESTS_DIR,
    }


def ensure_directories() -> None:
    """Ensure that all core project directories exist on the filesystem.

    Creates missing directories idempotently without modifying existing contents.
    """
    for path_name, path in get_project_paths().items():
        if path != PROJECT_ROOT:
            path.mkdir(parents=True, exist_ok=True)
