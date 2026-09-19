import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

import yaml

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('technology_audit', ROOT / 'scripts/technology_audit.py')
audit = importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)


class VersionTests(unittest.TestCase):
    def test_numeric_order_and_breaking_versions(self):
        self.assertEqual(audit.relation('7.3.6', '8.3.0'), 'major available')
        self.assertEqual(audit.relation('4.23.1', '4.23.13'), 'patch available')
        self.assertEqual(audit.relation('1.9.0', '1.10.0'), 'minor available')

    def test_missing_floating_and_prerelease_are_not_current(self):
        self.assertEqual(audit.relation(None, '1.0.0'), 'unresolved or floating')
        self.assertEqual(audit.relation('v7', 'v7.0.1'), 'unresolved or floating')
        self.assertEqual(audit.relation('1.0.0', None), 'unknown latest')
        self.assertIsNone(audit.version_key('1.0.0-rc.1'))

    def test_latest_channel_is_not_maximum_prerelease(self):
        with patch.object(audit, 'request', return_value={'version': '2.0.0', 'engines': {'node': '>=24'}}):
            _, result = audit.latest_release(('npm', 'example'))
        self.assertEqual(result['latest'], '2.0.0')
        self.assertEqual(result['engines'], {'node': '>=24'})

    def test_prerelease_channel_falls_back_to_stable(self):
        with patch.object(audit, 'request', side_effect=[{'version': '4.4.0-0'},
                          {'versions': {'4.3.0': {}, '4.4.0-0': {}, '5.0.0-beta.1': {}}}]):
            _, result = audit.latest_release(('npm', 'example'))
        self.assertEqual(result['latest'], '4.3.0')

    def test_prerelease_only_package_is_explicitly_unavailable(self):
        with patch.object(audit, 'request', side_effect=[{'version': '1.0.0-beta.2'},
                          {'versions': {'1.0.0-beta.2': {}}}]):
            _, result = audit.latest_release(('npm', 'example'))
        self.assertTrue(result['noStableRelease'])
        self.assertIsNone(result['latest'])
        self.assertNotIn('error', result)

    def test_yanked_python_releases_are_excluded(self):
        with patch.object(audit, 'request', return_value={'info': {}, 'releases': {
            '2.0.0': [{'yanked': True}], '1.9.1': [{'yanked': False}],
            '3.0.0rc1': [{'yanked': False}], '1.9.2': []}}):
            _, result = audit.latest_release(('pypi', 'example'))
        self.assertEqual(result['latest'], '1.9.1')

    def test_registry_failure_is_unknown_not_current(self):
        with patch.object(audit, 'request', side_effect=OSError('registry unavailable')):
            _, result = audit.latest_release(('npm', 'example'))
        self.assertIsNone(result['latest'])
        self.assertIn('registry unavailable', result['error'])


class InventoryTests(unittest.TestCase):
    def test_catalog_lock_optional_graph_and_unlocked_python(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            data = {
                'package.json': json.dumps({'packageManager': 'pnpm@10.26.1',
                    'devDependencies': {'vite': 'catalog:', 'local': 'workspace:*'}}),
                'pnpm-workspace.yaml': 'catalog:\n  vite: ^7.3.2\n',
                'pnpm-lock.yaml': "lockfileVersion: '9.0'\nimporters:\n  .:\n    devDependencies:\n      vite:\n        version: 7.3.6(peer@1.0.0)\npackages:\n  vite@7.3.6: {}\n  '@native/win@1.2.3': {}\n",
                'scripts/requirements.txt': 'Pillow>=10.0.0\nPyYAML==6.0.3\n',
                '.github/workflows/test.yml': 'jobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v7\n',
                'demo/package-lock.json': json.dumps({'packages': {'node_modules/extra': {'version': '2.3.4'}}}),
            }
            for name, body in data.items():
                path = root / name
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(body)
            with patch.object(audit, 'files', return_value=sorted(data)):
                report = audit.inventory(root)
            vite = next(r for r in report['rows'] if r['name'] == 'vite')
            self.assertEqual(vite['effective'], '^7.3.2')
            self.assertEqual(vite['current'], '7.3.6')
            self.assertEqual(report['localWorkspaceLinks'][0]['name'], 'local')
            self.assertIsNone(next(r for r in report['rows'] if r['name'] == 'Pillow')['current'])
            self.assertIn('@native/win', [r['name'] for r in report['locked']])
            self.assertEqual(report['secondaryLocked'][0]['name'], 'extra')
            self.assertEqual(len(report['inputSha256']), len(data))


class MaintenanceContractTests(unittest.TestCase):
    def test_pnpm_has_one_pin_and_consumers_use_version_files(self):
        package = json.loads((ROOT / 'package.json').read_text(encoding='utf-8'))
        self.assertRegex(package['packageManager'], r'^pnpm@\d+\.\d+\.\d+')
        for path in (ROOT / '.github/workflows').glob('*.yml'):
            workflow = yaml.safe_load(path.read_text(encoding='utf-8'))
            for job in workflow.get('jobs', {}).values():
                for step in job.get('steps', []):
                    if step.get('uses', '').startswith('pnpm/action-setup@'):
                        self.assertNotIn('version', step.get('with', {}), str(path))
                    if step.get('uses', '').startswith('actions/setup-node@'):
                        self.assertEqual(step['with']['node-version-file'], '.node-version')
                        self.assertTrue(step['with']['check-latest'])

    def test_dependabot_scopes_and_schedules(self):
        config = yaml.safe_load((ROOT / '.github/dependabot.yml').read_text(encoding='utf-8'))
        updates = {u['package-ecosystem']: u for u in config['updates']}
        self.assertEqual(set(updates), {'npm', 'pip', 'github-actions'})
        self.assertEqual(updates['npm']['directory'], '/')
        self.assertEqual(set(updates['pip']['directories']), {'/scripts', '/.github/skills/heic-image-convert'})
        for value in updates.values():
            self.assertIn(value['schedule'].get('day', 'monday'),
                          ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])
        workspace = yaml.safe_load((ROOT / 'pnpm-workspace.yaml').read_text(encoding='utf-8'))
        self.assertGreaterEqual(workspace['minimumReleaseAge'], 1440)
        self.assertGreaterEqual(updates['npm']['cooldown']['default-days'], 1)

    def test_audit_has_no_write_permissions_or_privileged_pr_event(self):
        workflow = yaml.safe_load((ROOT / '.github/workflows/technology-audit.yml').read_text(encoding='utf-8'))
        # PyYAML's YAML 1.1 loader parses unquoted `on` as True.
        events = workflow.get('on', workflow.get(True))
        self.assertIn('schedule', events)
        self.assertNotIn('pull_request_target', events)
        self.assertEqual(workflow['permissions'], {'contents': 'read'})
        self.assertFalse((ROOT / '.github/workflows/dependabot-automerge.yml').exists())


if __name__ == '__main__':
    unittest.main()
