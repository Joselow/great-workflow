## Purpose

A reusable modal for choosing one prompt card the owner already has, without creating or deleting a card and without navigating away.

## ADDED Requirements

### Requirement: The modal lists only the owner's prompt cards
While the modal is open, the app SHALL request the owner's cards with the prompt flag set, one page at a time, using the existing card list. Each row MUST show that card's color, name, and description. The modal MUST NOT list a card whose prompt flag is false. The modal MUST NOT create, edit, or delete a card.

#### Scenario: Open the picker
- **WHEN** the modal opens
- **THEN** the card request SHALL set the prompt flag
- **AND** each shown row SHALL include the card color, name, and description

#### Scenario: No create or delete
- **WHEN** the modal is open
- **THEN** it SHALL NOT offer a control that creates or deletes a card

### Requirement: Search and pages come from the card list
A search field MUST refetch prompt cards for the entered text and MUST start again at the first page. Turning pages MUST request that page with the same search. The modal MUST NOT hide non-matching rows only on the page already loaded. When another page exists, a control MUST be able to show it. When no prompt card matches, the modal MUST say so and MUST stay open.

#### Scenario: Search
- **WHEN** the owner enters a search term and pauses
- **THEN** the card request SHALL include that text and the prompt flag
- **AND** SHALL request the first page

#### Scenario: Next page
- **WHEN** more prompt cards match than the current page shows and the owner asks for the next page
- **THEN** the modal SHALL request that next page
- **AND** SHALL keep the prompt flag and the current search

#### Scenario: Nothing matches
- **WHEN** the request returns no cards
- **THEN** the modal SHALL show an empty message
- **AND** SHALL remain open

### Requirement: Choosing a card returns it and closes
Activating a card row MUST return that card and close the modal. The card record MUST remain. Closing without a choice MUST return nothing and MUST leave the caller's current selection unchanged. Opening or closing the modal MUST NOT change the active project and MUST NOT navigate.

#### Scenario: Select a card
- **WHEN** the owner activates a card row
- **THEN** the caller SHALL receive that card's id, name, color, and description
- **AND** the modal SHALL close
- **AND** the card SHALL still exist

#### Scenario: Close without a choice
- **WHEN** the owner closes the modal without activating a row
- **THEN** the caller SHALL keep the selection it had before the modal opened
- **AND** the app SHALL stay on the current route
