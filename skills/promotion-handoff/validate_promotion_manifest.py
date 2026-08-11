#!/usr/bin/env python3
"""Validate a promotion manifest before opening a PR to OKHP3/skillz.

Checks:
  1. Required manifest fields are present and non-empty.
  2. inventory is non-empty and each entry has ``file`` and ``sha256``.
  3. mirrors[0].aggregate_sha256 is present.
  4. (Optional) If --skill-path is supplied, walks the local directory,
     computes SHA-256 for every file, recomputes the aggregate hash using the
     canonical formula, and compares it to mirrors[0].aggregate_sha256.  Also
     reports files present on disk but absent from the inventory, and inventory
     entries whose file is missing on disk.

Exit codes
----------
0  All checks passed.
1  One or more validation failures (field missing, hash mismatch, drift).
2  Fatal error (manifest unreadable, bad JSON, unexpected exception).

Usage examples
--------------
# Schema-only check (no local files):
    python3 validate_promotion_manifest.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json

# Full check including local skill directory:
    python3 validate_promotion_manifest.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --skill-path ../../.agents/skills/okhp3-replit-repl-janitor

# Write JSON report to a file:
    python3 validate_promotion_manifest.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --skill-path ../../.agents/skills/okhp3-replit-repl-janitor \\
        --report /tmp/manifest-validation.json

Aggregate hash formula (canonical, must not diverge from sync_skill_mirror.py)
-------------------------------------------------------------------------------
For a dict mapping relative_path -> sha256_hex, sorted by relative_path:
    sha256( relative_path \\0 sha256_hex \\n  for each entry )
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional


# ---------------------------------------------------------------------------
# Canonical aggregate hash formula — keep identical to sync_skill_mirror.py
# and verify_skill_landing.py
# ---------------------------------------------------------------------------

def aggregate_hash(files: Dict[str, str]) -> str:
    """Return the SHA-256 aggregate over a filename→hash mapping.

    Entries are processed in sorted filename order.  Each entry contributes:
        filename_bytes + b'\\0' + hash_ascii_bytes + b'\\n'
    """
    digest = hashlib.sha256()
    for relative, file_hash in sorted(files.items()):
        digest.update(relative.encode("utf-8"))
        digest.update(b"\0")
        digest.update(file_hash.encode("ascii"))
        digest.update(b"\n")
    return digest.hexdigest()


def sha256_file(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


# ---------------------------------------------------------------------------
# Schema validation
# ---------------------------------------------------------------------------

def validate_schema(manifest: dict) -> List[dict]:
    """Return a list of field-check results for the manifest structure."""
    checks: List[dict] = []

    def chk(name: str, ok: bool, message: str) -> None:
        checks.append({"check": name, "status": "PASS" if ok else "FAIL", "message": message})

    # schema_version
    sv = manifest.get("schema_version")
    chk("field:schema_version", bool(sv),
        f"schema_version = {sv!r}" if sv else "Required field 'schema_version' is missing or empty")

    # skill.name
    skill = manifest.get("skill", {})
    if not isinstance(skill, dict):
        chk("field:skill", False, "'skill' must be a JSON object")
    else:
        name = skill.get("name")
        chk("field:skill.name", bool(name),
            f"skill.name = {name!r}" if name else "Required field 'skill.name' is missing or empty")

    # canonical_target
    ct = manifest.get("canonical_target")
    if not isinstance(ct, dict):
        chk("field:canonical_target", False, "'canonical_target' must be a JSON object")
    else:
        chk("field:canonical_target", True, "canonical_target present")
        for sub in ("repository", "package_path"):
            val = ct.get(sub)
            chk(f"field:canonical_target.{sub}", bool(val),
                f"canonical_target.{sub} = {val!r}" if val
                else f"Required field 'canonical_target.{sub}' is missing or empty")
        repo = ct.get("repository", "")
        if repo:
            ok = "/" in repo
            chk("field:canonical_target.repository_format", ok,
                "repository is in 'owner/repo' format" if ok
                else f"canonical_target.repository must be 'owner/repo', got {repo!r}")

    # mirrors[0].aggregate_sha256
    mirrors = manifest.get("mirrors", [])
    chk("field:mirrors_non_empty", bool(mirrors),
        f"{len(mirrors)} mirror(s) declared" if mirrors else "'mirrors' is empty or missing")
    if mirrors:
        first = mirrors[0] if isinstance(mirrors[0], dict) else {}
        agg = first.get("aggregate_sha256", "")
        chk("field:mirrors[0].aggregate_sha256", bool(agg),
            f"aggregate_sha256 present ({agg[:16]}…)" if agg
            else "mirrors[0].aggregate_sha256 is missing or empty")

    # inventory
    inventory = manifest.get("inventory", [])
    chk("field:inventory_non_empty", bool(inventory),
        f"{len(inventory)} file(s) in inventory" if inventory else "'inventory' is empty or missing")
    if inventory:
        bad: List[str] = []
        for i, entry in enumerate(inventory):
            if not isinstance(entry, dict):
                bad.append(f"inventory[{i}] is not an object")
            else:
                if not entry.get("file"):
                    bad.append(f"inventory[{i}] missing 'file'")
                if not entry.get("sha256"):
                    bad.append(f"inventory[{i}] missing 'sha256'")
        chk("field:inventory_entries",
            not bad,
            f"All {len(inventory)} entries have 'file' and 'sha256'" if not bad
            else "; ".join(bad))

    return checks


# ---------------------------------------------------------------------------
# Local skill directory validation
# ---------------------------------------------------------------------------

def validate_local(manifest: dict, skill_path: Path) -> List[dict]:
    """Walk skill_path and compare against manifest inventory + mirrors aggregate."""
    checks: List[dict] = []

    def chk(name: str, ok: bool, message: str) -> None:
        checks.append({"check": name, "status": "PASS" if ok else "FAIL", "message": message})

    if not skill_path.is_dir():
        chk("local:skill_path_exists", False, f"Skill path not found: {skill_path}")
        return checks

    chk("local:skill_path_exists", True, f"Directory exists: {skill_path}")

    # Collect disk files (relative paths → sha256)
    disk_files: Dict[str, str] = {}
    for p in sorted(skill_path.rglob("*")):
        if p.is_file():
            rel = str(p.relative_to(skill_path))
            disk_files[rel] = sha256_file(p)

    # Collect expected files from inventory
    inventory = manifest.get("inventory", [])
    inv_files: Dict[str, str] = {
        e["file"]: e["sha256"]
        for e in inventory
        if isinstance(e, dict) and e.get("file") and e.get("sha256")
    }

    # Per-file match
    for rel, expected in inv_files.items():
        if rel not in disk_files:
            checks.append({"check": f"local:file:{rel}", "status": "FAIL",
                           "message": f"In inventory but missing on disk: {rel}"})
        else:
            actual = disk_files[rel]
            matched = actual == expected
            checks.append({
                "check": f"local:file:{rel}",
                "status": "PASS" if matched else "FAIL",
                "message": (f"SHA-256 matches ({actual[:16]}…)" if matched
                            else f"SHA-256 mismatch — expected {expected[:16]}…, actual {actual[:16]}…"),
            })

    # Extra files on disk not in inventory
    extra = sorted(set(disk_files) - set(inv_files))
    chk("local:extra_files",
        not extra,
        "No extra files on disk outside inventory" if not extra
        else f"{len(extra)} file(s) on disk not in inventory: {', '.join(extra)}")

    # Aggregate hash
    expected_agg = ""
    mirrors = manifest.get("mirrors", [])
    if mirrors and isinstance(mirrors[0], dict):
        expected_agg = mirrors[0].get("aggregate_sha256", "")

    if expected_agg:
        actual_agg = aggregate_hash(disk_files)
        matched = actual_agg == expected_agg
        chk("local:aggregate_sha256",
            matched,
            (f"Aggregate SHA-256 matches mirrors[0] ({actual_agg[:16]}…)" if matched
             else f"Aggregate mismatch — expected {expected_agg[:16]}…, actual {actual_agg[:16]}…"))
    else:
        checks.append({"check": "local:aggregate_sha256", "status": "SKIP",
                       "message": "No expected aggregate in mirrors — skipped"})

    return checks


# ---------------------------------------------------------------------------
# Output helpers
# ---------------------------------------------------------------------------

def _print_section(heading: str, checks: List[dict]) -> None:
    print(f"\n  {heading}")
    for c in checks:
        marker = {"PASS": "✓", "FAIL": "✗", "SKIP": "–"}.get(c["status"], "?")
        print(f"    {marker} [{c['status']}] {c['check']}: {c['message']}")


def _emit_fatal(message: str, report_path: Optional[Path]) -> None:
    payload = json.dumps({"overall": "ERROR", "error": message}, indent=2, sort_keys=True) + "\n"
    print(f"ERROR: {message}", file=sys.stderr)
    if report_path:
        try:
            report_path.parent.mkdir(parents=True, exist_ok=True)
            report_path.write_text(payload, encoding="utf-8")
        except OSError:
            pass
    else:
        print(payload)


# ---------------------------------------------------------------------------
# Top-level runner
# ---------------------------------------------------------------------------

def run(
    manifest_path: Path,
    skill_path: Optional[Path],
    report_path: Optional[Path],
    verbose: bool,
) -> int:
    # Parse manifest
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except OSError as exc:
        _emit_fatal(f"Cannot read manifest: {exc}", report_path)
        return 2
    except json.JSONDecodeError as exc:
        _emit_fatal(f"Manifest is not valid JSON: {exc}", report_path)
        return 2
    except Exception as exc:  # noqa: BLE001
        _emit_fatal(f"Unexpected error: {exc}", report_path)
        return 2

    skill_name: str = manifest.get("skill", {}).get("name", "<unknown>")

    if verbose:
        print(f"validate_promotion_manifest: {skill_name}")
        print(f"  manifest  : {manifest_path}")
        if skill_path:
            print(f"  skill_path: {skill_path}")

    schema_checks = validate_schema(manifest)
    local_checks: List[dict] = []
    if skill_path is not None:
        local_checks = validate_local(manifest, skill_path)

    all_checks = schema_checks + local_checks
    passed = sum(1 for c in all_checks if c["status"] == "PASS")
    failed = sum(1 for c in all_checks if c["status"] == "FAIL")
    skipped = sum(1 for c in all_checks if c["status"] == "SKIP")
    overall_pass = failed == 0

    if verbose:
        _print_section("Schema / field checks", schema_checks)
        if local_checks:
            _print_section("Local skill directory checks", local_checks)
        print()
        verdict = "PASS" if overall_pass else "FAIL"
        print(f"  result: {verdict}  ({passed} passed, {failed} failed, {skipped} skipped)")

    report: dict = {
        "manifest": str(manifest_path.resolve()),
        "skill": skill_name,
        "skill_path": str(skill_path.resolve()) if skill_path else None,
        "overall": "PASS" if overall_pass else "FAIL",
        "checks_passed": passed,
        "checks_failed": failed,
        "checks_skipped": skipped,
        "field_checks": schema_checks,
        "local_checks": local_checks if local_checks else None,
    }

    if report_path:
        try:
            report_path.parent.mkdir(parents=True, exist_ok=True)
            report_path.write_text(
                json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8"
            )
            if verbose:
                print(f"\n  report written: {report_path}")
        except OSError as exc:
            print(f"\nWarning: could not write report: {exc}", file=sys.stderr)
    else:
        if verbose:
            print()
        print(json.dumps(report, indent=2, sort_keys=True))

    return 0 if overall_pass else 1


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--manifest", type=Path, required=True, metavar="PATH",
        help="Path to the promotion manifest JSON file.",
    )
    parser.add_argument(
        "--skill-path", type=Path, metavar="PATH", default=None,
        help=(
            "Path to the local skill directory. When supplied, every file is "
            "hashed and compared to the manifest inventory and "
            "mirrors[0].aggregate_sha256."
        ),
    )
    parser.add_argument(
        "--report", type=Path, metavar="PATH", default=None,
        help="Write JSON report to this file (prints to stdout when omitted).",
    )
    parser.add_argument(
        "--quiet", action="store_true",
        help="Suppress human-readable output; emit only the JSON report.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    return run(
        manifest_path=args.manifest,
        skill_path=args.skill_path,
        report_path=args.report,
        verbose=not args.quiet,
    )


if __name__ == "__main__":
    sys.exit(main())
