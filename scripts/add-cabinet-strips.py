#!/usr/bin/env python3
"""
Task #80: Add cabinet-msg strips and ⓘ button to all design-canvas scene files.
Run from workspace root: python3 scripts/add-cabinet-strips.py
"""
import os, re

SCENES_DIR = "artifacts/mockup-sandbox/public/scenes"
SKIP = {"game-base.html", "ice-notes.html", "splash-birthday.html", "splash-standard.html"}

# ── Chrome buttons (exact SVG from game-base.html) ────────────────────────────
INFO_BTN = (
    '<button class="chrome-btn" aria-label="More information">'
    '<svg viewBox="0 0 24 24" style="width:20px;height:20px" fill="none" stroke="#f5d576" stroke-width="1.8">'
    '<circle cx="12" cy="12" r="9"/>'
    '<line x1="12" y1="8" x2="12" y2="8.5" stroke-linecap="round" stroke-width="2.2"/>'
    '<line x1="12" y1="11.5" x2="12" y2="17" stroke-linecap="round"/>'
    '</svg></button>'
)
BOOK_BTN = (
    '<button class="chrome-btn" aria-label="Open symbol guide and game rules" title="Symbol guide">'
    '<svg viewBox="0 0 24 24" style="width:20px;height:20px" fill="none" stroke="#f5d576" stroke-width="1.8">'
    '<path d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 0 5 23z"/>'
    '<path d="M5 4.5v15M9 8h6M9 12h6"/>'
    '</svg></button>'
)
GEAR_BTN = (
    '<button class="chrome-btn" aria-label="Settings">'
    '<svg viewBox="0 0 24 24" style="width:20px;height:20px" fill="none" stroke="#f5d576" stroke-width="1.8">'
    '<circle cx="12" cy="12" r="3.2"/>'
    '<path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.07-.4.1-.8.1-1.2z"/>'
    '</svg></button>'
)

