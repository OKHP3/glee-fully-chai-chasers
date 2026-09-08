"""Offline YAML-decoded dispatch/receiver checks; requires PyYAML 6.0.3."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

import yaml


ROOT = Path(__file__).resolve().parents[3]
HANDOFF = ROOT / 'skills/promotion-handoff'


class DispatchContractTests(unittest.TestCase):
    def setUp(self):
        self.receiver = yaml.load(
            (ROOT / '.github/workflows/verify-skill-landing.yml').read_text(),
            Loader=yaml.BaseLoader)
        self.steps = self.receiver['jobs']['verify']['steps']
        self.resolve = next(step for step in self.steps if step.get('id') == 'resolve')

    def test_template_declares_json_and_remains_explicit_only(self):
        producer = yaml.load((HANDOFF / 'okhp3-skillz-verify-landing.yml').read_text(),
                             Loader=yaml.BaseLoader)
        self.assertEqual(set(producer['on']), {'workflow_dispatch'})
        step = next(step for step in producer['jobs']['dispatch-verify']['steps']
                    if step.get('name') ==
                    'Dispatch repository_dispatch to glee-fully-chai-chasers')
        self.assertIn('--header "Content-Type: application/json"', step['run'])
        self.assertIn('^[0-9a-f]{40}$', step['run'])
        self.assertEqual(step['env']['PROMOTION_SHA'], '${{ inputs.commit_sha }}')

    def test_ci_enforces_offline_suite_on_prs_and_main(self):
        ci = yaml.load((ROOT / '.github/workflows/ci.yml').read_text(),
                       Loader=yaml.BaseLoader)
        self.assertIn('pull_request', ci['on'])
        self.assertIn('main', ci['on']['push']['branches'])
        # Existing CI is unfiltered: template, tests, receiver and CI edits all run.
        for event in ['pull_request', 'push']:
            self.assertNotIn('paths', ci['on'][event] or {})
            self.assertNotIn('paths-ignore', ci['on'][event] or {})
        job = ci['jobs']['landing-dispatch-contract']
        self.assertNotIn('if', job)
        self.assertNotIn('continue-on-error', job)
        steps = job['steps']
        for step in steps:
            self.assertNotIn('if', step)
            self.assertNotIn('continue-on-error', step)
            if 'uses' in step:
                self.assertRegex(step['uses'], r'^actions/[^@]+@[0-9a-f]{40}$')
        commands = [step['run'] for step in steps if 'run' in step]
        self.assertIn('python -m pip install --disable-pip-version-check PyYAML==6.0.3',
                      commands)
        self.assertIn('python -B -m unittest discover -s skills/promotion-handoff/tests -v',
                      commands)

    def run_resolver(self, recorded_sha):
        script = self.resolve['run']
        self.assertIn('\nPYEOF\n', script, 'YAML must strip heredoc indentation')
        for expression, value in {
            '${{ github.event_name }}': 'repository_dispatch',
            '${{ github.event.client_payload.commit_sha }}': 'a' * 40,
            '${{ inputs.commit_sha }}': '', '${{ inputs.manifest }}': '',
        }.items():
            script = script.replace(expression, value)
        self.assertNotIn('${{', script)
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            manifests = root / 'skills/promotion-handoff'
            manifests.mkdir(parents=True)
            (manifests / 'promotion-manifest-test.json').write_text(json.dumps({
                'canonical_target': {'accepted_commit_or_hash': recorded_sha}}))
            output = root / 'output'
            env = {'PATH': str(Path(sys.executable).parent) + os.pathsep + '/usr/bin:/bin',
                   'GITHUB_OUTPUT': str(output)}
            result = subprocess.run(['/bin/bash', '-c', script], cwd=root, env=env,
                                    capture_output=True, text=True, timeout=10)
            self.assertEqual(result.returncode, 0, result.stderr)
            return output.read_text()

    def test_decoded_heredoc_matches_recorded_commit(self):
        output = self.run_resolver('a' * 40)
        self.assertIn('no_match_is_failure=false', output)
        self.assertIn('promotion-manifest-test.json', output)

    def test_missing_manifest_still_reaches_hard_failure(self):
        output = self.run_resolver('b' * 40)
        self.assertIn('no_match_is_failure=true', output)
        failure = next(step for step in self.steps if step.get('if') ==
                       "steps.resolve.outputs.no_match_is_failure == 'true'")
        script = failure['run'].replace('${{ steps.resolve.outputs.skillz_sha }}', 'a' * 40)
        self.assertNotIn('${{', script)
        with tempfile.TemporaryDirectory() as folder:
            result = subprocess.run(['/bin/bash', '-c', script],
                                    env={'PATH': '/usr/bin:/bin',
                                         'GITHUB_STEP_SUMMARY': str(Path(folder) / 'summary')},
                                    capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 1)


if __name__ == '__main__':
    unittest.main()
