# Requirements Document

## Introduction

The Expense & Budget Visualizer (EBV) is a mobile-first, client-side web application built as a 5-day Coding Camp MVP. It lets users track daily spending by entering transactions with a name, amount, and category. The app displays a running total balance, a scrollable transaction history, and a live pie chart of spending by category. All data is stored in the browser's Local Storage — no backend or authentication required. The app ships as a single HTML page, one CSS file, and one JavaScript file, using Chart.js for the chart.

---

## Glossary

- **App**: The Expense & Budget Visualizer web application running in the browser.
- **Transaction**: A single record of an expense or income entry, containing an item name, a positive numeric amount, a type (expense or income), and a category.
- **Expense**: A Transaction whose type is "expense"; it reduces the Total Balance.
- **Income**: A Transaction whose type is "income"; it increases the Total Balance.
- **Category**: A label attached to a Transaction. The built-in categories are Food, Transport, and Fun. Users may also define custom categories.
- **Custom_Category**: A user-defined Category that extends the built-in set.
- **Total_Balance**: The running sum of all income amounts minus all expense amounts across all Transactions currently in storage.
- **Transaction_List**: The scrollable UI panel that displays all Transactions in the chosen sort order.
- **Input_Form**: The UI panel containing the fields and submit button used to create a new Transaction.
- **Chart**: The pie chart rendered by Chart.js that visualises total expense amounts grouped by Category.
- **Storage**: The browser's `localStorage` API used as the sole persistence layer.
- **Theme**: The active colour scheme of the App — either "dark" or "light".
- **Sort_Order**: The user-selected ordering applied to the Transaction_List (newest-first, amount descending, amount ascending, or category A–Z).
- **Validator**: The client-side logic inside `js/app.js` that checks Input_Form fields before a Transaction is created.
- **Pretty_Printer**: The `formatMoney` function inside `js/app.js` that formats a numeric amount as a currency string (e.g. `$12.50`).

---

## Requirements

### Requirement 1: Input Form

**User Story:** As a user, I want to fill in a form with an item name, amount, type, and category, so that I can record a new transaction quickly.

#### Acceptance Criteria

1. THE Input_Form SHALL contain a text field for item name (maximum 100 characters), a numeric field for amount, a type selector (expense / income), and a category selector.
2. THE Input_Form SHALL display Food, Transport, and Fun as the default selectable categories, with a "+ Add category…" option as the last entry.
3. WHEN the user submits the Input_Form with all fields filled and valid, THE App SHALL create a new Transaction — containing the trimmed item name, the amount rounded to two decimal places, the selected type, and the resolved category — and add it to Storage.
4. WHEN the user submits the Input_Form with the item name field empty or containing only whitespace, THE Validator SHALL display the error message "Item name is required." adjacent to the item name field and prevent Transaction creation.
5. WHEN the user submits the Input_Form with the amount field empty, set to a value less than 0.01, or set to a value greater than 999,999,999.99, THE Validator SHALL display the error message "Enter an amount greater than 0." adjacent to the amount field and prevent Transaction creation.
6. WHEN the user submits the Input_Form with no category resolved (custom category chosen but custom input left blank or containing only whitespace), THE Validator SHALL display the error message "Category is required." adjacent to the category field and prevent Transaction creation.
7. WHEN a Transaction is successfully created, THE Input_Form SHALL reset all fields to their default values and return focus to the item name field. Note: field reset and focus return are independent operations — if focus return fails, the field reset still applies, and vice versa.

---

### Requirement 2: Custom Categories

**User Story:** As a user, I want to add my own category names beyond the built-in three, so that I can organise spending in a way that fits my lifestyle.

#### Acceptance Criteria

1. THE Input_Form SHALL include a "+ Add category…" option as the last entry in the category selector.
2. WHEN the user selects "+ Add category…" from the category selector, THE Input_Form SHALL reveal a text input field for entering a Custom_Category name and move focus to that field.
3. THE Custom_Category text input field SHALL accept between 1 and 32 non-whitespace-only characters (trimmed before use).
4. WHEN the user submits the Input_Form with the custom category field empty or containing only whitespace, THE Validator SHALL display the error message "Category is required." and prevent Transaction creation.
5. WHEN the user successfully submits a Transaction with a Custom_Category, THE App SHALL add that Custom_Category as a selectable option in the category selector for the remainder of the session.
6. WHEN a Transaction with a Custom_Category is loaded from Storage on page load, THE App SHALL restore that Custom_Category as a selectable option in the category selector, with duplicates deduplicated so each unique Custom_Category name appears exactly once.
7. WHEN the user selects any built-in category from the category selector, THE Input_Form SHALL hide the Custom_Category text input field and clear its value.

---

### Requirement 3: Transaction List

**User Story:** As a user, I want to see all my transactions in a scrollable list, so that I can review my spending history at a glance.

#### Acceptance Criteria

