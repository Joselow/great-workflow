## Why

The card form already saves, but the color panel steals space from title and sections, chips stretch too wide, delete is loud, and the public page cannot switch theme. The picker should float over the card so writing stays first.

## What Changes

- Color is a small button on the right. Click opens a floating panel (swatches + hex), reusing `ColorPicker`.
- The card border and a tinted background follow the selected color live, including Guardar. Title and sections keep the full card width; the picker overlays.
- Add-section is a rectangular control on the right. Remove-section is discreet.
- Prompt and project selector stay compact (not full width). Project selector text stays readable in dark mode.
- Public view gets a single theme toggle (top right) and the same color border/tint.

## Capabilities

### New Capabilities
- `card-visual-chrome`: Form and public card surface — overlay color picker, live tint, compact chips, discreet section actions, public theme toggle.

### Modified Capabilities
- None — main specs are still empty.

## Impact

- Frontend only: `ColorPicker`, `CardFormView`, `CardSectionList`, `CardProjectSelect`, `CardPublicView`, `ThemeToggle` (or a thin single-button wrapper).
- No API or schema changes.
