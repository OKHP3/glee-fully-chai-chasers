#!/usr/bin/env python3
"""Verify that a promoted skill landed correctly in its canonical target repository.

Given a promotion manifest JSON, the script fetches every file listed in the
``inventory`` from the canonical target repository (OKHP3/skillz or any GitHub
repo recorded in the manifest) at a specified ref, recomputes SHA-256 hashes,
and checks them against the manifest.  It also recomputes the aggregate hash
using the canonical formula from sync_skill_mirror.py and compares it against
the expected value stored in the manifest's ``mirrors`` list.

Exit codes
----------
0  All checks passed — every file matches and the aggregate hash agrees.
1  One or more checks failed — files are missing, wrong, or the aggregate
   hash does not match.  Inspect the report for details.
2  Fatal error — the manifest could not be read, the GitHub API returned an
   unexpected error, or required fields are absent.

Usage examples
--------------
# Verify the default ref recorded in the manifest:
    python3 verify_skill_landing.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json

# Verify a specific commit or branch:
    python3 verify_skill_landing.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --ref main

# Write a JSON report alongside console output:
    python3 verify_skill_landing.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --report /tmp/landing-report.json

# Use a custom env-var name for the GitHub token:
    MYTOKEN=ghp_... python3 verify_skill_landing.py \\
        --manifest promotion-manifest-okhp3-replit-repl-janitor.json \\
        --token-env MYTOKEN

Aggregate hash formula (canonical, must not diverge from sync_skill_mirror.py)
-------------------------------------------------------------------------------
For a dict mapping relative_path -> sha256_hex, sorted by relative_path:
    sha256( relative_path \\0 sha256_hex \\n  for each entry )
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional, Tuple


# ---------------------------------------------------------------------------
# Canonical aggregate hash formula — keep identical to sync_skill_mirror.py
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


# ---------------------------------------------------------------------------
# GitHub API helpers
# ---------------------------------------------------------------------------

GITHUB_API = "https://api.github.com"
GITHUB_RAW = "https://raw.githubusercontent.com"


def _make_request(url: str, token: Optional[str]) -> bytes:
    """Fetch *url* and return raw bytes, raising on HTTP errors."""
    headers = {
        "Accept": "application/vnd.github.v3.raw",
        "User-Agent": "verify-skill-landing/1.0",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read()
    except urllib.error.HTTPError as exc:
        raise RuntimeError(
            f"HTTP {exc.code} fetching {url}: {exc.reason}"
        ) from exc
    except urllib.error.URLError as exc:
        raise RuntimeError(f"Network error fetching {url}: {exc.reason}") from exc


def fetch_file_content(
    owner: str,
    repo: str,
    path_in_repo: str,
    ref: str,
    token: Optional[str],
) -> bytes:
    """Return the raw bytes of a file from GitHub at the given ref."""
    # Use the raw content delivery endpoint (no base64 decoding needed).
    url = f"{GITHUB_RAW}/{owner}/{repo}/{ref}/{path_in_repo}"
    return _make_request(url, token)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


# ---------------------------------------------------------------------------
# Manifest parsing helpers
# ---------------------------------------------------------------------------

def parse_manifest(manifest_path: Path) -> dict:
    try:
        text = manifest_path.read_text(encoding="utf-8")
        return json.loads(text)
    except OSError as exc:
        raise RuntimeError(f"Cannot read manifest: {exc}") from exc
    except json.JSONDecodeError as exc:
        raise RuntimeError(f"Manifest is not valid JSON: {exc}") from exc


def extract_fields(manifest: dict) -> Tuple[str, str, str, str, str, List[dict]]:
    """Return (owner, repo, package_path, default_ref, expected_aggregate, inventory).

    Raises RuntimeError if required fields are missing.
    """
    try:
        repo_slug: str = manifest["canonical_target"]["repository"]
        package_path: str = manifest["canonical_target"]["package_path"]
    except KeyError as exc:
        raise RuntimeError(f"Manifest missing required field: {exc}") from exc

    if "/" not in repo_slug:
        raise RuntimeError(
            f"canonical_target.repository must be in 'owner/repo' format, got: {repo_slug!r}"
        )
    owner, repo = repo_slug.split("/", 1)

    default_ref: str = manifest.get("canonical_target", {}).get(
        "accepted_commit_or_hash", ""
    )
    if not default_ref:
        default_ref = manifest.get("canonical_target", {}).get("branch_commit", "")
    if not default_ref:
        default_ref = "main"

    mirrors: list = manifest.get("mirrors", [])
    expected_aggregate: str = ""
    for mirror in mirrors:
        sha = mirror.get("aggregate_sha256", "")
        if sha:
            expected_aggregate = sha
            break

    inventory: List[dict] = manifest.get("inventory", [])
    if not inventory:
        raise RuntimeError("Manifest 'inventory' list is empty or missing.")

    return owner, repo, package_path, default_ref, expected_aggregate, inventory


# ---------------------------------------------------------------------------
# Core verification logic
# ---------------------------------------------------------------------------

def verify(
    manifest_path: Path,
    ref_override: Optional[str],
    token: Optional[str],
    report_path: Optional[Path],
    verbose: bool = True,
) -> int:
    """Run the full verification and return an exit code (0/1/2)."""

    # 1. Parse manifest
    try:
        manifest = parse_manifest(manifest_path)
        owner, repo, package_path, default_ref, expected_aggregate, inventory = (
            extract_fields(manifest)
        )
    except RuntimeError as exc:
        _emit_fatal(str(exc), report_path)
        return 2

    ref = ref_override if ref_override else default_ref
    skill_name: str = manifest.get("skill", {}).get("name", "<unknown>")

    if verbose:
        print(f"verify_skill_landing: {skill_name}")
        print(f"  repository : {owner}/{repo}")
        print(f"  package    : {package_path}")
        print(f"  ref        : {ref}")
        print(f"  files      : {len(inventory)}")
        if expected_aggregate:
            print(f"  expected aggregate SHA-256: {expected_aggregate[:16]}…")
        print()

    # 2. Fetch every file and compute its SHA-256
    file_results: List[dict] = []
    actual_hashes: Dict[str, str] = {}
    fetch_errors: List[str] = []

    for entry in inventory:
        rel_file: str = entry.get("file", "")
        expected_hash: str = entry.get("sha256", "")
        if not rel_file:
            continue

        remote_path = f"{package_path}/{rel_file}"
        if verbose:
            print(f"  fetching {rel_file} … ", end="", flush=True)

        try:
            content = fetch_file_content(owner, repo, remote_path, ref, token)
            actual = sha256_bytes(content)
            actual_hashes[rel_file] = actual
            matched = actual == expected_hash
            status = "PASS" if matched else "FAIL"
            file_results.append(
                {
                    "file": rel_file,
                    "status": status,
                    "expected_sha256": expected_hash,
                    "actual_sha256": actual,
                    "matched": matched,
                }
            )
            if verbose:
                marker = "✓" if matched else "✗"
                print(f"{marker} {status}")
                if not matched:
                    print(f"      expected: {expected_hash}")
                    print(f"      actual  : {actual}")
        except RuntimeError as exc:
            fetch_errors.append(str(exc))
            file_results.append(
                {
                    "file": rel_file,
                    "status": "ERROR",
                    "expected_sha256": expected_hash,
                    "actual_sha256": None,
                    "matched": False,
                    "error": str(exc),
                }
            )
            if verbose:
                print(f"✗ ERROR — {exc}")
        # Small courtesy delay to avoid hammering the API
        time.sleep(0.05)

    # 3. Aggregate hash check
    actual_aggregate = aggregate_hash(actual_hashes) if actual_hashes else ""
    aggregate_matched = bool(expected_aggregate) and actual_aggregate == expected_aggregate
    aggregate_status = (
        "PASS" if aggregate_matched
        else ("SKIP" if not expected_aggregate else "FAIL")
    )

    if verbose:
        print()
        print(f"  aggregate SHA-256: {actual_aggregate}")
        if expected_aggregate:
            marker = "✓" if aggregate_matched else "✗"
            print(f"  expected         : {expected_aggregate}  {marker} {aggregate_status}")
        else:
            print("  (no expected aggregate in manifest — aggregate check skipped)")

    # 4. Overall result
    all_files_ok = all(r["matched"] for r in file_results)
    aggregate_ok = aggregate_status in ("PASS", "SKIP")
    overall_pass = all_files_ok and aggregate_ok and not fetch_errors

    files_passed = sum(1 for r in file_results if r["matched"])
    files_failed = len(file_results) - files_passed

    if verbose:
        print()
        verdict = "PASS" if overall_pass else "FAIL"
        print(f"  result: {verdict}  ({files_passed}/{len(file_results)} files matched, aggregate {aggregate_status})")
        if fetch_errors:
            print(f"  fetch errors: {len(fetch_errors)}")

    # 5. Build JSON report
    report: dict = {
        "manifest": str(manifest_path.resolve()),
        "skill": skill_name,
        "repository": f"{owner}/{repo}",
        "package_path": package_path,
        "ref": ref,
        "overall": "PASS" if overall_pass else "FAIL",
        "files_checked": len(file_results),
        "files_passed": files_passed,
        "files_failed": files_failed,
        "aggregate": {
            "expected": expected_aggregate or None,
            "actual": actual_aggregate or None,
            "status": aggregate_status,
        },
        "file_results": file_results,
    }
    if fetch_errors:
        report["fetch_errors"] = fetch_errors

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
        # Always emit the JSON report to stdout when no file is specified,
        # but only after the human-readable summary (separated by a blank line).
        if verbose:
            print()
        print(json.dumps(report, indent=2, sort_keys=True))

    return 0 if overall_pass else 1


def _emit_fatal(message: str, report_path: Optional[Path]) -> None:
    report = {"overall": "ERROR", "error": message}
    encoded = json.dumps(report, indent=2, sort_keys=True) + "\n"
    print(f"ERROR: {message}", file=sys.stderr)
    if report_path:
        try:
            report_path.parent.mkdir(parents=True, exist_ok=True)
            report_path.write_text(encoded, encoding="utf-8")
        except OSError:
            pass
    else:
        print(encoded)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "--manifest",
        type=Path,
        required=True,
        metavar="PATH",
        help="Path to the promotion manifest JSON file.",
    )
    parser.add_argument(
        "--ref",
        metavar="COMMIT_OR_REF",
        default=None,
        help=(
            "Git ref to fetch from (commit SHA, branch, or tag). "
            "Defaults to canonical_target.accepted_commit_or_hash in the manifest."
        ),
    )
    parser.add_argument(
        "--report",
        type=Path,
        metavar="PATH",
        default=None,
        help="Write JSON report to this file path (optional).",
    )
    parser.add_argument(
        "--token-env",
        metavar="ENV_VAR",
        default="GITHUB_PAT",
        help=(
            "Name of the environment variable holding the GitHub personal access token. "
            "Default: GITHUB_PAT.  Omit or leave unset for unauthenticated access "
            "(lower rate limit)."
        ),
    )
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Suppress human-readable output; emit only the JSON report.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    token: Optional[str] = os.environ.get(args.token_env) or None
    return verify(
        manifest_path=args.manifest,
        ref_override=args.ref,
        token=token,
        report_path=args.report,
        verbose=not args.quiet,
    )


if __name__ == "__main__":
    sys.exit(main())
