## ADDED Requirements

### Requirement: Color picker displays a fixed palette
The application SHALL provide a color picker component that shows a horizontal row of square color swatches from a predefined palette.

#### Scenario: Render swatches
- **WHEN** the color picker is displayed
- **THEN** it SHALL show multiple square swatches with distinct pastel-like colors
- **AND** one swatch SHALL represent the neutral default color

### Requirement: User can select a project color
The color picker SHALL allow selecting exactly one color at a time and emit the selected value.

#### Scenario: Select color
- **WHEN** the user clicks a swatch
- **THEN** that swatch SHALL become visually selected (for example, with a ring or border)
- **AND** the component SHALL emit the chosen color value

#### Scenario: Initial selection
- **WHEN** the color picker is shown with an existing project color
- **THEN** the swatch matching that color SHALL appear selected

### Requirement: Selected color is previewable
The color picker SHALL make the current selection visually obvious to the user.

#### Scenario: Visual feedback
- **WHEN** a swatch is selected
- **THEN** the selected swatch SHALL be distinguishable from unselected swatches without relying on hover alone
