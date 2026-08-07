# Analytics & Privacy — Glee-fully Chai Chasers

**Status:** current policy under Decision S25 (2026-07-13)

Glee-fully Chai Chasers is a personal birthday gift, not a product. It has no accounts, purchases, advertising, product backend, or player-profile system. Jamie may use limited Google Analytics measurement to understand the gift's aggregate reach — in plain language, whether people are finding and opening the game.

## What is enabled

- One Google Analytics web tag, measurement ID `G-89W66VMGPB`.
- Standard page-reach measurement from the browser, including the page that was opened and basic referrer context when available.
- Prerender-safe initialization so an ordinary page visit is not double-counted by the site's own code.

## What is not allowed

- Advertising, remarketing, advertising personalization, or Google signals.
- Accounts, sign-in, User ID, custom visitor identifiers, or attempts to identify a person.
- Custom events that send game actions, Glee-coin balance, bet size, winnings, localStorage contents, cat/treat state, or any other play data.
- Names, email addresses, phone numbers, precise locations, or other personally identifying information.
- Selling, renting, or sharing analytics data for marketing.

The shipped tag explicitly disables Google signals and advertising-personalization signals. No additional tag, tag manager, or analytics provider may be added without a new decision-log entry and an update to this document.

## Transparency and review

- Public copy must say that limited aggregate reach measurement is used; it must not claim the game has “no tracking.”
- The deployer is responsible for providing any notices, consent controls, or other compliance measures required where the game is offered. This document is a product policy, not legal advice.
- Before adding a new measurement feature, Jamie must review exactly what it collects and why. If the need is not simply aggregate reach, it does not belong in this game by default.
