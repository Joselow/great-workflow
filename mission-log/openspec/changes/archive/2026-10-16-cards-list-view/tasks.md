## 1. Backend schema (`logger-brain`)

- [x] 1.1 Add `flMeeting` boolean not null default `false` to `src/db/schemas/cards.ts` and an index on `(user_id, updated_at)`; verify the schema matches the design field
- [x] 1.2 Generate and apply the Drizzle migration; verify the column and index exist (Studio or `\d cards`)

## 2. Backend write + public (`logger-brain`)

- [x] 2.1 Accept optional `flMeeting` on create/update Zod schemas and persist it (`omit` on create → false; `omit` on update → unchanged); verify `meetingId` stays null
- [x] 2.2 Include `flMeeting` on owner get and public get; verify public still omits `userId` / `meetingId`

## 3. Backend list (`logger-brain`)

- [x] 3.1 Add list query Zod + GET request-form (`q`, `projectId` uuid|`null`, `isPrompt`, `flMeeting`, `page`, `limit`); verify invalid query returns 400
- [x] 3.2 Add `listCards` in `cardService`: always `userId`, then project / flags, then escaped ILIKE on name, description, and section title/description; verify a section-only match is returned and `%` / `_` in `q` are literal
- [x] 3.3 Return `{ items, page, limit, total }` with compact items (no sections / userId / meetingId), default page 1 limit 6, `updatedAt` desc; verify `GET /` is registered before `GET /:id` and 401 without token

## 4. Frontend types and client (`mission-log`)

- [x] 4.1 Add `flMeeting` to card interfaces and write payload; add `CardListItem` + list response types; verify they match the API
- [x] 4.2 Add `getCards(filters)` on `useCard` (`q`, `projectId`, `isPrompt`, `flMeeting`, `page`, `limit`); verify it hits `GET /card` with axios params

## 5. Form meeting flag (`mission-log`)

- [x] 5.1 Add a Meeting pill beside Prompt on `CardFormView` (independent, does not clear sections, default off on create); verify confirm sends `flMeeting` and edit shows the stored value

## 6. Gallery UI (`mission-log`)

- [x] 6.1 Add `CardListFilters.vue`: Todos + projects + Sin proyecto, search input, Prompt and Meeting pills; verify it does not change `activeProject`
- [x] 6.2 Add `CardTile.vue`: tint with card color, title, Prompt/Meeting badges only when true; verify click emits the card id
- [x] 6.3 Add `CardsView.vue` on `/cards`: own filter state, debounce search 300ms (reuse `debounce`), immediate refetch on project/pills, page arrows, Nueva → `newCard`, tile → `editCard`, empty state; verify `/cards/new` stays declared first

## 7. End-to-end checks

- [x] 7.1 Create a prompt card, a meeting card with sections, and a free card; verify the form flags persist and sections stay on the meeting card
- [x] 7.2 From `/cards`, filter by project, Sin proyecto, Prompt, Meeting, and a section-only search; verify the grid, badges, colors, debounce, and pager match the filters