# ── Per-scene copy (top_mode_label, bottom_state_copy) ────────────────────────
COPY = {
    "board-askjamie-bubble":           ("Base game",                      "✦ AskJamie daily bonus ready"),
    "bold-chai-free-spins":            ("Free Spins · 8 remaining",       "✦ Spin 5 of 12 · Round win: 840 coins"),
    "bold-chai-pump":                  ("Free Spins · Bold Chai",         "✦ Chai Pump wild — reel 3 charged"),
    "bonus-summary":                   ("Bonus complete · Lvl 4",         "✦ Session win: 14,250 coins"),
    "cascade-beam-up":                 ("Base game · Lvl 4",              "✦ Cascade beam rising!"),
    "cascade-initial-pop":             ("Base game · Lvl 4",              "✦ First cascade pop"),
    "cascade-payline-guide-off":       ("Base game · Lvl 4",              "✦ Payline guide hidden"),
    "cascade-payline-guide-on":        ("Base game · Lvl 4",              "✦ 40 paylines shown"),
    "cascade-resting-board":           ("Base game · Lvl 4",              "✦ Ready to chase · Balance: 12,480 coins"),
    "cascade-staggered-drop":          ("Base game · Lvl 4",              "✦ Symbols dropping in"),
    "cascade-win-highlight":           ("Base game · Lvl 4",              "✦ +640 coins · 3-symbol match"),
    "cat-popin-joey-fed":              ("Base game · Lvl 4",              "✦ Joey has arrived! · Fed today ✓"),
    "cat-popin-joey-unfed":            ("Base game · Lvl 4",              "✦ Joey has arrived! · Treat him?"),
    "cat-popin-phoebe-fed":            ("Base game · Lvl 4",              "✦ Phoebe has arrived! · Fed today ✓"),
    "cat-popin-phoebe-unfed":          ("Base game · Lvl 4",              "✦ Phoebe has arrived! · Treat her?"),
    "cat-visit-joey":                  ("Base game · Lvl 4",              "✦ Joey is visiting!"),
    "cat-visit-phoebe":                ("Base game · Lvl 4",              "✦ Phoebe is visiting!"),
    "chai-storm-splash":               ("Chai Storm · Wild Rain",         "✦ 3× wilds incoming!"),
    "doorbell-panic-free-spins":       ("Free Spins · Doorbell Panic",    "✦ Doorbell! Wilds scatter to reel 3"),
    "doorbell-panic":                  ("Base game · Lvl 4",              "✦ DOORBELL! Joey &amp; Phoebe fled!"),
    "free-spin-board":                 ("Free Spins · 8 remaining",       "✦ Free spin board — awaiting spin"),
    "free-spins-session":              ("Free Spins · 8 remaining",       "✦ Spin 5 of 12 · Round win: 840 coins"),
    "iced-chai-wild-rain-board":       ("Chai Storm · Wild Rain active",  "✦ Wild rain landing on the board"),
    "joey-laundry-combined-strike":    ("Joey's Laundry · Bonus active",  "✦ Paw strike + sock drop combo!"),
    "joey-laundry":                    ("Joey's Laundry · Bonus active",  "✦ Joey's laundry round in play"),
    "joey-laundry-paw-strike":         ("Joey's Laundry · Bonus active",  "✦ Paw strike — wild incoming!"),
    "joey-laundry-sock-drop":          ("Joey's Laundry · Bonus active",  "✦ Sock drop — reel disrupted"),
    "keepsake-constellation":          ("Moonlit Keepsake · Active",      "✦ Constellation piece collected"),
    "keepsake-memory-failed":          ("Moonlit Keepsake · Active",      "✦ Memory failed — trail resets"),
    "keepsake-memory":                 ("Moonlit Keepsake · Active",      "✦ Memory match in progress"),
    "lap-quest-ledge-exit-inactivity": ("Lap Quest · Bonus active",       "✦ Inactivity exit — quest ends"),
    "lap-quest-ledge-exit-joey":       ("Lap Quest · Bonus active",       "✦ Joey retreats — quest complete"),
    "lap-quest-ledge":                 ("Lap Quest · Bonus active",       "✦ Joey on the ledge"),
    "lap-quest-reveal":                ("Lap Quest · Bonus active",       "✦ Quest reveal — prize incoming"),
    "lap-quest-round-play":            ("Lap Quest · Bonus active",       "✦ Lap Quest round in play"),
    "levelup-overlay":                 ("Level Up! · Lvl 5 unlocked",     "✦ +50 Sparks bonus awarded"),
    "paytable-page":                   ("Base game · Lvl 4",              "✦ Symbol guide open"),
    "phoebe-lap-quest":                ("Lap Quest · Bonus active",       "✦ Phoebe joins the quest!"),
    "settings-about":                  ("Base game · Lvl 4",              "✦ Settings open"),
    "settings-look-and-feel":          ("Base game · Lvl 4",              "✦ Settings open"),
    "settings-page":                   ("Base game · Lvl 4",              "✦ Settings open"),
    "settings-payline-guide":          ("Base game · Lvl 4",              "✦ Settings open"),
    "settings-reduce-motion":          ("Base game · Lvl 4",              "✦ Settings open"),
    "settings-sound":                  ("Base game · Lvl 4",              "✦ Settings open"),
    "settings-start-fresh":            ("Base game · Lvl 4",              "✦ Settings open"),
    "spin-wheel":                      ("Treat Time · Spin the wheel",    "✦ Wheel is ready — tap to spin"),
    "standard-free-spins":             ("Free Spins · 8 remaining",       "✦ Spin 5 of 12 · Round win: 840 coins"),
    "treat-jar-free-spins":            ("Treat Jar · Free Spins",         "✦ Treat jar triggered free spins"),
    "treat-time-entry-morning":        ("Treat Time · Morning",           "✦ Your morning treat is waiting"),
    "treat-time-entry-nighttime":      ("Treat Time · Nighttime",         "✦ Nighttime spread is ready"),
    "treat-time":                      ("Treat Time · Daily bonus",       "✦ Your daily treat is waiting"),
    "treat-time-main-board":           ("Treat Time · Daily bonus",       "✦ Treat toss in progress"),
    "uniglee-act-keepsake-collection": ("UniGlee Marathon · Active",      "✦ Keepsake collection act"),
    "uniglee-act-nighttime-treat-time":("UniGlee Marathon · Active",      "✦ Nighttime Treat Time act"),
    "uniglee-act-were-multiplying":    ("UniGlee Marathon · Active",      "✦ We're Multiplying act"),
    "uniglee-chapter-banner":          ("UniGlee Marathon · Active",      "✦ New chapter unlocked"),
    "uniglee-marathon-levelup":        ("UniGlee Marathon · Active",      "✦ Marathon level up!"),
    "uniglee-summary":                 ("UniGlee Marathon · Complete",    "✦ Marathon session · 3 acts unlocked"),
    "uniglee-trigger":                 ("UniGlee Marathon · Active",      "✦ UNI-GLEE! Marathon begins"),
    "were-multiplying":                ("We're Multiplying · Free Spins", "✦ ×3 multiplier wild on reel 3"),
    "win-celebration-big":             ("Base game · Lvl 4",              "✦ BIG WIN! +2,400 coins"),
    "win-celebration":                 ("Base game · Lvl 4",              "✦ +640 coins · Chai match!"),
    "win-celebration-nice":            ("Base game · Lvl 4",              "✦ NICE WIN! +1,200 coins"),
    "win-status-only":                 ("Base game · Lvl 4",              "✦ +320 coins · Line win"),
}

