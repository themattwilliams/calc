# Tabbed Help Drawer - Implementation Process (TDD)

## Overview
Implement a left-side Tabbed Help Drawer that provides contextual guidance for each major form block (Purchase, Financing, Expenses, Taxes, etc.). The drawer should be engaging, accessible, and responsive (desktop and mobile). Content is JSON-driven, sanitized, and searchable.

- Presentation: Left drawer on desktop; full-screen/bottom-sheet style on mobile
- Tabs: Tips | Examples | Mistakes | Save
- Enhancements included: Search (Fuse.js), result highlighting (mark.js), Copy Example with toast; progress dots/checkmarks; no telemetry
- Accessibility: Focus trap, ARIA roles/labels, ESC to close, keyboard navigation; honors prefers-reduced-motion
- Security: Sanitize any HTML content via existing `window.sanitizeHTML`

## Scope
- New UI component: Tabbed help drawer with responsive behavior
- Context sync via focus and scroll (IntersectionObserver + focusin)
- JSON content model keyed by `data-help-id` on each block/field
- Search across drawer content with highlighted results
- Copy-to-clipboard with toast feedback

## Out of Scope
- Telemetry/analytics
- Server-side content management
- Localization (will integrate later under Multi-Currency/Locale work)

## Dependencies
- Optional UI lib: Shoelace `<sl-drawer>` + `<sl-tab-group>` (preferred for speed/accessibility), or a custom lightweight drawer if we want zero deps
- Search: Fuse.js
- Highlight: mark.js (or a simple custom highlighter)
- Existing: `window.sanitizeHTML` from `js/security-utils.js`

## Architecture/Files
- New: `js/help-drawer.js` (drawer controller + content sync + search)
- New: `css/help-drawer.css` (styling for drawer, tabs, mobile sheet)
- New: `data/help-content.json` (JSON content keyed by help id)
- Update: `index.html` (insert drawer markup + script/style includes)
- Tests:
  - Unit: `tests/help-drawer-unit-tests.js`
  - E2E: `tests/e2e/help-drawer.spec.js`

## Content Model (example)
```json
{
  "purchase": {
    "title": "Purchase Price",
    "tips": [
      "Use closing disclosure if available",
      "Include negotiated seller credits"
    ],
    "examples": [
      { "label": "Typical", "value": "$275,000" },
      { "label": "Multi-unit", "value": "$1,100,000" }
    ],
    "mistakes": [
      "Forgetting to include concessions",
      "Mixing rehab budget into purchase price"
    ],
    "save": [
      "Save before switching scenarios to avoid losing inputs"
    ]
  }
}
```

## Accessibility
- Drawer is a dialog with focus trap and ESC-to-close
- Tabs are proper tablist/tabpanel/aria-controls
- Search input labeled; results announced politely
- Reduced motion fallback for animations

## User Stories & Acceptance Criteria (TDD)

1) As a new user, I can open the Help Drawer and switch tabs
- Acceptance Criteria:
  - Drawer opens via help button and keyboard (Enter/Space)
  - Tabs: Tips | Examples | Mistakes | Save are visible and keyboard navigable
  - ESC closes; focus returns to the invoking control
- Tests:
  - Unit: tab state transitions, aria attributes
  - E2E: open/close drawer, switch tabs by keyboard, focus restore

2) As a user, the drawer auto-updates to the active section (focus/scroll)
- Acceptance Criteria:
  - Focusing a field/block updates drawer content within 150ms
  - Scrolling into a block updates content based on `data-help-id`
  - No flicker during rapid focus changes
- Tests:
  - Unit: map `helpId` -> content
  - E2E: focus a field updates title/tips; scroll updates as blocks change

3) As a user, I can search help content and see highlights
- Acceptance Criteria:
  - Search returns results across tabs; highlights match terms
  - Clearing search restores full content
- Tests:
  - Unit: Fuse index building; search result shape
  - E2E: enter query -> highlights appear; clear -> highlights removed

4) As a user, I can copy an example input with feedback
- Acceptance Criteria:
  - Clicking “Copy” puts example value on clipboard
  - A toast appears for 2s and is announced to screen readers
- Tests:
  - Unit: copy handler; toast visibility timing
  - E2E: copy button -> clipboard matches; toast visible/announced

5) As a keyboard-only user, I can operate the drawer fully
- Acceptance Criteria:
  - Tab order predictable; focus trap inside drawer
  - ESC closes; Shift+Tab on first element wraps to last
- Tests:
  - E2E: keyboard navigation across controls; escape to close

6) As a mobile user, I get a bottom-sheet drawer with tabs
- Acceptance Criteria:
  - On small breakpoints, the drawer becomes a bottom sheet (70% height)
  - Drag handle or close button dismisses; content scrollable
- Tests:
  - E2E: set viewport to mobile; open; verify layout and interactions

7) As a user, I see progress indicators across sections
- Acceptance Criteria:
  - The drawer shows section progress (visited/completed)
  - Progress updates when required fields are filled
- Tests:
  - Unit: progress state computation
  - E2E: fill fields -> indicators update

8) As a user, I’m protected from unsafe help content
- Acceptance Criteria:
  - All dynamic HTML is sanitized; no scripts/handlers/JS URLs
- Tests:
  - Unit: sanitize calls on rendered content
  - E2E: attempt to load malicious content is neutralized (re-using security tests approach)

9) Performance & Motion
- Acceptance Criteria:
  - Content updates within 150ms on focus/scroll
  - Respects `prefers-reduced-motion`; no large jank spikes
- Tests:
  - Performance test: repeated updates average under 150ms (like our performance-tests style)

## TDD Plan & Sequence
1. Write failing unit tests for core state (tab switching, content mapping, sanitize)
2. Write failing E2E tests: open/close, focus sync, search, copy, mobile layout
3. Implement minimal drawer skeleton (markup + ARIA) to pass first tests
4. Add content model loader and sanitize pipeline
5. Implement focus/scroll sync with IntersectionObserver
6. Add search (Fuse.js) + mark.js highlighting
7. Implement copy + toast feedback
8. Add progress indicators
9. Add responsive mobile sheet behavior
10. Finalize performance and reduced-motion behaviors

## Existing Tests to Leverage/Adjust
- Re-use sanitization tests patterns (`tests/markdown-security-tests.js`, E2E markdown security spec) for help content sanitization
- Re-use performance test harness patterns from `performance-tests.js`
- Ensure drawer does not interfere with chart tests (z-index, focus): add assertions to existing chart E2E if needed

## Risks & Mitigations
- Focus management complexity → adopt battle-tested patterns from dialog components
- Search perf on low-end devices → Fuse index built once; debounce input
- Mobile usability → large tap targets; bottom-sheet gestures optional (fallback to close button)

## Rollout
- Feature flag: `window.flags.helpDrawer = true`
- Progressive enhancement: form works without drawer
- Copy/content in JSON for fast iteration without code changes

## Definition of Done
- All unit and E2E tests for this feature pass
- No regressions in existing suites
- Meets accessibility and performance acceptance criteria
- Documented in README section and linked from checklists
