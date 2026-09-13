"""Basic configuration and inspection smoke tests.

Validates that src.config and src.data_inspection function cleanly and handle edge cases.
"""

import unittest
from pathlib import Path
from src.config import (
    PROJECT_ROOT,
    DATA_DIR,
    RAW_DATA_DIR,
    PROCESSED_DATA_DIR,
    MODELS_DIR,
    NOTEBOOKS_DIR,
    OUTPUTS_DIR,
    ASSETS_DIR,
    SRC_DIR,
    TESTS_DIR,
    get_project_paths,
    ensure_directories,
)
from src.data_inspection import inspect_dataset, format_inspection_report


class TestProjectConfiguration(unittest.TestCase):
    """Test suite for project directory configurations."""

    def test_project_root_exists(self):
        """Ensure PROJECT_ROOT resolves to an existing directory."""
        self.assertTrue(PROJECT_ROOT.exists(), f"PROJECT_ROOT does not exist: {PROJECT_ROOT}")
        self.assertTrue(PROJECT_ROOT.is_dir(), f"PROJECT_ROOT is not a directory: {PROJECT_ROOT}")

    def test_required_paths_defined(self):
        """Verify that all standard directories are configured as Path objects."""
        paths = get_project_paths()
        expected_keys = [
            "PROJECT_ROOT",
            "DATA_DIR",
            "RAW_DATA_DIR",
            "PROCESSED_DATA_DIR",
            "MODELS_DIR",
            "NOTEBOOKS_DIR",
            "OUTPUTS_DIR",
            "ASSETS_DIR",
            "SRC_DIR",
            "TESTS_DIR",
        ]
        for key in expected_keys:
            self.assertIn(key, paths)
            self.assertIsInstance(paths[key], Path)

    def test_ensure_directories_idempotent(self):
        """Verify that ensure_directories runs without error."""
        ensure_directories()
        self.assertTrue(RAW_DATA_DIR.exists())
        self.assertTrue(PROCESSED_DATA_DIR.exists())
        self.assertTrue(MODELS_DIR.exists())
        self.assertTrue(OUTPUTS_DIR.exists())
        self.assertTrue(ASSETS_DIR.exists())


class TestDataInspectionUtility(unittest.TestCase):
    """Test suite for dataset inspection error handling."""

    def test_missing_file_handling(self):
        """Inspect non-existent file should gracefully return error status, not raise exception."""
        non_existent = RAW_DATA_DIR / "non_existent_dataset.csv"
        result = inspect_dataset(non_existent)
        self.assertEqual(result["status"], "error")
        self.assertIn("File not found", result["error_message"])
        self.assertFalse(result["file_exists"])

    def test_format_report_for_missing_file(self):
        """Ensure report formatting executes cleanly for error results."""
        non_existent = RAW_DATA_DIR / "non_existent_dataset.csv"
        result = inspect_dataset(non_existent)
        formatted = format_inspection_report(result)
        self.assertIsInstance(formatted, str)
        self.assertIn("ERROR", formatted)


if __name__ == "__main__":
    unittest.main()
