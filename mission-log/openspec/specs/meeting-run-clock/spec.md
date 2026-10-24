## Purpose

The execution room shows the meeting clock from the server and lets the owner start, pause, resume, and finish it. Closing the browser does not pause. A finished meeting can be resumed.

## Requirements

### Requirement: The clock and its controls stay with the title
On every act, the room SHALL show the clock as hours, minutes, and seconds, zero-padded. On the right of the header, a play button starts or resumes the clock, and pause and finish are icons while the clock is running or paused. The close act SHALL offer **Finalizar** with the same action while the clock can still be finished. Hours MAY grow past 99. The controls SHALL remain visible on a narrow viewport and MUST NOT replace the act navigation. A null `duration` SHALL be shown as zero seconds while the clock is not running.

#### Scenario: The development act shows the clock
- **WHEN** the owner is on the development act
- **THEN** the header SHALL show the clock and the clock controls
- **AND** the close act SHALL NOT be the only place with a finish control

#### Scenario: A narrow viewport
- **WHEN** the owner opens the room on a narrow viewport
- **THEN** the clock controls SHALL remain visible
- **AND** the act navigation SHALL still be available

### Requirement: The controls follow the clock state
When the clock has never started and `executed` is false, the room SHALL show **Iniciar** and SHALL NOT show **Pausar**, **Reanudar**, or **Finalizar**. When the clock has never started and `executed` is true, the room SHALL NOT show those controls. When a segment is open and `finishedAt` is null, the room SHALL show **Pausar** and **Finalizar**, including when `executed` is already true. When the clock has started, no segment is open, and `finishedAt` is null, the room SHALL show **Reanudar** and **Finalizar**. When `finishedAt` is set, the room SHALL show **Reanudar** and SHALL NOT show **Pausar** or **Finalizar**. The room MUST NOT show an executed label. **Iniciar** and **Reanudar** SHALL both ask the server to resume.

#### Scenario: Not started
- **WHEN** the owner opens the room for a meeting whose clock has never started
- **THEN** the room SHALL show **Iniciar**
- **AND** SHALL NOT show **Pausar**, **Reanudar**, or **Finalizar**

#### Scenario: Running
- **WHEN** a segment is open
- **THEN** the room SHALL show **Pausar** and **Finalizar**

#### Scenario: Paused
- **WHEN** the clock has started, no segment is open, and the meeting is not finished
- **THEN** the room SHALL show **Reanudar** and **Finalizar**

#### Scenario: Finished
- **WHEN** `finishedAt` is set
- **THEN** the room SHALL show **Reanudar**
- **AND** SHALL NOT show **Pausar** or **Finalizar**
- **AND** the clock SHALL NOT advance until resume succeeds

#### Scenario: Executed before the first start
- **WHEN** the owner opens the room for a meeting whose clock has never started and whose `executed` is true
- **THEN** the room SHALL NOT show **Iniciar**

### Requirement: The readout follows the open segment
While a segment is open, the readout SHALL be the stored `duration`, treating null as zero, plus the whole seconds from `runningSince` to the computer's clock. The room MUST NOT send a duration, and MUST NOT call a periodic tick. While no segment is open, the readout SHALL show the stored `duration` and SHALL NOT advance. A failed pause, resume, or finish SHALL leave the previous readout in place.

#### Scenario: An open segment keeps counting
- **WHEN** the owner opens the room for a meeting whose `duration` is 300 and whose `runningSince` is already in the past
- **THEN** the readout SHALL include the whole seconds since `runningSince`
- **AND** SHALL keep advancing
- **AND** the room SHALL NOT ask the server to pause or to tick

#### Scenario: Paused readout
- **WHEN** no segment is open and `duration` is 300
- **THEN** the readout SHALL show 300
- **AND** SHALL NOT advance

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
