# Homepage Clarity UX Execution Plan

## Background

Microsoft Clarity recordings show that the homepage lookup flow has several points where users are unsure what happened after they type a name and click `Find My Fairy`.

The core flow is:

1. User enters a name.
2. User clicks `Find My Fairy`.
3. Page shows a match or no-match result.
4. User either shares the result, opens the image, or tries another name.

The first change set should protect this path before adding secondary browsing features.

## Priority

### P0: Make every submitted lookup produce visible feedback

Problem:

- Multiple sessions show repeated input and button clicks with no obvious page update.
- The current result scroll depends on `hasSubmitted` and the result object. If the same result state happens again, the page may not clearly respond.

Fix:

- Treat every submit as a new lookup event.
- Add a short status message near the form.
- Scroll the latest result into view after each submit, including repeated no-match states.
- Keep successful and no-match results in a predictable screen position.

Files:

- `app/features/fairy-finder/landing-page.tsx`
- `app/features/fairy-finder/components/input-section.tsx`

Acceptance:

- Submitting a valid name shows the result without requiring manual scrolling.
- Submitting an unknown name shows a clear no-match result without sounding like a site error.
- Repeated submissions still produce visible page feedback.

### P1: Make `Find My Fairy` look and behave like a real button

Problem:

- The current button can look like plain text if the shared `.btn-primary` style is not visually strong enough.

Fix:

- Give the button explicit background, text color, shadow, hover, focus, and active states.
- Keep the button full width on mobile and stable width on desktop.
- Add a disabled/loading state while a submit is being processed.

Files:

- `app/features/fairy-finder/components/input-section.tsx`

Acceptance:

- The primary action is visually obvious in the first viewport.
- Keyboard focus is visible.
- Empty input still shows a clear inline error.

### P2: Turn image clicks into a useful action

Problem:

- Users click the result image, but nothing happens.

Fix:

- Make the result image button-like.
- Open a lightweight image preview dialog.
- Put `Share` and `Try Another Name` actions inside the dialog.
- Preserve the existing actions below the result card.

Files:

- `app/features/fairy-finder/components/fairy-image.tsx`
- `app/features/fairy-finder/components/result-card.tsx`
- `app/features/fairy-finder/landing-page.tsx`

Acceptance:

- Clicking the image opens a larger preview.
- The preview can be closed.
- The preview exposes share and retry actions.

### P2: Make `14+ titles` a real list entry point

Problem:

- Users click the `14+ titles` badge, which currently does nothing.
- The site has few pages, so a content page can also support exploration and SEO.

Fix:

- Create a `/fairy-names` page.
- Show an introduction and a browsable list of known Rainbow Magic fairy titles.
- Link the carousel badge to this page.
- Add navigation/footer links where appropriate.

Files:

- `app/routes.ts`
- `app/routes/fairy-names.tsx`
- `app/features/fairy-finder/components/cover-marquee.tsx`
- `app/features/fairy-finder/i18n.ts`

Acceptance:

- Clicking the badge opens the list page.
- The page has a clear title, useful intro copy, and a scan-friendly title grid.
- The page has metadata for search engines.

## Validation

Run:

- `pnpm run typecheck`
- `pnpm run build`

Browser checks:

- Homepage first viewport renders with a visible primary button.
- Valid lookup: enter `Ruby`, click `Find My Fairy`, result appears in view.
- No-match lookup: enter an unknown name, submit, clear no-match text appears.
- Result image opens and closes preview.
- `Try Another Name` returns focus to the input.
- `14+ titles` opens `/fairy-names`.
- `/fairy-names` renders a useful list and has no visible runtime error.

## Completed Changes

Implemented in this change set:

- `app/features/fairy-finder/landing-page.tsx`
  - Added a `lookupSequence` counter so every form submit is treated as a new lookup event.
  - Moved the result panel directly under the input in the hero area so successful and no-match results appear in a stable, visible position.
  - Replaced the old result-section scroll with panel-aware scrolling that only adjusts the viewport when the result is too low or too high.
  - Reworded the no-match result so it reads as a normal catalog miss, not a site failure.
  - Kept submitted-name feedback below the result for both match and no-match cases.

- `app/features/fairy-finder/components/input-section.tsx`
  - Added an explicit submitting state with a short `Finding...` label.
  - Added visible focus rings for the input and primary button.
  - Gave the primary action its own strong button styling instead of relying only on the shared button class.
  - Kept the existing inline empty-input error and added a screen-reader live status while lookup is running.

- `app/features/fairy-finder/components/fairy-image.tsx`
  - Changed the result cover from a passive image into a focusable button.
  - Added hover/focus affordance and a `View` label with a zoom icon.
  - Preserved lazy image loading and fallback cover text.

- `app/features/fairy-finder/components/result-card.tsx`
  - Added a lightweight cover preview dialog for result images.
  - Added Escape-key and backdrop close behavior.
  - Reused the existing share and retry actions inside the preview dialog.

- `app/routes/fairy-names.tsx`
  - Added the `/fairy-names` catalog page.
  - Grouped fairy titles by first letter with a sticky A-Z letter nav.
  - Added cover thumbnails, a larger cover preview dialog, and links back to the name finder.
  - Added page metadata, description, keywords, and JSON-LD descriptors.

- `app/features/fairy-finder/components/cover-marquee.tsx`
  - Turned the titles badge into a real link to `/fairy-names`.
  - Uses the full catalog count instead of the short carousel item count.

- `app/features/fairy-finder/i18n.ts`
  - Added `Fairy Names` to the top navigation and footer explore links.

- `app/routes.ts`
  - Registered the new `/fairy-names` route.

## Status

All planned P0, P1, and P2 items in this document have been implemented.

Before publishing, run the validation commands above and manually check:

- Repeat lookup with the same matched name.
- Repeat lookup with the same unknown name.
- Image preview open, close button, backdrop close, and Escape close.
- `/fairy-names` letter navigation and cover preview.
