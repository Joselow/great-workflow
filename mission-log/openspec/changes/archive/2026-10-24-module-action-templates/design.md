## Context

See proposal.md for why. `GET /action-template` already returns the owner's templates, oldest `createdAt` first, with `isActive`, `module`, `name`, `color`, `template`, and a prompt-card summary `{ id, name, color, description }` or null. A `module` query would drop templates whose module is `all`, so the client has to filter. `generateMeetingSummary` is what **Copiar resumen** writes, and that handler also puts the text in the writer as markdown and copies it. `generateLogInfo` is what **Info** writes. The task row builds `*name*` plus the description inline. `cardToCopyText` is the prompt-card copy. `MeetingRowActions` is the slotted dropdown on a meeting row; its open position assumes a menu about one item tall. The meeting list row does not include estado, objetivo, agenda, or próximos pasos. `setTextData` replaces the writer and expands it.

## Goals / Non-Goals

**Goals:**

- One compose step for template body plus entity content, and one entity function per module.
- Offer active templates of that module and of `all`, without a new request shape.
- Put meeting templates on the planning form as buttons and in the table row menu.
- Put the other three modules on the existing dropdown, including the tasks modal that reuses the task row.

**Non-Goals:**

- A new column, endpoint, or dependency.
- Changing what **Copiar resumen** or **Info** write by themselves.
- Adding template controls to the execution room or its notebook.
- Appending to the writer, or printing the Acción field as the visible label.

## Decisions

### The client filters one list

Each surface loads `GET /action-template` once and keeps rows where `isActive` is true and `module` is the surface or `all`, in the returned order. A shared in-flight request is enough so the rows of one page do not each call the API.

Alternative: `GET /action-template?module=meeting` plus a second call for `all`. Rejected because the unfiltered list is already the owner's full set.

### One compose, then the same write Copiar resumen uses

The template body is `template` trimmed when `card` is null. When `card` is present, the body is `cardToCopyText` of that summary as a prompt with no sections, so a prompt card stays one copy format. The entity block comes from the module function below. Two non-empty blocks join with one blank line, template first. One non-empty block is the whole text. Both empty: do not touch the writer or the clipboard. Otherwise `setTextData(text, 'markdown')`, then `navigator.clipboard.writeText`. Success uses the existing copied toast. Failure leaves the writer as written and shows the existing copy error.

Alternative: `appendTextData`. Rejected because **Copiar resumen** replaces, and this action is a fresh package of template plus entity.

### Entity content is four functions

- Meeting: `generateMeetingSummary`, with the same fields **Copiar resumen** already passes. That button keeps writing the summary alone.
- Requirement: a new helper that returns the trimmed name.
- Task: move the row's `*name*` and description string into a helper. A description still follows a blank line. An empty description returns only the emphasized name, so an action still has an entity. The current description button stays hidden without a description and calls this helper when it runs.
- Log: `generateLogInfo`, unchanged. **Info** keeps calling it alone.

### Meeting controls are buttons on the plan and items in the row menu

Render one full-width button per offered template in the same block as **Copiar resumen**, after that button. The background is the template color. The icon is `touch_app` and the label is `name`. Text and icon are white or near-black from the color's relative luminance. The draft does not need a saved id: the summary already reads the form.

The table menu keeps **Eliminar** and adds the same templates, oldest first, ahead of delete. The list payload cannot build the summary, and the row still must not fetch each meeting just to render. Choosing a template calls the existing get-by-id and passes that meeting through `generateMeetingSummary`. The menu does not navigate. The execution room and `MeetingRunNotebook` get no meeting template control.

Alternative: a separate button on the row, beside the menu. Rejected because the list dropdown is the place already used for row actions.

### The other modules reuse the meeting dropdown

`MeetingRowActions` is the menu. Requirement, task, and log rows render a second one only when the filtered list is not empty. The trigger stays `more_vert`. Each item is a button with `touch_app`, `name`, and the same color treatment. The menu must grow with its items, scroll if it would leave the viewport, and still flip upward near the bottom. Long names wrap inside the menu instead of being clipped at the current fixed width.

`TaskRow` is the row of both the tasks page and `RequirementTasksModal`, so the task dropdown is there in both. `MeetingRunNotebook` draws its own rows and does not receive it. The modal covering the writer stays as it is.

Alternative: a new menu component. Rejected because the meeting row menu is the dropdown the modules are supposed to share.

### The label is the template name, and Acción is the title

The button and the menu item show `name`. When `action` is non-empty, it is the control's `title`. When it is null, the control has no `title`. The Acción field stays on the configuration form.

## Risks / Trade-offs

- [The dropdown's open position assumes one short item] → Size it from the content, with a max height and scroll, and check the delete menu still opens next to the button.
- [A light template color with white text, or a dark color with black text, hides the name] → Pick the text color from luminance.
- [Several meeting buttons make that block tall] → They stack at the full width of the block, the same way **Copiar resumen** does.
- [A table action needs fields the list row does not have] → Load that one meeting when the item is chosen. Rendering the table still uses the list payload.
- [The tasks modal covers the writer] → The shared task row still shows the dropdown. How the modal and the writer sit together stays for a later change.
- [The card summary is whatever the list returned] → Load templates when the page opens, so the description is current for that visit.
- [Clipboard permission denied] → The writer already holds the text; the error toast is the same one **Copiar resumen** uses.

## Migration Plan

No data change. Deploy the frontend. Removing the buttons and the dropdown returns the four screens to their current controls.
