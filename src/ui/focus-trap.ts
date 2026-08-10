/**
 * Modal focus-trap utility.
 *
 * Call `trapFocus(overlay)` immediately after the overlay element is in the
 * DOM.  It:
 *  1. Saves the currently focused element so focus can be restored on close.
 *  2. Moves focus to the first keyboard-reachable descendant (normally the
 *     Close button).
 *  3. Intercepts Tab / Shift+Tab so focus cycles only within the overlay —
 *     background controls are never reached.
 *
 * The returned cleanup function must be called from every close path (button
 * click, Escape key, programmatic close).  It removes the keydown listener
 * and returns focus to the element that was active when the overlay opened.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function trapFocus(overlay: HTMLElement): () => void {
  const returnTarget = document.activeElement as HTMLElement | null;

  /** Live query so dynamically added/removed controls are always included. */
  const getFocusable = (): HTMLElement[] =>
    Array.from(overlay.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));

  // Move focus into the overlay immediately.
  const focusable = getFocusable();
  focusable[0]?.focus();

  const onKeyDown = (e: KeyboardEvent): void => {
    if (e.key !== 'Tab') return;
    const items = getFocusable();
    if (items.length === 0) { e.preventDefault(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey) {
      // Shift+Tab at the first item → wrap to last
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      // Tab at the last item → wrap to first
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  overlay.addEventListener('keydown', onKeyDown);

  return function releaseFocus() {
    overlay.removeEventListener('keydown', onKeyDown);
    returnTarget?.focus();
  };
}