# ── HTML strip builders ────────────────────────────────────────────────────────
def top_strip(mode):
    return (
        '\n        <div class="cabinet-msg cabinet-msg--top" aria-label="Player progress">'
        '<span class="cabinet-msg__sparks">'
        '<span style="color:#f5d576;font-weight:700">Lvl 4</span>'
        '<span style="color:#7a6a9a">\u00b7</span>'
        '<span style="color:#c9aeff">347\u00a0<span style="color:#7a6a9a;font-weight:400">/ 500 Sparks</span></span>'
        '<span class="cabinet-msg__sparks-bar"><span class="cabinet-msg__sparks-fill" style="width:69.4%"></span></span>'
        '</span>'
        f'<span style="color:#7a6a9a;font-weight:400;font-size:11px;letter-spacing:.06em;text-transform:uppercase">{mode}</span>'
        '</div>'
    )

def bottom_strip(copy_text):
    return (
        '\n        <div class="cabinet-msg cabinet-msg--bottom" aria-live="polite">'
        f'<span style="color:#8b7eb8">{copy_text}</span>'
        '</div>'
    )

# ── Regex patterns ─────────────────────────────────────────────────────────────
# Cabinet-frame opening + all following ornament spans (empty or with SVG content).
# SVG tags don't contain </span>, so non-greedy .*? stops at the correct </span>.
CABINET_RE = re.compile(
    r'(<(?:main|div)[^>]*class="[^"]*cabinet-frame[^"]*"[^>]*>)'
    r'((?:\s*<span\s+class="ornament\s[^"]*"[^>]*>.*?</span>)*)',
    re.DOTALL
)

GEAR_RE    = re.compile(r'(<button\s+class="chrome-btn"\s+aria-label="Settings">)')
MAIN_END   = re.compile(r'</main>')
H1_END     = re.compile(r'(</h1>)')

# ── Per-file processing ────────────────────────────────────────────────────────
def process(html, mode, copy_text):
    changed = False

    # 1. ⓘ button
    if 'aria-label="More information"' not in html:
        if GEAR_RE.search(html):
            html = GEAR_RE.sub(INFO_BTN + r'\1', html, count=1)
        else:
            # Insert all three buttons after the first </h1> (the marquee title)
            html = H1_END.sub(r'\1' + BOOK_BTN + INFO_BTN + GEAR_BTN, html, count=1)
        changed = True

    # 2. Cabinet strips
    if 'cabinet-msg--top' not in html:
        m = CABINET_RE.search(html)
        if m:
            ins = m.end()
            html = html[:ins] + top_strip(mode) + html[ins:]
            # Bottom strip: before first </main>
            html = MAIN_END.sub(bottom_strip(copy_text) + '\n      </main>', html, count=1)
            changed = True
        else:
            return html, False, "no-cabinet"

    return html, changed, "ok"

# ── Main ──────────────────────────────────────────────────────────────────────
counts = {"updated": 0, "already": 0, "skip": 0, "no-copy": 0, "no-cabinet": 0}
issues = []

for fname in sorted(os.listdir(SCENES_DIR)):
    if not fname.endswith('.html'):
        continue
    if fname in SKIP:
        counts["skip"] += 1
        continue

    name = fname[:-5]  # strip .html
    if name not in COPY:
        counts["no-copy"] += 1
        issues.append(f"NO COPY: {fname}")
        continue

    fpath = os.path.join(SCENES_DIR, fname)
    with open(fpath, encoding="utf-8") as f:
        original = f.read()

    if "cabinet-msg--top" in original:
        counts["already"] += 1
        continue

    mode, copy_text = COPY[name]
    new_html, changed, status = process(original, mode, copy_text)

    if status == "no-cabinet":
        counts["no-cabinet"] += 1
        issues.append(f"NO CABINET-FRAME: {fname}")
        continue

    if changed:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_html)
        counts["updated"] += 1
        print(f"  ✓  {fname}")
    else:
        counts["already"] += 1

print(f"\nSummary: updated={counts['updated']} already={counts['already']} "
      f"skip={counts['skip']} no-copy={counts['no-copy']} no-cabinet={counts['no-cabinet']}")
for issue in issues:
    print(f"  !! {issue}")
