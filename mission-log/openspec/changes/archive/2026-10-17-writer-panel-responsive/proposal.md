## Why

The global writer is usable on desktop, but a closed rail adds horizontal page scroll, and on a phone the same panel stays almost full height. It covers the page, the toggle does not stay at the bottom, and logs and meetings cannot be used underneath it.

## What Changes

- Keep the desktop writer as a right rail: thin when closed, wide enough to write when open, with its own scroll. Closing it must not widen the page.
- On viewports below `md`, dock the writer to the bottom. Closed, it is only the Writer tab. A click raises it to 80% of the screen height; another click lowers it again. The page behind a closed panel stays scrollable and tappable.
- Keep one global panel, the same store, and the same copy/clear actions. Do not add a second writer inside the log view.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `sidebar-writer`: The small-viewport layout becomes a bottom sheet (tab when closed, 80% height when open) instead of a tall fixed panel. Desktop stays a side rail that does not create page-level horizontal scroll.
- `global-app-shell`: The authenticated row must keep main content usable beside the rail on desktop and behind the bottom sheet on small screens.

## Impact

- `mission-log/src/commons/SideBarText.vue` and the authenticated row in `mission-log/src/App.vue`.
- No API, schema, or new dependency. The writer store stays the source of expanded state.
