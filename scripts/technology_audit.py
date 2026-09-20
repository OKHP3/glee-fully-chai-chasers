#!/usr/bin/env python3
"""Inventory repository versions and optionally check official release metadata.

Reads manifests, lockfiles and workflow declarations; never installs/upgrades code.
Only public package names are sent to npm/PyPI. GitHub tokens go only to api.github.com.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import gzip
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time
from urllib.parse import quote, urlparse
from urllib.request import Request, urlopen
from urllib.error import HTTPError

import yaml

ROOT = Path(__file__).resolve().parents[1]
SECTIONS = ('dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies')
STABLE = re.compile(r'^v?(\d+)\.(\d+)\.(\d+)$')


def version_key(value):
    match = STABLE.fullmatch(str(value))
    return tuple(map(int, match.groups())) if match else None


def relation(current, latest):
    if not latest:
        return 'unknown latest'
    a, b = version_key(current), version_key(latest)
    if a is None:
        return 'unresolved or floating'
    if b is None:
        return 'unknown latest'
    if a > b:
        return 'ahead of latest channel; review'
    if a == b:
        return 'current'
    return ('major' if a[0] != b[0] else 'minor' if a[1] != b[1] else 'patch') + ' available'


def files(root):
    output = subprocess.check_output(
        ['git', 'ls-files', '-co', '--exclude-standard', '-z'], cwd=root)
    return sorted(set(p for p in output.decode().split('\0') if p and (root / p).is_file()))


def scope(path):
    if path == 'package.json':
        return 'game build/test'
    if path.startswith(('artifacts/', 'lib/')):
        return 'workspace/showcase/scaffolding'
    return 'contributor/maintenance tooling'


def split_lock_key(key):
    name, version = key.rsplit('@', 1)
    return name, version.split('(')[0]


def inventory(root):
    tracked = files(root)
    rows, inputs, manifests, local_packages = [], {}, [], []

    def read(path):
        raw = (root / path).read_bytes()
        inputs[path] = hashlib.sha256(raw).hexdigest()
        return raw.decode('utf-8-sig')

    lock = yaml.safe_load(read('pnpm-lock.yaml'))
    workspace = yaml.safe_load(read('pnpm-workspace.yaml'))
    lock_versions = {}
    for key in lock.get('packages', {}):
        name, version = split_lock_key(key)
        lock_versions.setdefault(name, set()).add(version)
    direct_names = set()
    for path in tracked:
        if Path(path).name != 'package.json':
            continue
        package = json.loads(read(path))
        manifests.append(path)
        importer = lock.get('importers', {}).get(str(Path(path).parent).replace('\\', '/'), {})
        for section in SECTIONS:
            for name, declared in package.get(section, {}).items():
                if declared.startswith(('workspace:', 'link:', 'file:')):
                    local_packages.append({'name': name, 'path': path, 'declaration': declared})
                    continue
                direct_names.add(name)
                effective = declared
                if declared.startswith('catalog:'):
                    catalog = declared.split(':', 1)[1]
                    mapping = workspace.get('catalogs', {}).get(catalog, {}) if catalog else workspace.get('catalog', {})
                    if name not in mapping:
                        raise ValueError(f'Unresolved catalog {name} in {path}')
                    effective = mapping[name]
                resolved = str(importer.get(section, {}).get(name, {}).get('version', '')).split('(')[0]
                installed_path = root / Path(path).parent / 'node_modules' / name / 'package.json'
                installed = json.loads(installed_path.read_text(encoding='utf-8')).get('version') if installed_path.is_file() else None
                rows.append(dict(ecosystem='npm', name=name, declaration=declared,
                                 effective=effective, current=resolved or None, installed=installed,
                                 path=path, section=section, scope=scope(path)))
        if path == 'package.json':
            manager, value = package['packageManager'].split('@', 1)
            rows.append(dict(ecosystem='npm', name=manager, declaration=value,
                             current=value.split('+')[0], path=path,
                             scope='package manager', section='packageManager'))

    # Include every locked package, including optional native binaries. These are
    # not evidence that a package is bundled or installed on the current host.
    transitive = [dict(ecosystem='npm', name=name, current=v, path='pnpm-lock.yaml',
                       scope='lockfile graph', direct=name in direct_names)
                  for name, versions in sorted(lock_versions.items()) for v in sorted(versions)]
    secondary = []
    for path in tracked:
        if Path(path).name == 'package-lock.json':
            data = json.loads(read(path))
            for location, entry in data.get('packages', {}).items():
                if 'node_modules/' not in location or 'version' not in entry or entry.get('link'):
                    continue
                name = entry.get('name', location.rsplit('node_modules/', 1)[1])
                secondary.append(dict(ecosystem='npm', name=name, current=entry['version'],
                                      path=path, scope='secondary npm lock; not canonical install'))
        if Path(path).name.startswith('requirements') and path.endswith('.txt'):
            for line in read(path).splitlines():
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                match = re.fullmatch(r'([A-Za-z0-9_.-]+)((?:==|>=|~=|<=|>|<|!=)[^ #;]+)?(?:\s*#.*)?', line)
                if not match:
                    raise ValueError(f'Unsupported requirement in {path}: {line}')
                name, spec = match.groups()
                rows.append(dict(ecosystem='pypi', name=name, declaration=spec or '*',
                                 current=spec[2:] if spec and spec.startswith('==') else None,
                                 path=path, scope='contributor/maintenance tooling'))

    runtimes = []
    for path in tracked:
        if not path.startswith('.github/workflows/') or not path.endswith(('.yml', '.yaml')):
            continue
        body = read(path)
        # Parse the structure, not comment examples; preserve exact action refs.
        workflow = yaml.safe_load(body)
        for job in workflow.get('jobs', {}).values():
            if 'runs-on' in job:
                runtimes.append(dict(name='GitHub runner', current=job['runs-on'], path=path))
            for step in job.get('steps', []):
                action = step.get('uses', '')
                if '@' in action and not action.startswith(('./', 'docker://')):
                    name, ref = action.rsplit('@', 1)
                    rows.append(dict(ecosystem='github', name=name, current=ref,
                                     declaration=ref, path=path, scope='CI/deployment'))
                for key, value in step.get('with', {}).items():
                    if key in ('node-version', 'python-version', 'node-version-file', 'python-version-file'):
                        runtimes.append(dict(name=key, current=str(value), path=path))
                for name, value in re.findall(r'\b([A-Za-z][A-Za-z0-9_.-]+)==([0-9][^\s"\x27]+)', step.get('run', '')):
                    rows.append(dict(ecosystem='pypi', name=name, declaration='=='+value,
                                     current=value, path=path, scope='CI inline install'))
    for path in ('.replit', '.node-version', '.python-version', 'tsconfig.base.json', 'vite.config.ts', 'lib/api-spec/openapi.yaml'):
        if (root / path).is_file():
            body = read(path)
            if path == '.replit':
                import tomllib
                runtimes.append(dict(name='Replit modules', current=tomllib.loads(body).get('modules', []), path=path))
            elif path in ('.node-version', '.python-version'):
                runtimes.append(dict(name=path, current=body.strip(), path=path))
    return dict(rows=rows, locked=transitive, secondaryLocked=secondary,
                runtimeDeclarations=runtimes, manifestFiles=manifests,
                localWorkspaceLinks=local_packages, inputSha256=inputs,
                overrides=workspace.get('overrides', {}), catalogs=workspace.get('catalog', {}))


def request(url, as_json=True):
    headers = {'User-Agent': 'chai-chasers-technology-audit', 'Accept': 'application/json' if as_json else 'text/html'}
    if urlparse(url).hostname == 'api.github.com' and os.environ.get('GH_TOKEN'):
        headers['Authorization'] = 'Bearer ' + os.environ['GH_TOKEN']
    for attempt in range(3):
        try:
            with urlopen(Request(url, headers=headers), timeout=25) as response:
                raw = response.read()
                if raw.startswith(b'\x1f\x8b'):
                    raw = gzip.decompress(raw)
                body = raw.decode('utf-8')
            return json.loads(body) if as_json else body
        except Exception as exc:
            if attempt == 2:
                raise
            delay = attempt + 1
            if isinstance(exc, HTTPError) and exc.code == 429:
                retry_after = exc.headers.get('Retry-After', '30')
                delay = min(60, max(5, int(retry_after))) if retry_after.isdigit() else 30
            time.sleep(delay)


def latest_release(item):
    ecosystem, name = item
    url = ''
    try:
        if ecosystem == 'npm':
            url = 'https://registry.npmjs.org/' + quote(name, safe='') + '/latest'
            data = request(url)
            version = data['version']
            extra = {'engines': data.get('engines', {}), 'deprecated': data.get('deprecated')}
            if not version_key(version):
                channel = version
                url = 'https://registry.npmjs.org/' + quote(name, safe='')
                versions = request(url)['versions']
                candidates = [v for v in versions if version_key(v)]
                if not candidates:
                    return (ecosystem, name), dict(latest=None, source=url,
                                                  latestChannel=channel, noStableRelease=True)
                version = max(candidates, key=version_key)
                extra = {'latestChannel': channel, 'engines': versions[version].get('engines', {})}
        elif ecosystem == 'pypi':
            url = 'https://pypi.org/pypi/' + quote(name, safe='') + '/json'
            data = request(url)
            candidates = [v for v, distributions in data['releases'].items()
                          if version_key(v) and any(not d.get('yanked') for d in distributions)]
            version = max(candidates, key=version_key)
            extra = {'requiresPython': data['info'].get('requires_python')}
        else:
            url = 'https://api.github.com/repos/' + name + '/releases/latest'
            data = request(url)
            if data.get('draft') or data.get('prerelease'):
                raise ValueError('Latest release is not stable')
            version = data['tag_name']
            extra = {'releaseUrl': data['html_url'], 'publishedAt': data.get('published_at')}
        if not version_key(version):
            raise ValueError(f'Latest channel is not a stable numeric release: {version}')
        return (ecosystem, name), dict(latest=version, source=url, **extra)
    except Exception as exc:
        return (ecosystem, name), dict(latest=None, source=url, error=str(exc))


def external_runtimes():
    result = []
    for name, url in [('Node.js', 'https://nodejs.org/dist/index.json'),
                      ('Python', 'https://www.python.org/downloads/')]:
        try:
            if name == 'Node.js':
                releases = request(url)
                stable = [r for r in releases if version_key(r['version'])]
                newest = max(stable, key=lambda r: version_key(r['version']))
                lts = max((r for r in stable if r['lts']), key=lambda r: version_key(r['version']))
                result.append(dict(name=name, latest=newest['version'], latestLts=lts['version'], source=url))
            else:
                body = request(url, as_json=False)
                releases = re.findall(r'>\s*(?:Download\s+)?Python (\d+\.\d+\.\d+)\s*</a>', body)
                result.append(dict(name=name, latest=max(releases, key=version_key), source=url))
        except Exception as exc:
            result.append(dict(name=name, latest=None, source=url, error=str(exc)))
    return result


def render(report):
    def cell(value):
        if isinstance(value, str) and value.startswith('https://'):
            return '[source](' + value + ')'
        return str(value if value is not None else 'unknown / not locked').replace('|', '\\|').replace('\n', ' ')

    def table(rows, columns):
        lines = ['| ' + ' | '.join(label for label, _ in columns) + ' |',
                 '| ' + ' | '.join('---' for _ in columns) + ' |']
        for row in rows:
            lines.append('| ' + ' | '.join(cell(row.get(key)) for _, key in columns) + ' |')
        return '\n'.join(lines)

    lines = ['# Generated technology inventory', '',
             f"Checked (UTC): {report['checkedAt']}. Source HEAD: `{report['sourceHead']}`.", '',
             'Generated by `python scripts/technology_audit.py --online --output docs/technology/latest`. '
             'Input SHA-256 values and exact package locations are retained in the companion JSON. '
             'This snapshot includes working-tree input bytes; HEAD alone does not identify uncommitted inputs.', '',
             'Current means the committed lockfile resolution or exact declaration, not a claim about '
             'the deployed bundle. Ranges, hosted services, missing installations and moving Action tags '
             'are not fabricated exact versions. npm latest is the publisher-designated stable channel; '
             'prereleases are rejected. See [the maintenance plan](../TECHNOLOGY-MAINTENANCE.md) '
             'for browser standards, non-package tools, compatibility holds and activation status.', '',
             f"Coverage: {len(report['rows'])} dependency declarations; {len(report['locked'])} "
             f"pnpm package/version entries; {len(report['secondaryLocked'])} secondary npm entries. "
             f"Release lookup errors: {report['lookupErrors']}.", '', '## Direct dependencies and automation', '']
    columns = [('Technology', 'name'), ('Declared', 'declaration'), ('Catalog range', 'effective'),
               ('Current exact / ref', 'current'), ('Latest stable', 'latest'), ('Assessment', 'status'),
               ('Scope', 'scope'), ('Evidence', 'path'), ('Release source', 'source')]
    lines.append(table(report['rows'], columns))
    lines += ['', '## Runtime declarations', '', table(report['runtimeDeclarations'],
              [('Runtime', 'name'), ('Configured value', 'current'), ('Evidence', 'path')]), '',
              '## Official runtime releases', '', table(report.get('runtimeReleases', []),
              [('Runtime', 'name'), ('Latest stable', 'latest'), ('Latest LTS', 'latestLts'), ('Source', 'source')])]
    for title, key in [('Complete pnpm lock graph', 'locked'), ('Secondary npm lock graph (not used by pnpm CI)', 'secondaryLocked')]:
        lines += ['', '<details>', f'<summary>{title}</summary>', '', table(report[key],
                  [('Package', 'name'), ('Locked', 'current'), ('Latest stable', 'latest'),
                   ('Assessment', 'status'), ('Release source', 'source')]), '', '</details>']
    errors = [r for r in report['releases'] if r.get('error')] + [r for r in report.get('runtimeReleases', []) if r.get('error')]
    if errors:
        lines += ['', '## Incomplete external verification', '', table(errors,
                  [('Technology', 'name'), ('Error', 'error'), ('Source', 'source')])]
    return '\n'.join(lines) + '\n'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--online', action='store_true')
    parser.add_argument('--output', default='.local/technology-audit/latest', help='Output prefix for .json and .md')
    parser.add_argument('--reuse-releases', help='Reuse successful lookups from a report under 24 hours old; preserves their retrieval times')
    args = parser.parse_args()
    report = inventory(ROOT)
    report.update(schemaVersion='1.0',
                  generatorSha256=hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
                  checkedAt=datetime.now(timezone.utc).isoformat(),
                  sourceHead=subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip())
    all_rows = report['rows'] + report['locked'] + report['secondaryLocked']
    # Monitor the documentation renderer even if no installed Mermaid package exists.
    targets = sorted({(r['ecosystem'], r['name']) for r in all_rows} | {('npm', 'mermaid'), ('npm', 'npm')})
    releases = {}
    if args.online:
        if args.reuse_releases:
            cached = json.loads((ROOT / args.reuse_releases).read_text(encoding='utf-8'))
            for row in cached['releases']:
                retrieved = row.get('retrievedAt', cached['checkedAt'])
                age = (datetime.now(timezone.utc) - datetime.fromisoformat(retrieved)).total_seconds()
                if 0 <= age < 86400 and not row.get('error'):
                    releases[(row['ecosystem'], row['name'])] = {
                        k: v for k, v in dict(row, retrievedAt=retrieved).items() if k not in ('ecosystem', 'name')}
        pending = [t for t in targets if t not in releases]
        with ThreadPoolExecutor(max_workers=4) as executor:
            for key, value in executor.map(latest_release, pending):
                releases[key] = dict(value, retrievedAt=datetime.now(timezone.utc).isoformat())
        releases = {key: value for key, value in releases.items() if key in targets}
        report['runtimeReleases'] = external_runtimes()
    report['releases'] = [dict(ecosystem=k[0], name=k[1], **v) for k, v in sorted(releases.items())]
    report['lookupErrors'] = sum(bool(r.get('error')) for r in report['releases'] + report.get('runtimeReleases', []))
    for row in all_rows:
        row.update(releases.get((row['ecosystem'], row['name']), {}))
        row['status'] = ('no stable release published' if row.get('noStableRelease')
                         else relation(row.get('current'), row.get('latest')))
    output = ROOT / args.output
    output.parent.mkdir(parents=True, exist_ok=True)
    output.with_suffix('.json').write_text(json.dumps(report, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    output.with_suffix('.md').write_text(render(report), encoding='utf-8')
    print(f"Wrote {len(report['rows'])} declarations, {len(report['locked'])} pnpm entries, "
          f"{len(report['secondaryLocked'])} npm entries; {len(releases)} release lookups; {report['lookupErrors']} errors.")
    return 1 if report['lookupErrors'] else 0


if __name__ == '__main__':
    sys.exit(main())
