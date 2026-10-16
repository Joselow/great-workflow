## Purpose

Read-only public page for a card id: same visual language as the form, no editing, reachable without signing in.

## ADDED Requirements

### Requirement: Public route is visible without authentication
A dedicated public URL SHALL render the card for that id without requiring a session. The page MUST NOT show the authenticated app shell (header project slot, project drawer, writer). It MUST use the existing Tailwind / brand look (rounded panel, card color, readable dark mode).

#### Scenario: Open a shared link while logged out
- **WHEN** a visitor opens the public card URL with a valid id and no session
- **THEN** the page SHALL show the card
- **AND** SHALL NOT redirect to login

#### Scenario: Unknown id
- **WHEN** a visitor opens the public card URL with an unknown id
- **THEN** the app SHALL show a not-found state

### Requirement: View is read-only
The public page MUST show name, description, color, and — when the card is not a prompt — sections in order. When the card is a prompt, it MUST show name and description only (no section list). It MUST NOT offer inputs, save, project change, prompt toggle, or section add/remove/reorder.

#### Scenario: Regular card
- **WHEN** the visitor opens a non-prompt card that has sections
- **THEN** the page SHALL show title, description, and each section title and description in saved order
- **AND** SHALL NOT show edit or save controls

#### Scenario: Prompt card
- **WHEN** the visitor opens a prompt card
- **THEN** the page SHALL show title and description
- **AND** SHALL NOT show sections

### Requirement: Optional project is display-only
If the card has a project, the public page MAY show the project name (and color if available) as a label. That label MUST NOT be a selector and MUST NOT change any project.

#### Scenario: Card with project
- **WHEN** the public card belongs to a project
- **THEN** the page SHALL show that project as a non-interactive label

#### Scenario: Free card
- **WHEN** the public card has no project
- **THEN** the page SHALL NOT imply it belongs to a project
