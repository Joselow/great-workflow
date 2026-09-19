## Purpose

Keeps the cards list project dropdown readable in dark mode: closed chip and native options must stay high-contrast.

## ADDED Requirements

### Requirement: Project filter options are readable in dark mode
The cards list project control SHALL keep selected and option text readable in dark mode. Native option rows MUST NOT render as low-contrast light-on-light. The closed chip MUST use light text on dark (not a hardcoded dark gray).

#### Scenario: Open the list in dark mode
- **WHEN** the user opens the project filter on `/cards` while dark mode is on
- **THEN** each option (Todos, Global cards, and project names) SHALL be readable against the popup background

#### Scenario: Closed chip in dark mode
- **WHEN** a project is selected and dark mode is on
- **THEN** the selected label SHALL remain readable on the tinted chip
