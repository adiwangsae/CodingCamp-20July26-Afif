# Tasks — Expense & Budget Visualizer

## Completed

- [x] 1. Scaffold project structure (`index.html`, `css/style.css`, `js/app.js`)
- [x] 2. Build balance card + static layout shell
- [x] 3. Build transaction form with name, amount, type, and category fields (Req 1.1)
- [x] 4. Implement input validation: empty name, zero/negative amount, missing category (Req 1.4–1.6)
- [x] 5. Implement state module with `addTransaction` / `deleteTransaction` (Req 4)
- [x] 6. Persist transactions to `localStorage` under key `ebv_transactions` with try/catch (Req 7.1–7.3)
- [x] 7. Render transaction list from state with event delegation for delete button (Req 3.1, 3.5)
- [x] 8. Compute and render total balance on every state change with positive/negative colour (Req 5.1–5.5)
- [x] 9. Integrate Chart.js pie chart with category totals and reactive updates on add/delete (Req 6.1–6.3)
- [x] 10. Custom category support: reveal input on "+ Add category…", persist option to select (Req 2.1–2.7)
- [x] 11. Sort control: Newest, Amount ↓, Amount ↑, Category A–Z (Req 8.1–8.3, 8.7)
- [x] 12. Dark/light theme toggle with CSS variables and `localStorage` persistence (Req 9.1–9.4, 9.6)
- [x] 13. Empty-state message for transaction list and chart (Req 3.2, 6.4)
- [x] 14. Chart legend with colour dots per category (Req 6.5)
- [x] 15. Semantic HTML structure and `aria-live="polite"` on balance card (Req 12.2–12.3)
- [x] 16. Escape all user-supplied text via `escapeHtml` before inserting into DOM (Req 12.5)
- [x] 17. Load Chart.js from `vendor/chart.umd.js` (Req 10.3)
- [x] 18. Responsive single-column / two-column grid layout (Req 11.2–11.3)

## Remaining

- [x] 19. Add `window.confirm()` before removing a transaction in `deleteTransaction` in `js/app.js`; only call `saveToStorage()` and `render()` when the user confirms (Req 4.2, 4.4)
- [x] 20. Show a visible UI error banner when `saveToStorage()` fails during deletion in `js/app.js`; abort the delete (leave state and views unchanged) if the write throws (Req 4.5)
- [x] 21. Add upper-bound check in `validate()` in `js/app.js`: reject amounts greater than `999999999.99` with the message "Enter an amount greater than 0." (Req 1.5)
- [x] 22. Limit custom category length in `js/app.js`: add `maxlength="32"` to `#customCategory` in `index.html` and trim-then-validate that the value is no longer than 32 characters before accepting it (Req 2.3)
- [x] 23. Apply secondary sort by `createdAt` descending in `getSortedTransactions()` in `js/app.js` for the Amount ↓, Amount ↑, and Category A–Z branches when primary values are equal (Req 8.4–8.6)
- [x] 24. Add an inline `<script>` in the `<head>` of `index.html` (before `style.css`) that reads `ebv_theme` from `localStorage` and sets `data-theme` on `<html>` immediately, preventing a flash of wrong theme on first paint (Req 9.5)
- [x] 25. Replace `outline: none` on `input:focus, select:focus` in `css/style.css` with a visible replacement focus ring (e.g. `box-shadow: 0 0 0 2px var(--accent-1)`) and add equivalent `:focus-visible` styles for buttons and the sort select (Req 12.4)
- [-] 26. Change the expense amount prefix in `renderList()` in `js/app.js` from a hyphen-minus `"-"` to the Unicode minus sign `"−"` (U+2212) (Req 3.1)
- [~] 27. Add `max-width: 40ch` to `.transaction-row__name` in `css/style.css` so the existing `text-overflow: ellipsis` rule constrains display to 40 characters (Req 3.1)

## Deployment

- [~] 28. Manual test in Chrome, Firefox, Edge, and Safari — verify layout, interactions, and localStorage across all four browsers (Req 11.1)
- [~] 29. Push to GitHub via GitHub Desktop and enable GitHub Pages on the `main` branch (Req 10)
- [~] 30. Submit AWS Builder ID, repo URL, and Pages URL via Paperform
