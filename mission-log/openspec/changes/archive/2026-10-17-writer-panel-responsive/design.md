## Context

`SideBarText` is the only writer, mounted from the authenticated row in `App.vue`. Expanded state stays in `textDataStore`. See proposal.md for why the current sheet and rail overflow.

Today the aside is `fixed` to the bottom below `md` and `relative` from `md` up, but `min-h-[calc(100dvh-150px)]` applies in both states and both breakpoints. Collapsed and expanded both also set `w-full`, while `<main>` is `w-full` inside the same flex row. Copy and clear sit at `absolute -top-7`. The tab listens to both `click` and `dblclick`.

## Goals / Non-Goals

**Goals:**

- One global writer. Desktop rail unchanged in role. Phone uses a bottom tab that opens to 80% height.
- Remove the page-level horizontal scrollbar caused by the closed rail.
- One activation toggles. Actions stay inside the panel.

**Non-Goals:**

- A second writer in the log view, a new store, or a new dependency.
- Restyling the meetings table, header, or other screens.
- A design-system document beyond the existing Pastel Soft UI note.

## Decisions

1. **Height is explicit per breakpoint and state.** Below `md`, collapsed height is the tab (`h-10`) and expanded height is `80dvh`, both `fixed` to `bottom: 0` and `inset-x-0`. Drop the shared `min-h-[calc(100dvh-150px)]`. From `md` up, the aside returns to the row (`relative`, `self-stretch`): `w-4` closed, `w-96` open. It must not also be `w-full`, or the row becomes 100% plus the rail.
2. **The shell row may shrink.** `<main>` keeps `flex-1 min-w-0` and loses `w-full`, so its width is the leftover space, not the full row. The row uses `overflow-x-hidden` and `min-w-0`. On small screens, main gets bottom padding about the tab height so the last rows are not hidden behind the closed tab. The open sheet overlays; it does not push the document.
3. **The panel clips itself.** `overflow-hidden` on the aside. The textarea region is `min-h-0 flex-1 overflow-y-auto`. Copy and clear render inside the sheet (in the tab row on small screens, inside the rail on desktop), not at a negative offset that spills into the page.
4. **One listener.** Keep `@click="toggleExpanded"` and remove `@dblclick`. A second tap must collapse, not cancel the first. The store API stays as it is.
5. **Order of the sheet.** Below `md` the tab is the first row of a column anchored to the bottom, so opening moves that tab up and the text fills down to the floor. From `md` up the tab stays the vertical strip on the rail's inner edge.

## Risks / Trade-offs

- [Open sheet covers 80% of a phone] → That is the requested size. The top fifth of the page stays visible; collapse is the same tab.
- [Desktop content feels narrower when the rail is open] → Same `w-96` as today. The fix is the closed state and the `w-full` sum, not a thinner open rail.
- [`overflow-x-hidden` on the shell could clip a wide menu] → Menus that must escape the row should already be portaled or fixed. The meetings table keeps its own `overflow-x-auto`.

## Migration Plan

Style and structure only. No data migration. Revert the aside classes and the shell row if the sheet regresses.

## Open Questions

None.
