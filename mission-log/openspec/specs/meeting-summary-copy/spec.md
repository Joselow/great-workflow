# meeting-summary-copy Specification

## Purpose
Copy the meeting as text that WhatsApp can format, keeping the bold and italic the owner typed in the objective.

## Requirements

### Requirement: Copiar resumen keeps objective emphasis
The meeting form SHALL offer **Copiar resumen**. The copied text SHALL include the objective body with the same `*` and `_` characters the owner typed. Bold SHALL remain `*text*` and italic SHALL remain `_text_`. The copier SHALL NOT remove those markers, escape them, or convert them to HTML.

#### Scenario: Bold and italic survive the copy
- **WHEN** the objective is `Cerrar *alcance* con el _cliente_` and the owner activates **Copiar resumen**
- **THEN** the clipboard text SHALL contain `Cerrar *alcance* con el _cliente_`

#### Scenario: The objective body is not wrapped again
- **WHEN** the owner activates **Copiar resumen**
- **THEN** the copied text SHALL place `*Objetivo:*` on its own line
- **AND** the objective body SHALL follow as its own text
- **AND** that body SHALL NOT be wrapped in an extra `*` or `_` pair
