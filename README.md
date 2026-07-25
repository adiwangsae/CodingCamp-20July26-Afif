# Expense & Budget Visualizer

Mobile-friendly, client-side expense tracker built with vanilla HTML/CSS/JS.
No backend — all data lives in the browser's `localStorage`.

## Features
- Add transactions (name, amount, type, category) with validation
- Scrollable transaction list with delete
- Auto-updating total balance
- Pie chart of spending by category (Chart.js)
- Custom categories
- Sort by newest / amount / category
- Dark / light mode toggle (persisted)

## Run locally
No build step needed — just open `index.html` in a browser, or serve the
folder with any static server, e.g.:

```bash
npx serve .
```

## Folder structure
```
index.html
css/style.css
js/app.js
.kiro/specs/expense-budget-visualizer/   # requirements, design, tasks
.kiro/steering/product.md                # product steering doc
```

## Deploy
1. Push this folder to a GitHub repo named
   `CodingCamp-[batchdate ddmmyy]-[participantname]`.
2. Enable GitHub Pages on the repo (Settings → Pages → deploy from `main`).
3. Submit AWS Builder ID + repo URL + Pages URL via the Paperform link.
