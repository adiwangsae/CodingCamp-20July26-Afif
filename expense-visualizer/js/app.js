(function () {
  'use strict';

  /* ===== Constants ===== */
  const STORAGE_KEY = 'ebv_transactions';
  const THEME_KEY = 'ebv_theme';

  const CATEGORY_COLORS = {
    Food: '#34D399',
    Transport: '#38BDF8',
    Fun: '#FF7A00'
  };
  const FALLBACK_PALETTE = ['#A78BFA', '#F472B6', '#FBBF24', '#4ADE80', '#60A5FA', '#FB7185'];

  /* ===== DOM refs ===== */
  const form = document.getElementById('transactionForm');
  const itemNameInput = document.getElementById('itemName');
  const amountInput = document.getElementById('amount');
  const typeSelect = document.getElementById('type');
  const categorySelect = document.getElementById('category');
  const customCategoryInput = document.getElementById('customCategory');
  const sortSelect = document.getElementById('sortSelect');

  const totalBalanceEl = document.getElementById('totalBalance');
  const listEl = document.getElementById('transactionList');
  const emptyStateEl = document.getElementById('emptyState');
  const chartEmptyStateEl = document.getElementById('chartEmptyState');
  const legendEl = document.getElementById('chartLegend');
  const themeToggleBtn = document.getElementById('themeToggle');
  const canvas = document.getElementById('categoryChart');
  const errorBanner = document.getElementById('errorBanner');
  const errorBannerMsg = document.getElementById('errorBannerMsg');

  /* ===== Error banner ===== */
  let errorBannerTimer = null;

  function showError(message) {
    errorBannerMsg.textContent = message;
    errorBanner.classList.remove('hidden');
    clearTimeout(errorBannerTimer);
    errorBannerTimer = setTimeout(hideError, 5000);
  }

  function hideError() {
    errorBanner.classList.add('hidden');
    errorBannerMsg.textContent = '';
  }

  document.getElementById('errorBanner')
    .querySelector('.error-banner__close')
    .addEventListener('click', hideError);

  /* ===== State ===== */
  let state = {
    transactions: loadFromStorage(),
    sort: 'newest',
    customCategoryColors: {}
  };

  let chartInstance = null;

  /* ===== Storage ===== */
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error('Failed to read transactions from storage', e);
      return [];
    }
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.transactions));
  }

  /* ===== Helpers ===== */
  function uid() {
    return (crypto.randomUUID) ? crypto.randomUUID() : 'txn_' + Date.now() + '_' + Math.random().toString(16).slice(2);
  }

  function formatMoney(n) {
    const sign = n < 0 ? '-' : '';
    return sign + '$' + Math.abs(n).toFixed(2);
  }

  function colorForCategory(category) {
    if (CATEGORY_COLORS[category]) return CATEGORY_COLORS[category];
    if (!state.customCategoryColors[category]) {
      const used = Object.keys(state.customCategoryColors).length;
      state.customCategoryColors[category] = FALLBACK_PALETTE[used % FALLBACK_PALETTE.length];
    }
    return state.customCategoryColors[category];
  }

  /* ===== Validation ===== */
  function clearErrors() {
    document.querySelectorAll('.field__error').forEach(el => el.textContent = '');
    [itemNameInput, amountInput, categorySelect].forEach(el => el.classList.remove('is-invalid'));
  }

  function setError(fieldName, message) {
    const el = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (el) el.textContent = message;
  }

  function validate(name, amount, category) {
    clearErrors();
    let valid = true;

    if (!name) {
      setError('itemName', 'Item name is required.');
      itemNameInput.classList.add('is-invalid');
      valid = false;
    }
    if (amount === '' || amount === null || isNaN(amount) || Number(amount) <= 0 || Number(amount) > 999999999.99) {
      setError('amount', 'Enter an amount greater than 0.');
      amountInput.classList.add('is-invalid');
      valid = false;
    }
    if (!category) {
      setError('category', 'Category is required.');
      categorySelect.classList.add('is-invalid');
      valid = false;
    }
    return valid;
  }

  /* ===== Mutations ===== */
  function addTransaction(name, amount, type, category) {
    state.transactions.push({
      id: uid(),
      name,
      amount: Math.abs(Number(amount)),
      type,
      category,
      createdAt: Date.now()
    });
    try {
      saveToStorage();
    } catch (e) {
      console.error('Failed to save transaction', e);
      showError('Could not save — storage may be full.');
    }
    render();
  }

  function deleteTransaction(id) {
    if (!window.confirm('Delete this transaction?')) return;

    const previous = state.transactions;               // keep reference for rollback
    state.transactions = state.transactions.filter(t => t.id !== id);

    try {
      saveToStorage();
    } catch (e) {
      state.transactions = previous;                   // abort: restore original state
      showError('Could not save changes — transaction was not deleted.');
      return;                                          // do NOT call render()
    }

    render();
  }

  /* ===== Category select (custom category support) ===== */
  categorySelect.addEventListener('change', () => {
    if (categorySelect.value === '__custom__') {
      customCategoryInput.classList.remove('hidden');
      customCategoryInput.focus();
    } else {
      customCategoryInput.classList.add('hidden');
      customCategoryInput.value = '';
    }
  });

  function ensureCategoryOption(category) {
    const exists = Array.from(categorySelect.options).some(o => o.value === category);
    if (!exists) {
      const opt = document.createElement('option');
      opt.value = category;
      opt.textContent = category;
      categorySelect.insertBefore(opt, categorySelect.querySelector('option[value="__custom__"]'));
    }
  }

  /* ===== Form submit ===== */
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = amountInput.value;
    const type = typeSelect.value;
    let category = categorySelect.value;

    if (category === '__custom__') {
      category = customCategoryInput.value.trim();
      if (category.length > 32) {
        clearErrors();
        setError('category', 'Category is required.');
        categorySelect.classList.add('is-invalid');
        return;
      }
    }

    if (!validate(name, amount, category)) return;

    ensureCategoryOption(category);
    addTransaction(name, amount, type, category);

    form.reset();
    typeSelect.value = 'expense';
    categorySelect.value = category === 'Food' || category === 'Transport' || category === 'Fun' ? 'Food' : categorySelect.value;
    categorySelect.selectedIndex = 0;
    customCategoryInput.classList.add('hidden');
    customCategoryInput.value = '';
    itemNameInput.focus();
  });

  /* ===== Delete via event delegation ===== */
  listEl.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-delete');
    if (!btn) return;
    deleteTransaction(btn.dataset.id);
  });

  /* ===== Sorting ===== */
  sortSelect.addEventListener('change', () => {
    state.sort = sortSelect.value;
    render();
  });

  function getSortedTransactions() {
    const list = [...state.transactions];
    switch (state.sort) {
      case 'amount-desc':
        return list.sort((a, b) => b.amount - a.amount || b.createdAt - a.createdAt);
      case 'amount-asc':
        return list.sort((a, b) => a.amount - b.amount || b.createdAt - a.createdAt);
      case 'category':
        return list.sort((a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: 'base' }) || b.createdAt - a.createdAt);
      case 'newest':
      default:
        return list.sort((a, b) => b.createdAt - a.createdAt);
    }
  }

  /* ===== Rendering ===== */
  function renderBalance() {
    const total = state.transactions.reduce((sum, t) => {
      return sum + (t.type === 'income' ? t.amount : -t.amount);
    }, 0);
    totalBalanceEl.textContent = formatMoney(total);
    totalBalanceEl.classList.toggle('is-negative', total < 0);
  }

  function renderList() {
    const items = getSortedTransactions();
    listEl.innerHTML = '';

    if (items.length === 0) {
      emptyStateEl.classList.remove('hidden');
      listEl.classList.add('hidden');
      return;
    }
    emptyStateEl.classList.add('hidden');
    listEl.classList.remove('hidden');

    const frag = document.createDocumentFragment();
    items.forEach(t => {
      const li = document.createElement('li');
      li.className = 'transaction-row';
      li.innerHTML = `
        <div class="transaction-row__info">
          <span class="transaction-row__name">${escapeHtml(t.name)}</span>
          <span class="transaction-row__tag">${escapeHtml(t.category)}</span>
        </div>
        <div class="transaction-row__right">
          <span class="transaction-row__amount ${t.type}">${t.type === 'income' ? '+' : '−'}${formatMoney(t.amount)}</span>
          <button class="btn-delete" data-id="${t.id}" type="button">Delete</button>
        </div>
      `;
      frag.appendChild(li);
    });
    listEl.appendChild(frag);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function getCategoryTotals() {
    const totals = {};
    state.transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        totals[t.category] = (totals[t.category] || 0) + t.amount;
      });
    return totals;
  }

  function renderChart() {
    const totals = getCategoryTotals();
    const categories = Object.keys(totals);

    if (categories.length === 0) {
      chartEmptyStateEl.classList.remove('hidden');
      canvas.classList.add('hidden');
      legendEl.innerHTML = '';
      if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
      }
      return;
    }

    chartEmptyStateEl.classList.add('hidden');
    canvas.classList.remove('hidden');

    const values = categories.map(c => totals[c]);
    const colors = categories.map(c => colorForCategory(c));

    if (chartInstance) {
      chartInstance.data.labels = categories;
      chartInstance.data.datasets[0].data = values;
      chartInstance.data.datasets[0].backgroundColor = colors;
      chartInstance.update();
    } else {
      chartInstance = new Chart(canvas, {
        type: 'pie',
        data: {
          labels: categories,
          datasets: [{
            data: values,
            backgroundColor: colors,
            borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim(),
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${formatMoney(ctx.parsed)}`
              }
            }
          }
        }
      });
    }

    legendEl.innerHTML = categories.map(c => `
      <li><span class="dot" style="background:${colorForCategory(c)}"></span>${escapeHtml(c)}</li>
    `).join('');
  }

  function render() {
    renderBalance();
    renderList();
    renderChart();
  }

  /* ===== Theme toggle ===== */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (chartInstance) {
      chartInstance.data.datasets[0].borderColor = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
      chartInstance.update();
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  (function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else {
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      applyTheme(prefersLight ? 'light' : 'dark');
    }
  })();

  /* ===== Init ===== */
  // Re-create any custom categories from stored transactions as select options
  state.transactions.forEach(t => ensureCategoryOption(t.category));
  render();
})();