1. THE Transaction_List SHALL display each Transaction's item name (truncated to 40 characters with an ellipsis if longer), amount formatted to exactly two decimal places (prefixed with "+" for income and "−" for expense), and category label.
2. WHILE the Transaction_List contains no Transactions, THE App SHALL display the empty-state message "No transactions yet — add your first one." and hide the list element.
3. WHEN the Transaction_List contains more items than fit in its visible height (320 px), THE Transaction_List SHALL become vertically scrollable without expanding the panel.
4. THE Transaction_List SHALL render expense amounts in the danger colour and income amounts in the success colour.
5. WHEN a Transaction is added or deleted, THE App SHALL re-render the Transaction_List immediately without a page reload.

---

### Requirement 4: Delete Transaction

**User Story:** As a user, I want to delete a transaction from the list, so that I can correct mistakes or remove outdated entries.

#### Acceptance Criteria

1. THE Transaction_List SHALL render a Delete button on every Transaction row, with a minimum touch target size of 44×44 CSS pixels.
2. WHEN the user activates the Delete button on a Transaction row, THE App SHALL display a confirmation prompt before removing the Transaction.
3. WHEN the user confirms deletion, THE App SHALL remove that Transaction from Storage first; only after the Storage write succeeds SHALL THE App re-render the Transaction_List, Total_Balance, and Chart without a page reload, so the deleted Transaction no longer appears in any of those three views.
4. IF the user dismisses the confirmation prompt without confirming, THEN THE App SHALL NOT remove the Transaction from Storage or modify any persistent data.
5. IF writing to Storage fails during deletion, THEN THE App SHALL display a visible error indication to the user and leave the Transaction and all views unchanged.

---

### Requirement 5: Total Balance

**User Story:** As a user, I want to see my current total balance at the top of the page, so that I always know my net financial position.

#### Acceptance Criteria

1. THE App SHALL display the Total_Balance in a prominently styled card positioned before all other content sections in DOM order.
2. THE Pretty_Printer SHALL format the Total_Balance as a dollar-prefixed value with exactly two decimal places and half-up rounding (e.g. `$0.00`, `$42.50`, `-$12.30`).
3. WHEN a Transaction is added or deleted, THE App SHALL recalculate and re-render the Total_Balance within the same user interaction cycle without a page reload.
4. WHEN the Total_Balance is strictly less than zero, THE App SHALL render the value in the danger colour.
5. WHEN the Total_Balance is greater than or equal to zero, THE App SHALL render the value using the orange accent gradient.
6. IF Storage is unavailable on page load, THEN THE App SHALL display `$0.00` as the Total_Balance and render it using the orange accent gradient.

---

### Requirement 6: Spending Chart

**User Story:** As a user, I want to see a pie chart of my spending by category, so that I can understand where my money is going visually.

#### Acceptance Criteria

1. THE Chart SHALL be a pie chart rendered using Chart.js where each segment represents the sum of amounts of all Expense Transactions sharing the same Category.
2. THE Chart SHALL assign a distinct, consistent colour to each Category (Food → `#34D399`, Transport → `#38BDF8`, Fun → `#FF7A00`; Custom_Categories receive colours from a fixed fallback palette of at least 10 colours, cycling from the start when all palette entries are exhausted).
3. WHEN a Transaction is added or deleted, THE App SHALL update the Chart within 100 milliseconds without a page reload.
4. WHILE the Transaction_List contains no Expense Transactions, THE App SHALL display the message "Add an expense to see your breakdown.", hide the chart canvas, and hide the legend. The chart canvas and legend SHALL be hidden only after the deletion of the last Expense Transaction is complete, not during deletion processing.
5. WHILE the Transaction_List contains at least one Expense Transaction, THE App SHALL render a legend below the Chart listing each Category name alongside its corresponding colour dot.
6. WHEN the user hovers over a Chart segment, THE Chart SHALL display a tooltip showing the Category name and its total amount formatted by the Pretty_Printer (e.g. `Food: $24.00`).
7. WHEN the last Expense Transaction belonging to a Category is deleted, THE App SHALL remove that Category's segment and its legend entry from the Chart.

---

### Requirement 7: Local Storage Persistence

**User Story:** As a user, I want my transactions to survive a page refresh, so that I do not have to re-enter data every session.

#### Acceptance Criteria

1. WHEN a Transaction is created or deleted, THE App SHALL write the full updated transactions array (up to 10,000 entries) to Storage under the key `ebv_transactions`.
2. WHEN the App initialises, THE App SHALL read the transactions array from Storage under the key `ebv_transactions` and restore all valid Transactions before the first render.
3. IF Storage is unavailable or the stored value under `ebv_transactions` cannot be parsed as a valid JSON array, THEN THE App SHALL initialise with an empty transactions array and log an error message including the failure reason to the browser console.
4. WHEN loading Transactions from Storage, IF an individual entry is missing required fields (id, name, amount, type, or category), THEN THE App SHALL discard that entry and continue loading the remaining entries, logging the discarded entry to the browser console.

---

### Requirement 8: Sort Transactions

**User Story:** As a user, I want to sort the transaction list by different criteria, so that I can find entries quickly.

#### Acceptance Criteria

