# Design — Expense & Budget Visualizer

## Architecture
Single-page app, three static files, no build tooling:

```
index.html   -> structure: balance card, form, transaction list, chart canvas
css/style.css -> all styling, CSS variables for theme (dark default / light)
js/app.js    -> state, localStorage I/O, rendering, Chart.js wiring
```

## Data Model
```js
// stored under localStorage key "ebv_transactions"
Transaction = {
  id: string,        // crypto.randomUUID()
  name: string,
  amount: number,     // always positive
  category: string,   // "Food" | "Transport" | "Fun" | custom
  type: "expense" | "income",
  createdAt: number   // Date.now(), used for default ordering
}
```

State module (`js/app.js`) keeps a single in-memory array `state.transactions`
as the source of truth. Every mutation (`addTransaction`, `deleteTransaction`)
follows the same cycle:

1. Mutate `state.transactions`
2. `saveToStorage()` → `localStorage.setItem('ebv_transactions', JSON.stringify(...))`
3. `render()` → re-renders balance, list, and chart from current state

This keeps storage, UI, and chart from ever drifting out of sync.

## Component Breakdown
- **Balance Card**: `#totalBalance` — recomputed as
  `sum(income) - sum(expense)` on every render.
- **Transaction Form**: `#transactionForm` — HTML5 required fields +
  manual JS validation guard before mutating state.
- **Transaction List**: `#transactionList` — `max-height` + `overflow-y:auto`
  scroll region; each row rendered from a template string with a delete button
  bound via event delegation (single listener on the list container).
- **Chart**: `#categoryChart` — Chart.js pie chart, category totals computed
  via `reduce()` over expense-type transactions, colors mapped per category
  in a `CATEGORY_COLORS` lookup (with a fallback palette for custom categories).

## Visual Design Tokens
- Palette: near-black base `#0B0D10`, elevated surface `#14171C`, border
  `#22262C`, primary text `#F4F5F6`, muted text `#8A9099`, accent gradient
  `#FF7A00 → #FF5500` (matches the user's existing OUTRENT brand accent),
  category colors: Food `#34D399`, Transport `#38BDF8`, Fun `#FF7A00`,
  custom categories cycle through a fixed 6-color palette.
- Type: display/headings `Space Grotesk`, body/UI `Inter`.
- Layout: mobile-first single column; balance card top, form second,
  list + chart as a two-column grid on tablet/desktop (≥720px).

## Optional Challenges Implemented (3 of 5)
1. Custom categories — "+ Add category" option in the category select.
2. Sort transactions — sort control (Newest, Amount ↑/↓, Category A–Z).
3. Dark/Light mode toggle — CSS variables swapped via a `data-theme`
   attribute on `<html>`, preference persisted to `localStorage`.

## Error Handling
- Empty/invalid field submission → inline error text under the field,
  submit blocked, no state mutation.
- Empty transaction list → empty-state illustration/message instead of an
  empty scroll box.
- No expense data → chart renders a neutral placeholder ring instead of
  a blank canvas.
