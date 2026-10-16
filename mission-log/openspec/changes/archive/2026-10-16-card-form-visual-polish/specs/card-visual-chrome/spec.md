## Purpose

Makes the card form and public page use a live color tint, an overlay picker, compact chips, and a public theme toggle without shrinking the writing area.

## ADDED Requirements

### Requirement: Color is chosen from an overlay button
The form SHALL show the current color as a compact button on the right of the card. Clicking it MUST open a floating panel with the existing swatches and a hex field. Selecting a color MUST update the button immediately. Title and sections MUST use the full card width; the picker MUST overlay, not sit in a second column.

#### Scenario: Open picker
- **WHEN** the user clicks the color button
- **THEN** a floating panel SHALL show the palette swatches and the hex input

#### Scenario: Content keeps the card
- **WHEN** the color panel is open
- **THEN** title and section fields SHALL still span the card
- **AND** the panel SHALL overlay that content

### Requirement: Card chrome follows the selected color live
The card border and a low-opacity fill MUST use the selected color before save. The save button MUST use that same color. Changing the color MUST update both without waiting for persist.

#### Scenario: Pick a color
- **WHEN** the user selects a swatch or a valid hex
- **THEN** the card border and tint SHALL match that color
- **AND** the save button SHALL match that color

### Requirement: Section actions stay out of the way
The add-section control MUST be rectangular and aligned to the right. Remove-section MUST be visually quieter than the current red close control.

#### Scenario: Add a section
- **WHEN** the user clicks add section
- **THEN** a new section SHALL appear
- **AND** the control SHALL sit on the right as a rectangle, not a circle in the content flow

### Requirement: Chips stay compact and readable
The project selector and prompt (and meeting) chips MUST stay content-sized, not full width. The project selector text MUST remain readable in dark mode.

#### Scenario: Dark mode selector
- **WHEN** the form is in dark mode
- **THEN** the selected project name SHALL be readable against the chip

### Requirement: Public view can toggle theme and shows the card color
The public card page SHALL offer a single light/dark toggle at the top right. The public card MUST use the same border and tint as the form for that card’s color.

#### Scenario: Toggle theme
- **WHEN** a visitor clicks the theme toggle
- **THEN** the page SHALL switch between light and dark

#### Scenario: Public tint
- **WHEN** a visitor opens a card
- **THEN** the card panel SHALL use that card’s color on the border and a tinted background
