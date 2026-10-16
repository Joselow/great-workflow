## Purpose

Let the owner record whether a meeting was executed and whether its objective was achieved, and keep the optional summary and the lessons that come out of that qualification.

## Requirements

### Requirement: Qualification fields are stored and returned
The meeting API SHALL accept `summary`, `lessons`, `executed`, and `objectiveAchieved` on create and update, and SHALL return them on get and on list. `summary` and `lessons` are nullable text. `executed` is a boolean. `objectiveAchieved` is a nullable boolean. Omitted fields on create SHALL default to `summary` null, `lessons` null, `executed` false, and `objectiveAchieved` null. Omitted fields on update SHALL leave the stored values unchanged.

#### Scenario: Create without a qualification
- **WHEN** an authenticated owner creates a meeting without `summary`, `lessons`, `executed`, or `objectiveAchieved`
- **THEN** the API SHALL persist `executed` false and `objectiveAchieved` null
- **AND** SHALL persist `summary` and `lessons` as null
- **AND** GET SHALL return those values

#### Scenario: Get returns a saved qualification
- **WHEN** the owner reads a meeting that was qualified as achieved, with a summary and no lessons
- **THEN** GET SHALL return `executed` true, `objectiveAchieved` true, that summary, and `lessons` null

#### Scenario: Partial planning update keeps the qualification
- **WHEN** the owner updates only planning fields and omits `summary`, `lessons`, `executed`, and `objectiveAchieved`
- **THEN** the API SHALL leave the stored qualification unchanged

### Requirement: A verdict marks the meeting executed
When create or update sets `objectiveAchieved` to true or false, the API SHALL persist `executed` as true. A meeting SHALL NOT be stored with a non-null `objectiveAchieved` and `executed` false.

#### Scenario: Achieved verdict
- **WHEN** the owner saves `objectiveAchieved` true
- **THEN** the API SHALL persist `objectiveAchieved` true and `executed` true

#### Scenario: Not achieved verdict
- **WHEN** the owner saves `objectiveAchieved` false together with non-blank lessons
- **THEN** the API SHALL persist `objectiveAchieved` false and `executed` true

#### Scenario: Verdict overrides an executed false flag
- **WHEN** the owner saves `objectiveAchieved` true and `executed` false in the same request
- **THEN** the API SHALL persist `executed` true

### Requirement: Lessons are required only when the objective was not achieved
`summary` SHALL always be optional. Choosing no verdict (`objectiveAchieved` null) SHALL NOT require `lessons`. When `objectiveAchieved` is false, `lessons` MUST be a non-blank string; a missing, null, or whitespace-only value MUST be rejected with `400` and MUST NOT change the meeting. When `objectiveAchieved` is true, blank `lessons` SHALL be stored as null. Blank `summary` SHALL be stored as null.

#### Scenario: Not achieved without lessons
- **WHEN** the owner saves `objectiveAchieved` false and `lessons` null, missing, or whitespace
- **THEN** the API SHALL respond with `400`
- **AND** SHALL NOT update the meeting

#### Scenario: Not achieved with lessons
- **WHEN** the owner saves `objectiveAchieved` false and lessons `"Llegamos sin acuerdo de alcance"`
- **THEN** the API SHALL persist that lessons text and `objectiveAchieved` false

#### Scenario: Achieved without summary or lessons
- **WHEN** the owner saves `objectiveAchieved` true and omits `summary` and `lessons`
- **THEN** the API SHALL persist the verdict
- **AND** SHALL NOT require either text

#### Scenario: Blank summary is stored as null
- **WHEN** the owner saves a verdict with `summary` `""`
- **THEN** the API SHALL persist `summary` as null

### Requirement: List items include execution and objective
Each item from `GET /meeting` SHALL include `executed` and `objectiveAchieved` for that meeting. `objectiveAchieved` SHALL be true, false, or null.

#### Scenario: List a qualified and an unqualified meeting
- **WHEN** the owner lists meetings and one is executed with the objective achieved and another is not executed
- **THEN** the first item SHALL include `executed` true and `objectiveAchieved` true
- **AND** the second item SHALL include `executed` false and `objectiveAchieved` null
