## ADDED Requirements

### Requirement: A meeting stores logistics and an actual duration
The meeting API SHALL store `additionalInfo` as nullable text, `platform` as a nullable string of at most 30 characters, `meetingUrl` as nullable text, `accessDetails` as nullable text, and `duration` as a nullable integer of seconds. `platform` MUST be null or one of `meet`, `zoom`, `teams`, `whatsapp`, `presencial`, `otro`. Create and update SHALL accept the four logistics fields. Omitted logistics fields on create SHALL be stored as null. Omitted logistics fields on update SHALL leave the stored values unchanged. A blank string for any logistics field SHALL be stored as null. An unknown `platform` MUST be rejected with `400` and MUST NOT change the meeting. Get by id SHALL return the five fields. `estimatedDuration` SHALL remain the planned minutes and SHALL NOT be replaced by `duration`.

#### Scenario: Create without logistics
- **WHEN** an authenticated user creates a meeting and omits `additionalInfo`, `platform`, `meetingUrl`, `accessDetails`, and `duration`
- **THEN** the stored values of those five fields SHALL be null

#### Scenario: Save logistics
- **WHEN** the owner updates a meeting with a platform of `meet`, a meeting URL, access details, and additional info
- **THEN** get by id SHALL return those four values
- **AND** `duration` SHALL be unchanged

#### Scenario: Blank logistics become null
- **WHEN** the owner updates a meeting and sends a blank platform, URL, access details, and additional info
- **THEN** those four stored values SHALL be null

#### Scenario: Unknown platform
- **WHEN** the owner sends a `platform` that is not one of the six allowed values and is not null
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT change the meeting

### Requirement: Planning writes do not set the actual duration
Create and update MUST NOT change `duration`. A body that includes `duration` SHALL be ignored for that field. Qualifying a meeting, including setting `executed`, `summary`, or `lessons`, MUST NOT change `duration`.

#### Scenario: Update sends a duration
- **WHEN** the owner updates a meeting and the body includes a `duration`
- **THEN** the stored `duration` SHALL stay as it was

#### Scenario: Qualify leaves duration
- **WHEN** the owner sets `executed` to true through qualification
- **THEN** the stored `duration` SHALL stay as it was

### Requirement: Finish stores the actual duration once
The meeting API SHALL expose a finish action for the owner. The body SHALL be a non-negative integer `duration` in seconds. When the meeting's `executed` is false and its stored `duration` is null, the action SHALL persist that integer and SHALL NOT change `executed`, `summary`, `lessons`, or the logistics fields. When `executed` is true, or the stored `duration` is not null, the action SHALL respond with `400` and SHALL NOT change the meeting. A negative or non-integer `duration` MUST be rejected with `400`. A missing meeting, or one owned by another user, MUST be `404`. A request without a valid token MUST be `401`.

#### Scenario: First finish
- **WHEN** the owner finishes a meeting that is not executed and whose `duration` is null, with a duration of 125
- **THEN** the stored `duration` SHALL be 125
- **AND** `executed` SHALL stay false
- **AND** `summary` and `lessons` SHALL stay as they were

#### Scenario: Finish again
- **WHEN** the owner finishes a meeting whose `duration` is already stored
- **THEN** the API SHALL respond with `400`
- **AND** the stored `duration` SHALL stay as it was

#### Scenario: Finish after the meeting was executed
- **WHEN** the owner finishes a meeting with `executed` true and a null `duration`
- **THEN** the API SHALL respond with `400`
- **AND** the stored `duration` SHALL stay null

#### Scenario: Zero seconds
- **WHEN** the owner finishes a meeting that is not frozen with a duration of 0
- **THEN** the stored `duration` SHALL be 0
