## Purpose

The execution room shows the meeting clock from the server and lets the owner start, pause, resume, and finish it. Closing the browser does not pause. A finished meeting can be resumed.

## ADDED Requirements

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
Leaving the room, hiding the tab, and closing or unloading the page MUST NOT ask the server to pause or to resume. The room MUST NOT store the clock in the browser.

#### Scenario: Leave the room
- **WHEN** the clock is running and the owner leaves the room
- **THEN** the room SHALL NOT ask the server to pause

#### Scenario: Close the page
- **WHEN** the clock is running and the page is unloaded
- **THEN** the room SHALL NOT ask the server to pause

#### Scenario: Hide the document
- **WHEN** the document becomes hidden while the clock is running and later becomes visible
- **THEN** the room SHALL NOT have asked the server to pause or to resume because of that hide

### Requirement: Finish asks, and a failed action can be retried
**Finalizar** SHALL ask for confirmation before calling the server. Dismissing that confirmation MUST NOT change the clock. While a clock request is in flight, the controls MUST NOT send another one. After a successful pause, resume, or finish, the room SHALL show the controls and the readout for the returned state. A failed pause, resume, or finish SHALL leave the previous readout and controls in place.

#### Scenario: Confirm finish
- **WHEN** the owner activates **Finalizar** and confirms
- **THEN** the room SHALL ask the server to finish
- **AND** SHALL show the returned duration without advancing

#### Scenario: Dismiss finish
- **WHEN** the owner activates **Finalizar** and dismisses the confirmation
- **THEN** the room SHALL NOT ask the server to finish
- **AND** the clock SHALL stay as it was

#### Scenario: Resume fails
- **WHEN** the owner activates **Reanudar** and the request fails
- **THEN** the room SHALL keep showing **Reanudar**
- **AND** the readout SHALL stay as it was