1. THE Transaction_List panel SHALL include a sort selector offering the options: Newest, Amount ↓, Amount ↑, and Category A–Z, with "Newest" selected by default on page load.
2. WHEN the user changes the Sort_Order selector, THE App SHALL re-render the Transaction_List in the selected Sort_Order within 100 milliseconds without a page reload.
3. WHILE Sort_Order is "Newest", THE Transaction_List SHALL display Transactions ordered by creation timestamp descending (most recently added first).
4. WHILE Sort_Order is "Amount ↓", THE Transaction_List SHALL display Transactions ordered by absolute amount descending; Transactions with equal amounts SHALL be ordered by creation timestamp descending.
5. WHILE Sort_Order is "Amount ↑", THE Transaction_List SHALL display Transactions ordered by absolute amount ascending; Transactions with equal amounts SHALL be ordered by creation timestamp descending.
6. WHILE Sort_Order is "Category A–Z", THE Transaction_List SHALL display Transactions ordered alphabetically by category name using case-insensitive comparison; Transactions with equal category names SHALL be ordered by creation timestamp descending.
7. WHEN a Transaction is added or deleted, THE App SHALL re-render the Transaction_List in the currently active Sort_Order.

---

### Requirement 9: Dark / Light Mode Toggle

**User Story:** As a user, I want to switch between dark and light mode, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE App SHALL default to dark mode on first load unless the browser's `prefers-color-scheme` media query resolves to `light` and no value is stored in `localStorage` under the key `ebv_theme`.
2. THE App SHALL display a toggle button in the header that switches the Theme between dark and light, and whose visible label or icon reflects the currently active Theme.
3. WHEN the user activates the theme toggle, THE App SHALL apply the new Theme to the page within 100 ms without a page reload.
4. WHEN the user activates the theme toggle, THE App SHALL persist the selected Theme in `localStorage` under the key `ebv_theme`.
5. WHEN the App initialises, IF no value is stored in `localStorage` under the key `ebv_theme`, THE App SHALL skip the localStorage theme logic entirely and fall back to `prefers-color-scheme` to determine the initial Theme. IF a value is stored under `ebv_theme`, THE App SHALL read it and apply it before any page content is painted, overriding the browser's `prefers-color-scheme` preference.
6. WHEN the Theme is changed, THE App SHALL update the Chart's segment border colour to the background colour of the page surface in the new Theme, so that segment borders are not visually distinguishable from the surrounding surface.

---

### Requirement 10: File Structure

**User Story:** As a developer, I want the codebase to follow the camp's folder rules, so that the project is easy to review and grade.

#### Acceptance Criteria

1. THE App SHALL contain exactly one CSS file located at `css/style.css`; no other `.css` files shall exist anywhere in the project tree.
2. THE App SHALL contain exactly one JavaScript file located at `js/app.js`; no other `.js` files shall exist outside the `vendor/` directory.
3. THE App SHALL load Chart.js from `vendor/chart.umd.js` as a local file; no `<script>` or `<link>` tag shall reference an `http://` or `https://` URL for Chart.js.
4. THE App SHALL declare all HTML structure in a single `index.html` at the project root; no other `.html` files shall exist anywhere in the project tree.

---

### Requirement 11: Cross-Browser and Responsive Layout

**User Story:** As a user, I want the app to work correctly on my phone and on desktop browsers, so that I can use it wherever I am.

#### Acceptance Criteria

1. THE App SHALL render correctly in current stable releases of Chrome, Firefox, Edge, and Safari, where "correctly" means no overlapping elements, no clipped text, and all controls operable.
2. THE App SHALL use a single-column layout on viewports narrower than 760 px (mobile-first), stacking sections vertically in the order: Input_Form → Transaction_List → Chart.
3. WHEN the viewport width is 760 px or wider, THE App SHALL switch to a two-column grid layout placing the Transaction_List and Chart side by side below the Input_Form.
4. THE App SHALL remain fully usable on a viewport as narrow as 320 px, with no horizontal scrollbar, no clipped text, and all interactive elements meeting a minimum 44×44 CSS px touch target size.
5. THE App SHALL render without visual distortion on high-DPI displays up to 3× device pixel ratio.

---

### Requirement 12: Performance and Accessibility

**User Story:** As a user, I want the app to feel fast and be easy to navigate, so that adding and reviewing transactions does not feel like a chore.

#### Acceptance Criteria

1. WHEN a Transaction is added or deleted, THE App SHALL complete each individual DOM update (Total_Balance, Transaction_List, and chart) within 200 ms as measured from the triggering user interaction to the final paint for that element; the three updates need not all finish simultaneously, but each one individually SHALL complete within 200 ms, using no deferred or asynchronous rendering.
2. THE App SHALL use semantic HTML elements (`<header>`, `<main>`, `<section>`, `<form>`, `<ul>`, `<li>`, `<button>`) to convey document structure.
3. THE Total_Balance display region SHALL carry the `aria-live="polite"` attribute so screen readers announce balance changes without interrupting ongoing speech.
4. THE App SHALL provide a visible focus indicator of at least 2 px solid outline on all interactive elements (inputs, selects, buttons), and SHALL NOT suppress the default focus outline unless an equivalent visible replacement is present.
5. THE App SHALL insert all user-supplied text into the DOM as plain text nodes, so that no user-supplied content is parsed or rendered as HTML markup or executable script.
