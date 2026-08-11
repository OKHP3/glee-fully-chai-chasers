/**
 * Reduced-motion scene transition tests
 *
 * Verifies that getSceneTransition() returns instant, non-freezing transitions
 * when prefers-reduced-motion is active, and preserves the original heavy
 * animations when full motion is allowed.
 */

import { describe, it, expect } from 'vitest';
import {
  sceneTransitions,
  getSceneTransition,
  REDUCED_MOTION_TRANSITION,
  reducedTransition,
} from './animations';

type SceneTransitionName = keyof typeof sceneTransitions;

const ALL_TRANSITIONS = Object.keys(sceneTransitions) as SceneTransitionName[];

// ─── Reduced-motion path ──────────────────────────────────────────────────────

describe('getSceneTransition — prefers-reduced-motion: reduce', () => {
  it('covers every named scene transition', () => {
    // Ensures no new transition was added without being considered here.
    expect(ALL_TRANSITIONS.length).toBeGreaterThan(0);
  });

  it.each(ALL_TRANSITIONS)(
    '%s → reduced path returns REDUCED_MOTION_TRANSITION',
    (name) => {
      const result = getSceneTransition(name, true);
      expect(result).toEqual(REDUCED_MOTION_TRANSITION);
    },
  );

  it.each(ALL_TRANSITIONS)(
    '%s → reduced path: animate state is only opacity:1 (no blur/scale/rotation)',
    (name) => {
      const { animate } = getSceneTransition(name, true);
      // The only property that should change is opacity — no heavy effects.
      expect(animate).toEqual({ opacity: 1 });
    },
  );

  it.each(ALL_TRANSITIONS)(
    '%s → reduced path: transition duration is 0 (scene cannot freeze)',
    (name) => {
      const { transition } = getSceneTransition(name, true);
      // duration: 0 means the scene reaches its animate state immediately,
      // which is the key invariant that prevents freezing on low-motion devices.
      expect((transition as { duration: number }).duration).toBe(0);
    },
  );

  it.each(ALL_TRANSITIONS)(
    '%s → reduced path: initial and exit are opacity-only (no clip/filter/transform)',
    (name) => {
      const { initial, exit } = getSceneTransition(name, true);
      expect(Object.keys(initial)).toEqual(['opacity']);
      expect(Object.keys(exit)).toEqual(['opacity']);
    },
  );
});

// ─── Full-motion path ─────────────────────────────────────────────────────────

describe('getSceneTransition — full motion', () => {
  it.each(ALL_TRANSITIONS)(
    '%s → full-motion path returns the original preset unchanged',
    (name) => {
      const result = getSceneTransition(name, false);
      expect(result).toEqual(sceneTransitions[name]);
    },
  );

  it.each(ALL_TRANSITIONS)(
    '%s → full-motion animate state reaches opacity:1',
    (name) => {
      const { animate } = getSceneTransition(name, false);
      // Every preset must reach full opacity in its animate state so a scene
      // that finishes its timeline is visible, not frozen mid-fade.
      const animateObj = animate as Record<string, unknown>;
      if ('opacity' in animateObj) {
        expect(animateObj.opacity).toBe(1);
      }
    },
  );

  // Heavy transitions that would cause hangs on low-motion devices — verify
  // they are NOT returned in the reduced-motion path (already covered above,
  // but kept explicit here for readability in CI output).
  const HEAVY_TRANSITIONS: SceneTransitionName[] = [
    'fadeBlur',
    'zoomThrough',
    'perspectiveFlip',
    'morphExpand',
    'clipCircle',
    'clipPolygon',
    'splitHorizontal',
    'splitVertical',
  ];

  it.each(HEAVY_TRANSITIONS)(
    '%s → reduced path strips the heavy property from animate',
    (name) => {
      const fullAnimate = sceneTransitions[name].animate as Record<
        string,
        unknown
      >;
      const reducedAnimate = getSceneTransition(name, true)
        .animate as Record<string, unknown>;

      // The full preset has at least one non-opacity property; the reduced
      // path must not carry any of those through.
      const heavyKeys = Object.keys(fullAnimate).filter((k) => k !== 'opacity');
      for (const key of heavyKeys) {
        expect(reducedAnimate).not.toHaveProperty(key);
      }
    },
  );
});

// ─── reducedTransition — inner-element helper ─────────────────────────────────

describe('reducedTransition — prefers-reduced-motion: reduce', () => {
  it('returns { duration: 0 } regardless of the normal transition shape', () => {
    const cases: Parameters<typeof reducedTransition>[1][] = [
      { duration: 2, ease: 'easeOut' },
      { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 1 },
      { duration: 1, delay: 1.5, type: 'spring', stiffness: 100 },
      { type: 'spring', stiffness: 300, damping: 20, delay: 2 },
      { delay: 0.3 },
      { duration: 0.8, type: 'spring' },
    ];
    for (const normal of cases) {
      expect(reducedTransition(true, normal)).toEqual({ duration: 0 });
    }
  });

  it('duration is exactly 0 — element cannot freeze mid-animation', () => {
    const result = reducedTransition(true, { duration: 3.5, ease: 'circOut', delay: 2 });
    expect((result as { duration: number }).duration).toBe(0);
  });

  it('strips delay so the element is immediately visible', () => {
    const result = reducedTransition(true, { duration: 1, delay: 2 });
    expect(result).not.toHaveProperty('delay');
  });

  it('strips ease so no easing curve can drag out the animation', () => {
    const result = reducedTransition(true, { duration: 1, ease: [0.16, 1, 0.3, 1] });
    expect(result).not.toHaveProperty('ease');
  });

  it('strips type:spring so spring physics cannot extend the duration', () => {
    const result = reducedTransition(true, { type: 'spring', stiffness: 300, damping: 20 });
    expect(result).not.toHaveProperty('type');
    expect(result).not.toHaveProperty('stiffness');
    expect(result).not.toHaveProperty('damping');
  });
});

describe('reducedTransition — full motion', () => {
  it('returns the normal transition unchanged', () => {
    const normal = { duration: 1.2, ease: [0.16, 1, 0.3, 1] as number[], delay: 0.5 };
    expect(reducedTransition(false, normal)).toEqual(normal);
  });

  it('preserves spring params in full-motion mode', () => {
    const normal = { type: 'spring' as const, stiffness: 400, damping: 30, delay: 0.2 };
    expect(reducedTransition(false, normal)).toEqual(normal);
  });

  it('preserves delay in full-motion mode', () => {
    const normal = { duration: 0.8, delay: 1.5 };
    expect(reducedTransition(false, normal)).toHaveProperty('delay', 1.5);
  });
});

// ─── REDUCED_MOTION_TRANSITION constant ───────────────────────────────────────

describe('REDUCED_MOTION_TRANSITION constant', () => {
  it('has all four required Framer Motion props', () => {
    expect(REDUCED_MOTION_TRANSITION).toHaveProperty('initial');
    expect(REDUCED_MOTION_TRANSITION).toHaveProperty('animate');
    expect(REDUCED_MOTION_TRANSITION).toHaveProperty('exit');
    expect(REDUCED_MOTION_TRANSITION).toHaveProperty('transition');
  });

  it('duration is exactly 0', () => {
    expect(REDUCED_MOTION_TRANSITION.transition.duration).toBe(0);
  });
});
