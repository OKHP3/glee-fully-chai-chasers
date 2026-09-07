# PRD — "The Arcade" Page on glee-fully.tools
**Target Repl:** Glee-fullyTools (https://replit.com/t/glee-fullytools/repls/Glee-fullyTools)
**Author:** Claude (PM) · **Date:** 2026-07-15 · **Version:** 1.0
**Embargo:** Build now on a branch/checkpoint. `DO NOT MERGE TO MAIN / PUBLISH BEFORE 2026-07-17.` Jamie merges personally after Glee receives the gift.

---

## 0. Mission statement (read twice)

Add exactly one new page to the glee-fully.tools static site: **The Arcade**, the permanent home page for *Glee-fully Chai Chasers* (a free browser game at https://okhp3.github.io/glee-fully-chai-chasers/), plus the four small integration touches listed in §7. You are adding a room to an existing house. You are not renovating the house. Every visual decision is "match what the site already does." Every content decision is "use the copy in this PRD verbatim."

**Public narrative rule (hard):** the game is a personalized birthday gift built around a genre Glee loves. That is the complete public motivation. Do not write, imply, or invent any other motivation (financial, corrective, therapeutic, or otherwise). Do not name any real casino game, game studio, beverage brand, or pet-food brand.

## 1. Scope fences

**You may create/modify ONLY:**
- `arcade/index.html` (new)
- Nav include/partial or per-page nav blocks (only to add the one nav item, §7.1)
- Homepage `index.html` (only the two integration blocks, §7.2, §7.3)
- `sitemap.xml` (one new entry)
- Search index file if the site's client-side search uses a JSON/JS index (one new record)
- `assets/img/arcade/` (new folder for this page's images)

**You may NOT:** restructure the site, edit any other page's content, change global CSS except appending clearly-commented Arcade-scoped rules, add frameworks/build steps/trackers/fonts from CDNs, or touch the legal/persona/toolbox pages. If the repo has a Python CI/link-check gate, run it and pass it before finishing.

## 2. Discovery pass (do this before writing any HTML)

1. Inventory how existing pages are built: shared header/footer markup, nav structure, breadcrumb pattern (see /persona/ page: `Home / Personas`), CSS variables and theme (`theme-color #d35b2d`), heading hierarchy, button classes, card/grid components, the chat-bubble component, dark/light `color-scheme` support, and the "Today's Sparkle" banner mechanism.
2. Copy the page skeleton from the closest existing full page (persona or showcase) and strip its content. Reuse its meta tag pattern exactly (og:, twitter:, canonical, robots, apple-mobile-web-app tags).
3. Locate the sitemap and any search index; note their record formats.
4. Note the footer tagline convention ("Inspired by Glee's sparkle, fueled by iced chai...") — the Arcade page keeps the standard footer untouched.

## 3. Page identity

- **URL:** `https://glee-fully.tools/arcade/` — top-level. Deliberately NOT under `/toolbox/`; the game is not a Tool or Tool-ette and must not be presented inside the GPT taxonomy.
- **Title tag:** `The Arcade — Glee-fully Chai Chasers 🎰🦋 | Glee-fully Personalizable Tools™`
- **Meta description:** `Glee-fully Chai Chasers is a free, original cascading-reels game starring Joey and Phoebe. Iced chai, butterflies, midnight sparkle, and zero real money. Play it in your browser.`
- **Canonical:** `https://glee-fully.tools/arcade/`
- **OG/Twitter image:** copy `social-preview.jpg` from the game repo (https://github.com/OKHP3/glee-fully-chai-chasers → `public/assets/social-preview.jpg`) into `assets/img/arcade/chai-chasers-social-1280.jpg`. Alt text: `Joey and Phoebe the cats beside a jewel-toned iced chai under an aurora night sky`.
- **Breadcrumb:** `Home / The Arcade` in the site's existing breadcrumb component.

## 4. Page structure & final copy (use verbatim; bracketed items are your only variables)

### 4.1 Hero

- H1: `The Arcade`
- Subhead (styled like the site's hero subheads): `The Toolbox has a game room now. First cabinet inside: Glee-fully Chai Chasers.`
- Intro paragraph:
  > Glee-fully Chai Chasers is a free, original, mobile-first game of cascading reels, cats, iced chai, butterflies, and retro-bright midnight sparkle. Joey and Phoebe lead the Chai Chase through a Pacific-Northwest night sky full of keepsakes, treats, and fireflies. It was built as a birthday gift for Glee herself — which means every symbol, sound, and sparkle was chosen for one very specific player. You're invited anyway.
- Primary button (site's primary button class): `▶ Play Chai Chasers` → https://okhp3.github.io/glee-fully-chai-chasers/ (opens new tab, `rel="noopener"`)
- Secondary link: `Peek behind the curtain on GitHub →` → https://github.com/OKHP3/glee-fully-chai-chasers

### 4.2 Live preview (embedded game)

Phone-frame embed, centered. Exact construction:

```html
<section id="play" aria-label="Playable preview">
  <div class="arcade-phone-frame">
    <iframe src="https://okhp3.github.io/glee-fully-chai-chasers/"
            title="Glee-fully Chai Chasers playable preview"
            loading="lazy" allow="autoplay"
            referrerpolicy="strict-origin-when-cross-origin"></iframe>
  </div>
  <p class="arcade-embed-note">Best experienced full screen on a phone.
     Progress in this little preview window may save separately from the
     full game (browsers are protective like that).
     <a href="https://okhp3.github.io/glee-fully-chai-chasers/"
        target="_blank" rel="noopener">Open the full game →</a></p>
</section>
```

Scoped CSS (append to site stylesheet under a `/* --- Arcade page --- */` comment):

```css
.arcade-phone-frame { width: min(400px, 92vw); aspect-ratio: 390 / 780;
  margin: 0 auto; border-radius: 28px; padding: 10px;
  background: #1a1f3c; box-shadow: 0 8px 40px rgba(26,31,60,.45),
  inset 0 0 0 2px rgba(245,213,118,.25); }
.arcade-phone-frame iframe { width: 100%; height: 100%; border: 0;
  border-radius: 20px; background: #1a1f3c; }
.arcade-embed-note { text-align: center; font-size: .9rem; opacity: .8;
  max-width: 46ch; margin: .75rem auto 0; }
```

### 4.3 "What's inside" (six feature cards, site's card component)

1. **Cascades that keep going 🫧** — `Winning symbols beam up, new ones tumble down, and one lucky tap can chain into a whole light show. The firefly jar counts your streak — fill it and the free spins begin.`
2. **Joey & Phoebe, professional helpers 🐈🐈‍⬛** — `Land treats to stock the Treat Jar. Phoebe will assist for absolutely any snack. Joey holds out for his Bougie Bites, because he is a gentleman of standards.`
3. **The Sparkle Wheel 🎡** — `The cats personally host the free-spin wheel: multiplying wilds, giant keepsakes, or a rain of iced chai. Spin it and see what the household decides.`
4. **Bold Chai ☕** — `A pump-it-yourself iced chai bonus. Twelve pumps of flavor. It's a whole thing, and it's wonderful.`
5. **Doorbell Panic 🚪** — `Someone's at the door, and the cats have opinions. A matched pair of doorbells sends Joey and Phoebe scrambling across the reels as wilds.`
6. **The UniGlee 🦋🌈** — `A rare rainbow butterfly that takes over the entire screen. If you see it, you are legally required to tell someone.`

### 4.4 "The important fine print" (site's callout/notice component)

> Chai Chasers uses fictional Glee-coins only. There is no real money anywhere in it: no purchases, no wagering, no ads, no accounts, and the balance politely refills itself if it ever runs low. It's a gift, not a product — free for anyone to play, with all art, music, names, and game rules 100% original. Not affiliated with any casino, game studio, or brand.

### 4.5 "Made with love (and a small army of AIs)"

> Chai Chasers was directed by Jamie and built by a council of AI collaborators — each with one job, a shared canon, and a test suite that refused to let the math ship dishonest. The full build story, decision log, and engineering trail are public in the [GitHub repo](https://github.com/OKHP3/glee-fully-chai-chasers). The engineering deep-dive lives on our sibling site: [the OverKill Hill P³ project page](https://overkillhill.com/projects/glee-fully-chai-chasers/).

### 4.6 "Add it to your phone" (numbered steps, site list style)

1. `Open the game in Safari (iPhone) or Chrome (Android).`
2. `Tap Share → "Add to Home Screen."`
3. `That's it. It installs like an app, launches full screen, and keeps your progress on your device.`

### 4.7 Closing line (styled like the site's section closers, no CTA after it)

> Built for the person who taught this whole toolbox how to sparkle. Happy birthday, Glee. 🦋

## 5. Imagery

- Hero/inline images: pull ONLY from the game repo's `public/assets/` (splash, social preview) — download and self-host under `assets/img/arcade/`, converted to WebP with JPG fallback if the site does that elsewhere. Provide descriptive alt text for each. Maximum two large images; the embed is the star.
- Do not generate new AI art for this page. Do not hotlink to github.io for images.

## 6. Accessibility & performance requirements

- One `<h1>`; logical heading order; all interactive elements keyboard-reachable; iframe has a `title`; color contrast ≥ 4.5:1 for body text against backgrounds; `prefers-reduced-motion` honored if you add any animation (prefer none — the embed moves enough).
- Page weight excluding the iframe ≤ 600KB. `loading="lazy"` on the iframe and images. No new webfonts.

## 7. Site integration (the only edits outside /arcade/)

1. **Nav:** add `The Arcade` between `Opening The Toolbox` and `Our Ecosystem` (match existing nav item markup exactly; update every page that carries its own nav copy, or the shared partial if one exists).
2. **Homepage "New from the Toolbox" board:** replace the current featured card with: heading `New wing: The Arcade 🎰`, body `Glee-fully Chai Chasers — an original cascading-reels game starring Joey and Phoebe, built as a birthday gift for Glee herself. Cats, iced chai, and zero real money.` link `Step into the Arcade →` → `/arcade/`. Keep the previous card's markup pattern.
3. **Today's Sparkle banner:** update text to `🎰 The Arcade is open — play Glee-fully Chai Chasers, starring Joey & Phoebe 🦋` linking to `/arcade/`.
4. **sitemap.xml:** add `/arcade/` with today's lastmod.

## 8. Validation loop (minimum 2 full cycles; log results in your handoff)

1. Run the repo's existing CI/link-check gate (discover it in §2; likely Python). Zero failures.
2. Open the page at 390×844 and 1440×900. Screenshot both. The page must be visually indistinguishable in style from /persona/ and /showcase/ (same header, footer, spacing rhythm, palette).
3. Click every link (nav, buttons, GitHub, OverKill Hill, full-screen). All resolve. The OKH link may 404 until that page ships — mark it in your handoff if so.
4. Test the embed: game loads, is playable in-frame, note appears, full-screen link works.
5. Copy check: page text matches §4 verbatim; grep for the words `casino` (allowed only inside the fine-print disclaimer), `Moolah`, `Starbucks`, `Tazo`, `Swig`, `Orijen`, `Jackpot` — all must have ZERO hits outside the disclaimer's "not affiliated with any casino" phrase.
6. Lighthouse (or equivalent): accessibility ≥ 95, performance ≥ 85 mobile.

## 9. Deliverables & handoff

- The page, integrations, and assets on a branch/checkpoint named `arcade-page`, small conventional commits.
- `ARCADE-HANDOFF.md` at repo root: what changed, validation-loop results per cycle, screenshots, any deviations (each deviation needs a one-line justification; unexplained deviations are defects).
- DO NOT deploy/publish/merge. Jamie merges after 2026-07-17.

## 10. Acceptance criteria

A first-time visitor on a phone can find the Arcade from the nav, understand what Chai Chasers is in 15 seconds, play it in-frame, open it full screen, and never once wonder whether it costs money. The page reads like the rest of glee-fully.tools wrote it. The copy is this PRD's copy. The embargo held.
