# Scholar First-Author Filter

Chrome extension (MV3). On a Google Scholar profile page, adds a button above the
publication table that cycles:

`Filter: off` → `First-author only` → `Non-first-author only`

A paper counts as first-author when the first name in its author line matches the
profile owner. Matching is on normalized last name + first initial (diacritics,
particles like `van der`, hyphenated given names, and initial blocks like `JA` are
handled), so it is permissive by design — it would rather show one extra paper
than hide one of yours. Papers with no author line are always shown.

Handles the "Show more" button; the mode persists across pages via `storage.sync`.

## Install

1. `chrome://extensions` → enable Developer mode.
2. "Load unpacked" → select this directory.

## Name variants

If a profile's papers list the author under another spelling, add variants in the
extension's Options (one per line); they're treated as additional identities.

## Files

- `names.js` — name normalization/parsing/matching
- `content.js` — panel, classification, filtering, mutation observer
- `options.html` / `options.js` — name variants
