#!/usr/bin/env python3
"""Pre-promotion gate: validate a promotion manifest before opening a PR.

By default, both schema/field validation AND local skill directory verification
are required.  Pass ``--schema-only`` to skip the local directory check (useful
for inspecting a manifest that has no local mirror available).

Checks performed
----------------
Schema / field checks (always run):
  - Root JSON is a plain object (not array, string, etc.)
  - schema_version present and non-empty
  - skill.name present, non-empty string
  - canonical_target.repository present, non-empty, in "owner/repo" format
  - canonical_target.package_path present, non-empty
  - mirrors is a non-empty list with a valid 64-hex aggregate_sha256 in mirrors[0]
  - inventory is a non-empty list; each entry has a non-empty "file" string and
    a valid 64-hex "sha256" string; no duplicate filenames; no path-traversal
    (relative paths only, no ".." components)

Local skill directory checks (default; skipped with --schema-only):
  - skill_path exists and is a directory
  - Every inventory file exists on disk with a matching SHA-256
  - No extra files on disk that are not in the inventory
  - Aggregate hash of disk files matches mirrors[0].aggregate_sha256

Exit codes
----------
0  All checks passed.
1  One or more validation failures.
2  Fatal error (manifest missing, unreadable, invalid JSON, or the root JSON
   value is not an object).  A structured ``{"overall":"ERROR","error":"..."}``
   JSON report is always emitted on exit 2.

Usage examples
--------------
# Full check (default) — manifest + local skill directory:
    python3 validate_promotion_manifest.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --skill-path ../../.agents/skills/okhp3-replit-repl-janitor

# Schema-only check (no local files):
    python3 validate_promotion_manifest.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --schema-only

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
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional

_SHA256_RE = re.compile(r"^[0-9a-f]{64}$")


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


def _is_safe_relative(rel: str) -> bool:
    """Return True if rel is a non-empty, relative, non-traversing path."""
    if not rel or rel.startswith("/"):
        return False
    parts = rel.replace("\\", "/").split("/")
    return not any(p in ("", ".", "..") for p in parts)


# ---------------------------------------------------------------------------
# Schema / field validation
# ---------------------------------------------------------------------------

def validate_schema(manifest: dict) -> List[dict]:  # noqa: C901
    checks: List[dict] = []

    def chk(name: str, ok: bool, message: str) -> None:
        checks.append({"check": name, "status": "PASS" if ok else "FAIL",
                       "message": message})

    # schema_version
    sv = manifest.get("schema_version")
    chk("field:schema_version", isinstance(sv, str) and bool(sv),
        f"schema_version = {sv!r}" if (isinstance(sv, str) and sv)
        else "Required field 'schema_version' must be a non-empty string")

    # skill.name
    skill = manifest.get("skill")
    if not isinstance(skill, dict):
        chk("field:skill", False,
            f"'skill' must be a JSON object, got {type(skill).__name__}")
    else:
        name = skill.get("name")
        chk("field:skill.name", isinstance(name, str) and bool(name),
            f"skill.name = {name!r}" if (isinstance(name, str) and name)
            else f"'skill.name' must be a non-empty string, got {name!r}")

    # canonical_target
    ct = manifest.get("canonical_target")
    if not isinstance(ct, dict):
        chk("field:canonical_target", False,
            f"'canonical_target' must be a JSON object, got {type(ct).__name__}")
    else:
        chk("field:canonical_target", True, "canonical_target present")
        for sub in ("repository", "package_path"):
            val = ct.get(sub)
            chk(f"field:canonical_target.{sub}",
                isinstance(val, str) and bool(val),
                f"canonical_target.{sub} = {val!r}" if (isinstance(val, str) and val)
                else f"'canonical_target.{sub}' must be a non-empty string, got {val!r}")
        repo = ct.get("repository", "")
        if isinstance(repo, str) and repo:
            ok = "/" in repo and len(repo.split("/", 1)) == 2
            chk("field:canonical_target.repository_format", ok,
                "repository is in 'owner/repo' format" if ok
                else f"Must be 'owner/repo', got {repo!r}")

    # mirrors
    mirrors = manifest.get("mirrors")
    if not isinstance(mirrors, list):
        chk("field:mirrors_non_empty", False,
            f"'mirrors' must be a JSON array, got {type(mirrors).__name__}")
    else:
        chk("field:mirrors_non_empty", bool(mirrors),
            f"{len(mirrors)} mirror(s) declared" if mirrors else "'mirrors' is empty")
        if mirrors:
            first = mirrors[0]
            if not isinstance(first, dict):
                chk("field:mirrors[0].aggregate_sha256", False,
                    f"mirrors[0] must be an object, got {type(first).__name__}")
            else:
                agg = first.get("aggregate_sha256")
                valid = isinstance(agg, str) and bool(_SHA256_RE.match(agg or ""))
                chk("field:mirrors[0].aggregate_sha256", valid,
                    f"aggregate_sha256 present ({agg[:16]}…)" if valid
                    else f"Must be a 64-hex string, got {agg!r}")

    # inventory
    inventory = manifest.get("inventory")
    if not isinstance(inventory, list):
        chk("field:inventory_non_empty", False,
            f"'inventory' must be a JSON array, got {type(inventory).__name__}")
    else:
        chk("field:inventory_non_empty", bool(inventory),
            f"{len(inventory)} file(s) in inventory" if inventory
            else "'inventory' is empty")
        if inventory:
            bad: List[str] = []
            seen_files: set = set()
            for i, entry in enumerate(inventory):
                if not isinstance(entry, dict):
                    bad.append(f"inventory[{i}] is not an object")
                    continue
                rel = entry.get("file")
                h = entry.get("sha256")
                if not isinstance(rel, str) or not rel:
                    bad.append(f"inventory[{i}].file missing or not a string")
                elif not _is_safe_relative(rel):
                    bad.append(f"inventory[{i}].file is unsafe/absolute: {rel!r}")
                elif rel in seen_files:
                    bad.append(f"inventory[{i}].file duplicate: {rel!r}")
                else:
                    seen_files.add(rel)
                if not isinstance(h, str) or not _SHA256_RE.match(h or ""):
                    bad.append(
                        f"inventory[{i}].sha256 must be 64-hex, got {h!r}")
            chk("field:inventory_entries", not bad,
                f"All {len(inventory)} entries valid" if not bad
                else "; ".join(bad))

    return checks


# ---------------------------------------------------------------------------
# Local skill directory validation
# ---------------------------------------------------------------------------

def validate_local(manifest: dict, skill_path: Path) -> List[dict]:
    checks: List[dict] = []

    def chk(name: str, ok: bool, message: str) -> None:
        checks.append({"check": name, "status": "PASS" if ok else "FAIL",
                       "message": message})

    if not skill_path.is_dir():
        chk("local:skill_path_exists", False,
            f"Skill path not found or not a directory: {skill_path}")
        return checks

    chk("local:skill_path_exists", True, f"Directory exists: {skill_path}")

    # Collect disk files
    disk_files: Dict[str, str] = {}
    for p in sorted(skill_path.rglob("*")):
        if p.is_file():
            rel = str(p.relative_to(skill_path))
            disk_files[rel] = sha256_file(p)

    # Collect expected files from inventory
    inventory = manifest.get("inventory", [])
    inv_files: Dict[str, str] = {}
    for e in inventory:
        if isinstance(e, dict) and isinstance(e.get("file"), str) and isinstance(e.get("sha256"), str):
            inv_files[e["file"]] = e["sha256"]

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
                            else f"Mismatch — expected {expected[:16]}…, actual {actual[:16]}…"),
            })

    # Extra files not in inventory
    extra = sorted(set(disk_files) - set(inv_files))
    chk("local:extra_files", not extra,
        "No extra files outside inventory" if not extra
        else f"{len(extra)} file(s) on disk not in inventory: {', '.join(extra)}")

    # Aggregate hash
    expected_agg = ""
    mirrors = manifest.get("mirrors", [])
    if mirrors and isinstance(mirrors[0], dict):
        v = mirrors[0].get("aggregate_sha256", "")
        if isinstance(v, str):
            expected_agg = v

    if expected_agg:
        actual_agg = aggregate_hash(disk_files)
        matched = actual_agg == expected_agg
        chk("local:aggregate_sha256", matched,
            f"Aggregate matches mirrors[0] ({actual_agg[:16]}…)" if matched
            else f"Aggregate mismatch — expected {expected_agg[:16]}…, actual {actual_agg[:16]}…")
    else:
        checks.append({"check": "local:aggregate_sha256", "status": "SKIP",
                       "message": "No valid expected aggregate in mirrors — skipped"})

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
    payload = json.dumps({"overall": "ERROR", "error": message},
                         indent=2, sort_keys=True) + "\n"
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
    schema_only: bool,
    report_path: Optional[Path],
    verbose: bool,
) -> int:
    # --- Parse manifest (fatal errors → exit 2) ---
    if not manifest_path.exists():
        _emit_fatal(f"Manifest file not found: {manifest_path}", report_path)
        return 2
    try:
        raw = manifest_path.read_text(encoding="utf-8")
    except OSError as exc:
        _emit_fatal(f"Cannot read manifest: {exc}", report_path)
        return 2
    try:
        manifest = json.loads(raw)
    except json.JSONDecodeError as exc:
        _emit_fatal(f"Manifest is not valid JSON: {exc}", report_path)
        return 2
    except Exception as exc:  # noqa: BLE001
        _emit_fatal(f"Unexpected error parsing manifest: {exc}", report_path)
        return 2

    # Root must be a JSON object
    if not isinstance(manifest, dict):
        _emit_fatal(
            f"Manifest root must be a JSON object, got {type(manifest).__name__}",
            report_path,
        )
        return 2

    skill_name: str = ""
    try:
        skill_name = manifest.get("skill", {}).get("name", "") or "<unknown>"
    except Exception:  # noqa: BLE001
        skill_name = "<unknown>"

    if verbose:
        print(f"validate_promotion_manifest: {skill_name}")
        print(f"  manifest   : {manifest_path}")
        if not schema_only:
            effective_path = skill_path or "<required — see --skill-path>"
            print(f"  skill_path : {effective_path}")
        else:
            print("  mode       : schema-only (local checks skipped)")

    # --- Schema validation ---
    schema_checks = validate_schema(manifest)

    # --- Local validation ---
    local_checks: List[dict] = []
    if not schema_only:
        if skill_path is None:
            # No --skill-path provided and not --schema-only: fatal
            _emit_fatal(
                "Local skill directory is required for pre-promotion validation. "
                "Provide --skill-path <dir> or pass --schema-only to skip local checks.",
                report_path,
            )
            return 2
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
        "schema_only": schema_only,
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
                json.dumps(report, indent=2, sort_keys=True) + "\n",
                encoding="utf-8",
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
            "Path to the local skill directory. Required unless --schema-only "
            "is passed. Files are hashed and compared to the manifest inventory "
            "and mirrors[0].aggregate_sha256."
        ),
    )
    parser.add_argument(
        "--schema-only", action="store_true",
        help=(
            "Skip local directory checks. Validates only manifest field presence "
            "and types. Use when no local skill copy is available."
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
        schema_only=args.schema_only,
        report_path=args.report,
        verbose=not args.quiet,
    )


if __name__ == "__main__":
    sys.exit(main())
