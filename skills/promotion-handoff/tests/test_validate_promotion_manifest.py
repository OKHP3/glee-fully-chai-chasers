#!/usr/bin/env python3
"""Tests for validate_promotion_manifest.py.

Covers:
  - Valid manifest schema-only                         → exit 0
  - Valid manifest + matching local skill dir          → exit 0, aggregate PASS
  - Missing required field                             → exit 1
  - Empty inventory                                    → exit 1
  - Missing mirrors[0].aggregate_sha256                → exit 1
  - Local dir with one file's content changed          → exit 1
  - Local dir with an extra file not in inventory      → exit 1
  - Bad JSON file                                      → exit 2
"""

from __future__ import annotations

import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

# ---------------------------------------------------------------------------
# Load the module under test via importlib so we can call internal functions
# ---------------------------------------------------------------------------

_SCRIPT = Path(__file__).parents[1] / "validate_promotion_manifest.py"
_SPEC = importlib.util.spec_from_file_location("validate_promotion_manifest", _SCRIPT)
assert _SPEC and _SPEC.loader, f"Could not locate module at {_SCRIPT}"
vpm = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(vpm)  # type: ignore[union-attr]


# ---------------------------------------------------------------------------
# Helper: build a self-consistent manifest from {rel_path: content} pairs
# ---------------------------------------------------------------------------

def _sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _build_manifest(inv_files: dict[str, bytes]) -> tuple[dict, dict[str, bytes]]:
    """Return (manifest_dict, inv_files) with correct per-file and aggregate hashes.

    The aggregate is computed with the canonical formula from the module so the
    manifest is internally consistent before any deliberate tampering.
    """
    inventory = []
    file_hashes: dict[str, str] = {}
    for rel in sorted(inv_files):
        h = _sha256_bytes(inv_files[rel])
        inventory.append({"file": rel, "sha256": h})
        file_hashes[rel] = h

    agg = vpm.aggregate_hash(file_hashes)

    manifest: dict = {
        "schema_version": "1.0",
        "skill": {"name": "test-skill"},
        "canonical_target": {
            "repository": "owner/repo",
            "package_path": ".agents/skills/test-skill",
        },
        "mirrors": [{"aggregate_sha256": agg}],
        "inventory": inventory,
    }
    return manifest, inv_files


def _write_manifest(directory: Path, manifest: dict) -> Path:
    path = directory / "manifest.json"
    path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return path


def _populate_skill_dir(directory: Path, contents: dict[str, bytes]) -> Path:
    skill_dir = directory / "skill"
    for rel, data in contents.items():
        dest = skill_dir / rel
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_bytes(data)
    return skill_dir


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


class TestSchemaOnlyValid(unittest.TestCase):
    """Valid manifest → schema-only check → exit 0."""

    def test_valid_manifest_schema_only_exits_0(self) -> None:
        manifest, _ = _build_manifest({"SKILL.md": b"# Hello\n", "README.md": b"Hi\n"})
        with tempfile.TemporaryDirectory() as td:
            mf = _write_manifest(Path(td), manifest)
            code = vpm.run(mf, None, True, None, False)
        self.assertEqual(code, 0)


class TestValidWithLocalDir(unittest.TestCase):
    """Valid manifest + matching local skill dir → exit 0, aggregate PASS."""

    def test_exits_0_when_local_dir_matches(self) -> None:
        files = {"SKILL.md": b"# Skill\n", "examples/demo.md": b"Demo\n"}
        manifest, contents = _build_manifest(files)
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            mf = _write_manifest(root, manifest)
            skill_dir = _populate_skill_dir(root, contents)
            code = vpm.run(mf, skill_dir, False, None, False)
        self.assertEqual(code, 0)

    def test_report_shows_aggregate_pass(self) -> None:
        files = {"SKILL.md": b"# Skill\n", "notes.md": b"Notes\n"}
        manifest, contents = _build_manifest(files)
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            mf = _write_manifest(root, manifest)
            skill_dir = _populate_skill_dir(root, contents)
            report_path = root / "report.json"
            code = vpm.run(mf, skill_dir, False, report_path, False)
            self.assertEqual(code, 0)
            report = json.loads(report_path.read_text(encoding="utf-8"))
        self.assertEqual(report["overall"], "PASS")
        local_checks = report.get("local_checks") or []
        agg = [c for c in local_checks if c["check"] == "local:aggregate_sha256"]
        self.assertTrue(agg, "Expected a local:aggregate_sha256 check in the report")
        self.assertEqual(agg[0]["status"], "PASS")


