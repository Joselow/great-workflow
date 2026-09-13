## Context

See proposal.md. `ColorPicker` already has swatches, hex, and `PopoverBase`. `CardTile` already tints with `${color}33` and border `${color}99`. `ThemeToggle` already writes `localStorage.theme` and the `dark` class.

## Goals / Non-Goals

**Goals:**
- Overlay picker (`variant="button"`) so the form is one column.
- Live tint on form, save, and public card — same recipe as `CardTile`.
- Compact chips, discreet delete, rectangular add on the right.
- One-button theme toggle on the public page.

**Non-Goals:**
- Changing project form color UI.
- New colors, drag-and-drop sections, or API work.

## Decisions

### 1. Extend `ColorPicker` instead of a second picker

- **A. New component** — duplicates hex/swatch logic. Rejected.
- **B. (Chosen)** `variant: 'panel' | 'button'`. Default `panel` keeps the project form. `button` is a colored trigger; the popover shows swatches + hex in one float (as in the mock).

`PopoverBase` gets `placement: 'right' | 'left' | 'bottom'` so the card button can open inward over the card (`left` or `bottom`).

### 2. Tint recipe stays the tile one

`borderColor: color`, `backgroundColor: ${color}33`. Shared helper `cardSurfaceStyle(color)` in `helpers/cardColor.ts`. Save uses the solid color; if the hex is light, use dark text.

### 3. Theme: compact mode on `ThemeToggle`

One button that flips light/dark using the existing storage key. Public view places it `absolute top-4 right-4`. No new theme system.

## Risks / Trade-offs

- **[Risk]** Light colors make white save text unreadable → **Mitigation**: luminance check for save label color.
- **[Risk]** Overlay picker can cover the title → **Mitigation**: intended; click-outside / Escape already close `PopoverBase`.

## Migration Plan

Frontend-only. No deploy order beyond the usual Vite build.

## Open Questions

None.
