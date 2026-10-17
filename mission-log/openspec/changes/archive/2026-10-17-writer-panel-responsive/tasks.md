## 1. Shell row

- [x] 1.1 In `App.vue`, drop `w-full` from the authenticated `<main>`, keep `flex-1 min-w-0`, and set the row to `min-w-0 overflow-x-hidden`; verify a closed writer at desktop width does not add a horizontal scrollbar to the page
- [x] 1.2 Add bottom padding on `<main>` below `md` about the height of the Writer tab, and remove it from `md` up; verify the last rows of meetings and logs sit above the closed tab

## 2. Writer panel

- [x] 2.1 In `SideBarText.vue`, remove `min-h-[calc(100dvh-150px)]` and `w-full`. Below `md`, fix the aside to the bottom: `h-10` when collapsed and `h-[80dvh]` when expanded. From `md` up, keep a relative right rail (`w-4` closed, `w-96` open, `self-stretch`); verify one tap on a phone raises the sheet to about 80% and a second tap leaves only the tab
- [x] 2.2 Clip the aside (`overflow-hidden`) and let the textarea region scroll (`min-h-0 flex-1 overflow-y-auto`). Move Limpiar and Copiar inside the panel so they no longer use `-top-7`; verify they do not draw a horizontal scrollbar and still copy and clear
- [x] 2.3 Remove the `dblclick` listener and keep a single click on `toggleExpanded`; verify a double tap collapses after it opens, and desktop still toggles the rail with one click without changing store behavior

## 3. Check

- [x] 3.1 On desktop, open and close the writer on meetings and logs; verify the rail stays on the right, the page does not scroll sideways when closed, and the open rail scrolls its own text
- [x] 3.2 Below `md`, confirm the closed tab sits on the bottom, the page scrolls and receives taps, and the open sheet is 80% tall on both meetings and logs
