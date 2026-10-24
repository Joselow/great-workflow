## MODIFIED Requirements

### Requirement: Only pause and finish stop the clock
Leaving the room, hiding the tab, and closing or unloading the page MUST NOT pause a clock that is running, and MUST NOT resume a clock that the owner paused with **Pausar**. The room MUST NOT store the clock in the browser. If **Finalizar** already paused an open segment and the owner leaves the room before answering, the room SHALL resume so the clock is running again. Closing or unloading the page while that confirmation is open leaves the clock paused. Hiding the tab MUST NOT pause or resume.

#### Scenario: Leave the room
- **WHEN** the clock is running and the owner leaves the room without opening **Finalizar**
- **THEN** the room SHALL NOT ask the server to pause

#### Scenario: Close the page
- **WHEN** the clock is running and the page is unloaded
- **THEN** the room SHALL NOT ask the server to pause

#### Scenario: Hide the document
- **WHEN** the document becomes hidden while the clock is running and later becomes visible
- **THEN** the room SHALL NOT have asked the server to pause or to resume because of that hide

#### Scenario: Leave during finish confirmation
- **WHEN** **Finalizar** has paused the open segment and the owner leaves the room before answering
- **THEN** the room SHALL ask the server to resume
- **AND** SHALL NOT ask the server to finish

#### Scenario: Close the page during finish confirmation
- **WHEN** **Finalizar** has paused the open segment and the page is unloaded before the owner answers
- **THEN** the clock SHALL stay paused

### Requirement: Finish asks, and a failed action can be retried
**Finalizar** SHALL ask for confirmation before calling finish. When a segment is open, activating **Finalizar** SHALL pause that segment before the confirmation is shown, and the readout SHALL stop at that pause. If that pause fails, the confirmation SHALL NOT open and the readout SHALL keep advancing. Dismissing the confirmation MUST NOT call finish. If this **Finalizar** paused the segment, dismissing SHALL resume and the readout SHALL continue from the paused duration. If the clock was already paused, dismissing SHALL leave it paused. While the confirmation is open, the other clock controls MUST NOT send a clock request. While a clock request is in flight, the controls MUST NOT send another one. After a successful pause, resume, or finish, the room SHALL show the controls and the readout for the returned state. A failed pause, resume, or finish SHALL leave the readout and controls of the state before that failed request.

#### Scenario: Confirm finish
- **WHEN** the owner activates **Finalizar** and confirms
- **THEN** the room SHALL ask the server to finish
- **AND** SHALL show the returned duration without advancing

#### Scenario: Dismiss finish
- **WHEN** a segment is open and the owner activates **Finalizar** and dismisses the confirmation
- **THEN** the room SHALL have paused that segment before the confirmation
- **AND** SHALL ask the server to resume
- **AND** SHALL NOT ask the server to finish
- **AND** the readout SHALL continue from the paused duration

#### Scenario: Dismiss finish while paused
- **WHEN** the clock is paused and the owner activates **Finalizar** and dismisses the confirmation
- **THEN** the room SHALL NOT ask the server to finish
- **AND** SHALL NOT ask the server to resume
- **AND** the clock SHALL stay paused

#### Scenario: Pause before finish fails
- **WHEN** a segment is open and the owner activates **Finalizar** and the pause fails
- **THEN** the confirmation SHALL NOT open
- **AND** the readout SHALL keep advancing

#### Scenario: Resume fails
- **WHEN** the owner activates **Reanudar** and the request fails
- **THEN** the room SHALL keep showing **Reanudar**
- **AND** the readout SHALL stay as it was

## ADDED Requirements

### Requirement: The first move asks to start the clock
When the owner enters the room and the clock has never started, the first activation of the next control on the context act SHALL ask whether to start the meeting and SHALL stay on the context act until the owner answers. Confirming SHALL ask the server to resume and SHALL then show the development act. Dismissing SHALL NOT resume and SHALL then show the development act. After either answer, moving between acts in that same visit MUST NOT ask again. Leaving the room and entering it again SHALL ask again on the next context-to-development move when the clock still has never started. The room MUST NOT ask when the clock has already started, when **Iniciar** is not shown, or when the owner moves from development to close. The room MUST NOT ask only because the context act was shown.

#### Scenario: Confirm on the first move
- **WHEN** the owner enters the room for a meeting whose clock has never started and activates the next control on the context act and confirms
- **THEN** the room SHALL ask the server to resume
- **AND** SHALL show the development act
- **AND** a later move between acts in that visit SHALL NOT ask again

#### Scenario: Dismiss on the first move
- **WHEN** the owner activates that next control and dismisses the question
- **THEN** the room SHALL NOT ask the server to resume
- **AND** SHALL show the development act
- **AND** moving to another act and back SHALL NOT ask again during that visit

#### Scenario: Enter the room again
- **WHEN** the owner dismissed the question, leaves the room, and enters it again while the clock has never started
- **THEN** the next control on the context act SHALL ask again

#### Scenario: Clock already started
- **WHEN** the clock has already started and the owner activates the next control on the context act
- **THEN** the room SHALL show the development act
- **AND** SHALL NOT ask to start the meeting

#### Scenario: Stay on context
- **WHEN** the owner enters the room and the clock has never started and does not activate the next control
- **THEN** the room SHALL NOT ask to start the meeting