class TestMissingRequiredFields(unittest.TestCase):
    """Each required field omitted individually → exit 1."""

    def _run_schema_only(self, manifest: dict) -> int:
        with tempfile.TemporaryDirectory() as td:
            mf = _write_manifest(Path(td), manifest)
            return vpm.run(mf, None, True, None, False)

    def _base(self) -> dict:
        manifest, _ = _build_manifest({"SKILL.md": b"x"})
        return manifest

    def test_missing_schema_version(self) -> None:
        m = self._base()
        del m["schema_version"]
        self.assertEqual(self._run_schema_only(m), 1)

    def test_missing_skill_name(self) -> None:
        m = self._base()
        del m["skill"]["name"]
        self.assertEqual(self._run_schema_only(m), 1)

    def test_missing_canonical_target_repository(self) -> None:
        m = self._base()
        del m["canonical_target"]["repository"]
        self.assertEqual(self._run_schema_only(m), 1)


class TestEmptyInventory(unittest.TestCase):
    """inventory set to [] → exit 1."""

    def test_empty_inventory_exits_1(self) -> None:
        manifest, _ = _build_manifest({"SKILL.md": b"x"})
        manifest["inventory"] = []
        with tempfile.TemporaryDirectory() as td:
            mf = _write_manifest(Path(td), manifest)
            code = vpm.run(mf, None, True, None, False)
        self.assertEqual(code, 1)


class TestMissingAggregatesha256(unittest.TestCase):
    """mirrors[0] without aggregate_sha256 → exit 1."""

    def test_mirror_without_aggregate_sha256_exits_1(self) -> None:
        manifest, _ = _build_manifest({"SKILL.md": b"x"})
        manifest["mirrors"] = [{"url": "https://example.com/mirror"}]
        with tempfile.TemporaryDirectory() as td:
            mf = _write_manifest(Path(td), manifest)
            code = vpm.run(mf, None, True, None, False)
        self.assertEqual(code, 1)


class TestLocalDirHashMismatch(unittest.TestCase):
    """One file's content changed on disk → hash mismatch → exit 1."""

    def test_changed_file_content_exits_1(self) -> None:
        files = {"SKILL.md": b"# Original\n", "notes.md": b"Notes\n"}
        manifest, contents = _build_manifest(files)
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            mf = _write_manifest(root, manifest)
            skill_dir = _populate_skill_dir(root, contents)
            # Tamper with one file after the skill dir is written
            (skill_dir / "SKILL.md").write_bytes(b"# Modified - different content\n")
            code = vpm.run(mf, skill_dir, False, None, False)
        self.assertEqual(code, 1)


class TestLocalDirExtraFile(unittest.TestCase):
    """Extra file on disk not listed in inventory → exit 1."""

    def test_extra_file_exits_1(self) -> None:
        files = {"SKILL.md": b"# Skill\n"}
        manifest, contents = _build_manifest(files)
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            mf = _write_manifest(root, manifest)
            skill_dir = _populate_skill_dir(root, contents)
            # Plant a file that is not in the inventory
            (skill_dir / "secret.md").write_bytes(b"Not in manifest\n")
            code = vpm.run(mf, skill_dir, False, None, False)
        self.assertEqual(code, 1)


class TestBadJson(unittest.TestCase):
    """Malformed JSON file → exit 2."""

    def test_invalid_json_exits_2(self) -> None:
        with tempfile.TemporaryDirectory() as td:
            mf = Path(td) / "manifest.json"
            mf.write_text("{this is not : valid json!!!", encoding="utf-8")
            code = vpm.run(mf, None, True, None, False)
        self.assertEqual(code, 2)


if __name__ == "__main__":
    unittest.main()
