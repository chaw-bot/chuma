import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js';
import {
  getAuth,
  getIdTokenResult,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js';
import {
  collection,
  collectionGroup,
  onSnapshot,
} from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyAb1aSDCkyxJd6lkLJ4JzRgmtOL-QxA9J4',
  authDomain: 'chuma-26.firebaseapp.com',
  projectId: 'chuma-26',
  storageBucket: 'chuma-26.firebasestorage.app',
  messagingSenderId: '854743456929',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const root = document.querySelector('#app');

const state = {
  activeView: 'dashboard',
  currentUser: null,
  isAdmin: false,
  authReady: false,
  goals: [],
  expenses: [],
  logs: [],
  notifications: [],
  profiles: [],
  search: '',
  transactions: [],
  filters: {
    goalCategory: 'all',
    logDate: '',
    logLevel: 'all',
    transactionDate: '',
    transactionStatus: 'all',
    transactionType: 'all',
    userStatus: 'all',
  },
};

let unsubscribeData = [];

const moneyFormatter = new Intl.NumberFormat('en-ZM', {
  maximumFractionDigits: 0,
});

const compactMoneyFormatter = new Intl.NumberFormat('en-ZM', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function selected(currentValue, optionValue) {
  return currentValue === optionValue ? 'selected' : '';
}

function setMessage(id, text, tone = '') {
  const node = document.querySelector(`#${id}`);
  if (!node) return;
  node.textContent = text;
  node.className = `message ${tone}`.trim();
}

function formatNumber(value) {
  return moneyFormatter.format(Number(value) || 0);
}

function formatAmount(value) {
  return compactMoneyFormatter.format(Number(value) || 0);
}

function formatDate(value, withTime = false) {
  if (!value) return 'Not set';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return 'Not set';
  const datePart = date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  if (!withTime) return datePart;
  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} ${timePart}`;
}

function toDate(value) {
  return typeof value?.toDate === 'function' ? value.toDate() : new Date(value);
}

function dateInputValue(value) {
  if (!value) return '';
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getOwnerId(snapshotDoc) {
  return snapshotDoc.ref.parent.parent?.id ?? 'unknown';
}

function normalizeSnapshot(snapshot, ownerField = 'userId') {
  return snapshot.docs.map((snapshotDoc) => ({
    id: snapshotDoc.id,
    [ownerField]: getOwnerId(snapshotDoc),
    ...snapshotDoc.data(),
  }));
}

function initials(nameOrEmail) {
  const text = String(nameOrEmail || 'Admin User').trim();
  const words = text.includes('@') ? ['Admin', 'User'] : text.split(/\s+/);
  return `${words[0]?.[0] ?? 'A'}${words[1]?.[0] ?? 'U'}`.toUpperCase();
}

function providerLabel(provider) {
  const value = String(provider ?? '').toLowerCase();
  if (value.includes('airtel')) return 'Airtel Money';
  if (value.includes('zamtel')) return 'Zamtel Kwacha';
  if (value.includes('mtn')) return 'MTN MoMo';
  return provider || '';
}

function getUsers() {
  const users = new Map();

  state.profiles.forEach((profile) => {
    users.set(profile.userId, {
      email: profile.email ?? '',
      fullName: profile.fullName ?? '',
      joinedAt: profile.createdAt ?? profile.joinedAt,
      phoneNumber: profile.phoneNumber ?? '',
      provider: profile.provider ?? '',
      userId: profile.userId,
    });
  });

  [...state.goals, ...state.expenses, ...state.notifications].forEach((item) => {
    if (!users.has(item.userId)) {
      users.set(item.userId, { userId: item.userId });
    }
  });

  return [...users.values()]
    .sort((a, b) => {
      const dateCompare = String(a.joinedAt ?? '').localeCompare(String(b.joinedAt ?? ''));
      return dateCompare || String(a.userId ?? '').localeCompare(String(b.userId ?? ''));
    })
    .map((user, index) => {
      const goals = state.goals.filter((goal) => goal.userId === user.userId);
      const expenses = state.expenses.filter((expense) => expense.userId === user.userId);
      const saved = goals.reduce((sum, goal) => sum + (Number(goal.currentAmount) || 0), 0);
      const spent = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
      const status = user.phoneNumber ? 'active' : 'pending';
      return {
        ...user,
        code: `U-${String(index + 1).padStart(4, '0')}`,
        goals: goals.length,
        provider: providerLabel(user.provider),
        saved,
        spent,
        status,
      };
    });
}

function getUserById(userId) {
  return getUsers().find((user) => user.userId === userId) ?? { userId, code: 'U000' };
}

function getTransactions() {
  const rows = state.transactions?.length
    ? state.transactions.map((transaction) => {
      const user = getUserById(transaction.userId);
      return {
        amount: Number(transaction.amount) || 0,
        createdAt: transaction.createdAt,
        goalName: transaction.goalName ?? transaction.goal ?? transaction.category ?? '',
        id: transaction.id,
        phone: transaction.phone ?? user.phoneNumber ?? '',
        provider: transaction.provider ?? user.provider ?? '',
        reference: transaction.reference ?? transaction.sandboxReference ?? transaction.id,
        status: transaction.status ?? 'success',
        type: transaction.type ?? 'manual',
        userName: transaction.userName ?? user.fullName ?? user.phoneNumber ?? transaction.userId,
      };
    })
    : [
      ...state.goals
        .filter((goal) => goal.autoSaveAmount)
        .map((goal) => {
          const user = getUserById(goal.userId);
          return {
            amount: Number(goal.autoSaveAmount) || 0,
            createdAt: goal.autoSaveCreatedAt ?? goal.createdAt,
            goalName: goal.name,
            id: `goal-${goal.id}`,
            phone: user.phoneNumber,
            provider: user.provider,
            reference: '',
            status: goal.autoSaveActive === false ? 'failed' : 'success',
            type: goal.autoSaveActive === false ? 'missed' : 'deduction',
            userName: user.fullName || user.phoneNumber || user.userId,
          };
        }),
      ...state.expenses.map((expense) => {
        const user = getUserById(expense.userId);
        return {
          amount: Number(expense.amount) || 0,
          createdAt: expense.createdAt,
          goalName: expense.description || expense.category,
          id: `expense-${expense.id}`,
          phone: user.phoneNumber,
          provider: user.provider,
          reference: '',
          status: 'success',
          type: 'manual',
          userName: user.fullName || user.phoneNumber || user.userId,
        };
      }),
    ];

  return rows
    .sort((a, b) => String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? '')))
    .map((transaction, index) => ({
      ...transaction,
      code: `T-${String(index + 1).padStart(4, '0')}`,
    }));
}

function getTopGoalCategories() {
  const byName = new Map();
  state.goals.forEach((goal) => {
    const key = goal.name || 'Savings Goal';
    const current = byName.get(key) ?? { amount: 0, name: key, users: 0 };
    current.amount += Number(goal.currentAmount) || 0;
    current.users += 1;
    byName.set(key, current);
  });
  return [...byName.values()]
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);
}

function renderAuth() {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-panel">
        <p class="eyebrow">Chuma Admin</p>
        <h1>Sign in</h1>
        <p class="muted">Use an admin Firebase Auth account to manage users, goals, transactions, and logs.</p>
        <form id="login-form" class="form">
          <label>Email<input id="email" type="email" autocomplete="email" required /></label>
          <label>Password<input id="password" type="password" autocomplete="current-password" required /></label>
          <button type="submit">Sign in</button>
          <p id="auth-message" class="message" role="status"></p>
        </form>
      </div>
    </section>
  `;

  document.querySelector('#login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    setMessage('auth-message', 'Signing in...');

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setMessage('auth-message', error.message, 'error');
    }
  });
}

function renderDenied() {
  root.innerHTML = `
    <section class="auth-shell">
      <div class="auth-panel">
        <p class="eyebrow">Chuma Admin</p>
        <h1>Admin access required</h1>
        <p class="muted">Your account is signed in, but it does not have the Firebase custom claim <strong>admin: true</strong>.</p>
        <button id="logout">Sign out</button>
      </div>
    </section>
  `;
  document.querySelector('#logout').addEventListener('click', () => signOut(auth));
}

function renderShell() {
  const userEmail = state.currentUser?.email ?? 'admin@chuma.com';
  const userInitials = initials(userEmail);

  root.innerHTML = `
    <div class="admin-layout">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">C</div>
          <strong>Chuma</strong>
        </div>
        <nav class="sidebar-nav">
          ${renderNavButton('dashboard', 'Dashboard')}
          ${renderNavButton('users', 'Users')}
          ${renderNavButton('transactions', 'Transactions')}
          ${renderNavButton('goals', 'Savings Goals')}
          ${renderNavButton('logs', 'System Logs')}
        </nav>
        <div class="sidebar-account">
          <div class="account-row">
            <div class="avatar">${escapeHtml(userInitials)}</div>
            <div>
              <p class="account-name">Admin User</p>
              <p class="account-email">${escapeHtml(userEmail)}</p>
            </div>
          </div>
          <button id="logout" class="logout-button">Logout</button>
        </div>
      </aside>
      <section class="page">
        <header class="topbar">
          <div class="search-shell">
            <input id="global-search" type="search" placeholder="Search users, transactions..." value="${escapeHtml(state.search)}" />
          </div>
          <div class="top-actions">
            <span class="bell" aria-hidden="true"></span>
            <span class="top-user"><span class="avatar small">${escapeHtml(userInitials)}</span> Admin User</span>
          </div>
        </header>
        <main class="content">${renderView()}</main>
      </section>
    </div>
  `;

  document.querySelectorAll('[data-view]').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeView = button.dataset.view;
      renderShell();
    });
  });

  document.querySelector('#logout').addEventListener('click', () => signOut(auth));
  document.querySelector('#global-search').addEventListener('input', (event) => {
    state.search = event.target.value;
    renderShell();
    document.querySelector('#global-search')?.focus();
  });

  bindViewEvents();
}

function renderNavButton(id, label) {
  return `
    <button class="nav-button ${state.activeView === id ? 'active' : ''}" data-view="${id}">
      <span>${escapeHtml(label)}</span>
    </button>
  `;
}

function renderPageTitle(title, subtitle) {
  return `
    <section class="page-title">
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
    </section>
  `;
}

function renderView() {
  if (state.activeView === 'users') return renderUsers();
  if (state.activeView === 'transactions') return renderTransactions();
  if (state.activeView === 'goals') return renderGoals();
  if (state.activeView === 'logs') return renderLogs();
  return renderDashboard();
}

function renderDashboard() {
  const users = getUsers();
  const transactions = getTransactions();
  const totalSaved = state.goals.reduce((sum, goal) => sum + (Number(goal.currentAmount) || 0), 0);
  const failedDeductions = transactions.filter((item) => item.status === 'failed').length;
  const activeGoals = state.goals.filter((goal) => goal.autoSaveActive !== false).length;

  return `
    ${renderPageTitle('Dashboard', new Date().toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      weekday: 'long',
      year: 'numeric',
    }))}
    <section class="metrics">
      ${renderMetric('Total Registered Users', formatNumber(users.length), '', true)}
      ${renderMetric('Total Amount Saved (ZMW)', formatAmount(totalSaved), '', true)}
      ${renderMetric('Failed Deductions This Month', formatNumber(failedDeductions), '', true)}
      ${renderMetric('Active Savings Goals', formatNumber(activeGoals), '', true)}
    </section>
    <section class="dashboard-grid">
      <div class="panel table-card">
        <div class="panel pad" style="box-shadow:none;border:0;padding-bottom:16px;"><h2>Recent Activity</h2></div>
        ${renderRecentActivityTable(transactions.slice(0, 6))}
      </div>
      <div class="side-stack">
        <section class="panel pad">
          <h2>Deduction Success Rate</h2>
          <div class="donut-wrap">
            <div class="donut"></div>
            <div class="legend">
              <span><i class="dot"></i> Success 89%</span>
              <span><i class="dot red"></i> Failed 11%</span>
            </div>
          </div>
        </section>
        <section class="panel pad">
          <h2>Top Savings Goals</h2>
          <div class="goal-list">
            ${renderTopGoalList()}
          </div>
        </section>
      </div>
    </section>
  `;
}

function renderMetric(label, value, trend, featured = false) {
  return `
    <div class="metric ${featured ? 'featured' : ''}">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${trend ? `<small class="trend">^ ${escapeHtml(trend)}</small>` : ''}
    </div>
  `;
}

function renderRecentActivityTable(transactions) {
  const rows = transactions;
  return `
    <div class="table-wrap">
      <table class="compact-table">
        <thead><tr><th>User</th><th>Action</th><th>Amount<br>(ZMW)</th><th>Date/Time</th><th>Status</th></tr></thead>
        <tbody>
          ${rows.map((item) => `
            <tr>
              <td>${escapeHtml(item.userName)}</td>
              <td>${escapeHtml(titleCase(item.type))}</td>
              <td>${item.amount ? `ZMW ${formatAmount(item.amount)}` : '-'}</td>
              <td>${escapeHtml(formatDate(item.createdAt, true))}</td>
              <td>${statusPill(item.status)}</td>
            </tr>
          `).join('') || '<tr><td colspan="5" class="empty">No recent activity found.</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function renderTopGoalList() {
  const goals = getTopGoalCategories();
  const rows = goals;

  return rows.length ? rows.map((goal) => `
    <div class="goal-list-item">
      <strong>${escapeHtml(goal.name)}</strong>
      <span>${formatNumber(goal.users)} users</span>
      <b>ZMW ${formatNumber(goal.amount)}</b>
    </div>
  `).join('') : '<p class="empty">No savings goals found.</p>';
}

function renderUsers() {
  const query = state.search.toLowerCase();
  const users = getUsers().filter((user) => {
    const haystack = `${user.code} ${user.fullName ?? ''} ${user.phoneNumber ?? ''} ${user.provider ?? ''}`.toLowerCase();
    const matchesSearch = haystack.includes(query);
    const matchesStatus = state.filters.userStatus === 'all' || user.status === state.filters.userStatus;
    return matchesSearch && matchesStatus;
  });
  const rows = users;

  return `
    ${renderPageTitle('Users', 'Manage all registered Chuma users')}
    <section class="panel filters">
      <div class="search-shell"><input id="page-search" type="search" placeholder="Search by name or phone..." value="${escapeHtml(state.search)}" /></div>
      <select id="user-status-filter" aria-label="Account status">
        <option value="all" ${selected(state.filters.userStatus, 'all')}>All Statuses</option>
        <option value="active" ${selected(state.filters.userStatus, 'active')}>Active</option>
        <option value="pending" ${selected(state.filters.userStatus, 'pending')}>Pending Verification</option>
      </select>
      <button class="outline-primary" type="button">Export</button>
    </section>
    <section class="panel table-card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>User<br>ID</th><th>Full Name</th><th>Phone<br>Number</th><th>Mobile Money<br>Provider</th><th>Active<br>Goals</th><th>Total Saved<br>(ZMW)</th><th>Account Status</th><th>Joined<br>Date</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${rows.slice(0, 8).map((user) => `
              <tr>
                <td title="${escapeHtml(user.userId)}"><code>${escapeHtml(user.code)}</code></td>
                <td>${escapeHtml(user.fullName || 'Unnamed User')}</td>
                <td>${escapeHtml(user.phoneNumber || 'Not set')}</td>
                <td>${escapeHtml(user.provider || 'Not set')}</td>
                <td>${formatNumber(user.goals)}</td>
                <td>${formatNumber(user.saved)}</td>
                <td>${statusPill(user.status === 'pending' ? 'pending verification' : 'active', user.status !== 'pending')}</td>
                <td>${escapeHtml(formatDate(user.joinedAt || user.createdAt))}</td>
                <td><span class="actions"><button class="icon-action">View</button><button class="icon-action">Edit</button><button class="icon-action">Lock</button></span></td>
              </tr>
            `).join('') || '<tr><td colspan="9" class="empty">No users found.</td></tr>'}
          </tbody>
        </table>
      </div>
      ${renderPagination(`Showing ${Math.min(rows.length, 8)} of ${formatNumber(users.length)} users`, 1)}
    </section>
  `;
}

function renderTransactions() {
  const query = state.search.toLowerCase();
  const transactions = getTransactions().filter((item) => {
    const haystack = `${item.code} ${item.id} ${item.userName} ${item.phone} ${item.goalName} ${item.reference}`.toLowerCase();
    const itemStatus = String(item.status ?? '').toLowerCase();
    const itemType = String(item.type ?? '').toLowerCase();
    const matchesSearch = haystack.includes(query);
    const matchesStatus = state.filters.transactionStatus === 'all' || itemStatus === state.filters.transactionStatus;
    const matchesType = state.filters.transactionType === 'all' || itemType === state.filters.transactionType;
    const matchesDate =
      !state.filters.transactionDate ||
      dateInputValue(item.createdAt) === state.filters.transactionDate;
    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });
  const rows = transactions;
  const successCount = rows.filter((item) => item.status === 'success').length;
  const failedCount = rows.filter((item) => item.status === 'failed').length;
  const totalAmount = rows.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

  return `
    ${renderPageTitle('Transactions', 'All Chuma deduction and savings activity')}
    <section class="metrics">
      ${renderMetric('Total Transactions', formatNumber(rows.length))}
      ${renderMetric('Total Successful', formatNumber(successCount))}
      ${renderMetric('Total Failed', formatNumber(failedCount))}
      ${renderMetric('Total ZMW Processed', formatAmount(totalAmount))}
    </section>
    <section class="panel filters transactions">
      <input id="transaction-date-filter" aria-label="Date range" type="date" value="${escapeHtml(state.filters.transactionDate)}" />
      <select id="transaction-status-filter" aria-label="Status">
        <option value="all" ${selected(state.filters.transactionStatus, 'all')}>All Statuses</option>
        <option value="success" ${selected(state.filters.transactionStatus, 'success')}>Success</option>
        <option value="failed" ${selected(state.filters.transactionStatus, 'failed')}>Failed</option>
      </select>
      <select id="transaction-type-filter" aria-label="Type">
        <option value="all" ${selected(state.filters.transactionType, 'all')}>All Types</option>
        <option value="deduction" ${selected(state.filters.transactionType, 'deduction')}>Deduction</option>
        <option value="manual" ${selected(state.filters.transactionType, 'manual')}>Manual</option>
        <option value="missed" ${selected(state.filters.transactionType, 'missed')}>Missed</option>
      </select>
      <div class="search-shell"><input id="page-search" type="search" placeholder="Search by reference" value="${escapeHtml(state.search)}" /></div>
      <button type="button">Export</button>
    </section>
    <section class="panel table-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Transaction<br>ID</th><th>User</th><th>Phone</th><th>Goal</th><th>Amount<br>(ZMW)</th><th>Provider</th><th>Type</th><th>Date/Time</th><th>Sandbox<br>Reference</th><th>Status</th></tr></thead>
          <tbody>
            ${rows.slice(0, 10).map((item) => `
              <tr>
                <td title="${escapeHtml(item.id)}"><code>${escapeHtml(item.code)}</code></td>
                <td>${escapeHtml(item.userName)}</td>
                <td>${escapeHtml(item.phone || 'Not set')}</td>
                <td>${escapeHtml(item.goalName || 'Not set')}</td>
                <td>${formatAmount(item.amount)}</td>
                <td>${escapeHtml(item.provider || 'Not set')}</td>
                <td>${statusPill(item.type, item.type === 'deduction')}</td>
                <td>${escapeHtml(formatDate(item.createdAt, true))}</td>
                <td><code>${escapeHtml(item.reference)}</code></td>
                <td>${statusPill(item.status)}</td>
              </tr>
            `).join('') || '<tr><td colspan="10" class="empty">No transactions found.</td></tr>'}
          </tbody>
        </table>
      </div>
      ${renderPagination(`Showing ${Math.min(rows.length, 10)} of ${formatNumber(rows.length)} transactions`, 1)}
    </section>
  `;
}

function renderGoals() {
  const query = state.search.toLowerCase();
  const goals = state.goals.filter((goal) => {
    const user = getUserById(goal.userId);
    const haystack = `${goal.name} ${user.fullName} ${goal.category}`.toLowerCase();
    const matchesSearch = haystack.includes(query);
    const matchesCategory =
      state.filters.goalCategory === 'all' ||
      String(goal.category ?? '').toLowerCase() === state.filters.goalCategory;
    return matchesSearch && matchesCategory;
  });
  const rows = goals;
  const completed = rows.filter((goal) => Number(goal.currentAmount) >= Number(goal.targetAmount)).length;
  const paused = rows.filter((goal) => goal.autoSaveActive === false).length;
  const active = rows.length - completed - paused;

  return `
    ${renderPageTitle('Savings Goals', 'All user-created savings goals on Chuma')}
    <section class="metrics">
      ${renderMetric('Total Goals Created', formatNumber(rows.length))}
      ${renderMetric('Completed Goals', formatNumber(completed))}
      ${renderMetric('Active Goals', formatNumber(active))}
      ${renderMetric('Paused Goals', formatNumber(paused))}
    </section>
    <section class="panel filters goals">
      <div class="search-shell"><input id="page-search" type="search" placeholder="Search by owner or goal name..." value="${escapeHtml(state.search)}" /></div>
      <select id="goal-category-filter" aria-label="Category">
        <option value="all" ${selected(state.filters.goalCategory, 'all')}>All Categories</option>
        <option value="education" ${selected(state.filters.goalCategory, 'education')}>Education</option>
        <option value="emergency" ${selected(state.filters.goalCategory, 'emergency')}>Emergency</option>
        <option value="business" ${selected(state.filters.goalCategory, 'business')}>Business</option>
        <option value="housing" ${selected(state.filters.goalCategory, 'housing')}>Housing</option>
      </select>
      <button type="button">Export</button>
    </section>
    <section class="panel table-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Goal<br>ID</th><th>Owner Name</th><th>Goal Name</th><th>Target<br>(ZMW)</th><th>Current<br>(ZMW)</th><th>Progress<br>%</th><th>Frequency</th><th>Status</th><th>Created<br>Date</th></tr></thead>
          <tbody>
            ${rows.slice(0, 8).map((goal, index) => {
              const user = getUserById(goal.userId);
              const target = Number(goal.targetAmount) || 0;
              const current = Number(goal.currentAmount) || 0;
              const progress = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const status = current >= target ? 'completed' : goal.autoSaveActive === false ? 'paused' : 'active';
              return `
                <tr>
                  <td title="${escapeHtml(goal.id)}"><code>${escapeHtml(`G-${String(index + 1).padStart(4, '0')}`)}</code></td>
                  <td>${escapeHtml(user.fullName || user.phoneNumber || 'Unknown User')}</td>
                  <td>${escapeHtml(goal.name)}</td>
                  <td>${formatNumber(target)}</td>
                  <td>${formatNumber(current)}</td>
                  <td><span class="progress">${progress}%<span class="bar"><span style="width:${progress}%"></span></span></span></td>
                  <td>${escapeHtml(goal.autoSaveFrequency ? titleCase(goal.autoSaveFrequency) : 'Not set')}</td>
                  <td>${statusPill(status, status === 'active')}</td>
                  <td>${escapeHtml(formatDate(goal.createdAt))}</td>
                </tr>
              `;
            }).join('') || '<tr><td colspan="9" class="empty">No savings goals found.</td></tr>'}
          </tbody>
        </table>
      </div>
      ${renderPagination(`Showing ${Math.min(rows.length, 8)} of ${formatNumber(rows.length)} goals`, 1)}
    </section>
  `;
}

function renderLogs() {
  const query = state.search.toLowerCase();
  const rows = state.logs.filter((log) => {
    const haystack = `${log.timestamp ?? log.createdAt ?? ''} ${log.level ?? ''} ${log.module ?? ''} ${log.message ?? ''} ${log.userId ?? ''}`.toLowerCase();
    const logLevel = String(log.level ?? '').toLowerCase();
    const matchesSearch = haystack.includes(query);
    const matchesLevel = state.filters.logLevel === 'all' || logLevel === state.filters.logLevel;
    const matchesDate =
      !state.filters.logDate ||
      dateInputValue(log.timestamp ?? log.createdAt) === state.filters.logDate;
    return matchesSearch && matchesLevel && matchesDate;
  });

  return `
    ${renderPageTitle('System Logs', 'Chuma platform errors, warnings and audit events')}
    <section class="panel filters logs">
      <select id="log-level-filter" aria-label="Log level">
        <option value="all" ${selected(state.filters.logLevel, 'all')}>All</option>
        <option value="error" ${selected(state.filters.logLevel, 'error')}>Error</option>
        <option value="warning" ${selected(state.filters.logLevel, 'warning')}>Warning</option>
        <option value="info" ${selected(state.filters.logLevel, 'info')}>Info</option>
        <option value="debug" ${selected(state.filters.logLevel, 'debug')}>Debug</option>
      </select>
      <input id="log-date-filter" aria-label="Date range" type="date" value="${escapeHtml(state.filters.logDate)}" />
      <div class="search-shell"><input id="page-search" type="search" placeholder="Search logs..." value="${escapeHtml(state.search)}" /></div>
      <button type="button">Export</button>
    </section>
    <section class="panel table-card">
      <div class="table-wrap">
        <table>
          <thead><tr><th>Timestamp</th><th>Log Level</th><th>Module</th><th>Message</th><th>User<br>ID</th><th>Actions</th></tr></thead>
          <tbody>
            ${rows.map((log) => `
              <tr>
                <td>${escapeHtml(formatDate(log.timestamp ?? log.createdAt, true))}</td>
                <td>${statusPill(log.level)}</td>
                <td>${escapeHtml(log.module ?? log.source ?? 'Not set')}</td>
                <td>${escapeHtml(log.message ?? '')}</td>
                <td><code>${escapeHtml(log.userId ?? '-')}</code></td>
                <td><button class="icon-action" type="button">View Details</button></td>
              </tr>
            `).join('') || '<tr><td colspan="6" class="empty">No system logs found.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="summary-strip">
        <span>Total Errors Today: <strong>${formatNumber(rows.filter((log) => String(log.level).toLowerCase() === 'error').length)}</strong></span>
        <span>Total Warnings: <strong>${formatNumber(rows.filter((log) => String(log.level).toLowerCase() === 'warning').length)}</strong></span>
        <span>Last System Check: <strong>${escapeHtml(rows[0] ? formatDate(rows[0].timestamp ?? rows[0].createdAt, true) : 'Not set')}</strong></span>
      </div>
      ${renderPagination(`Showing ${Math.min(rows.length, 10)} of ${formatNumber(rows.length)} logs`, 1)}
    </section>
  `;
}

function renderSummary(label, value) {
  return `<div class="summary-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderPagination(label, pages) {
  return `
    <div class="table-footer">
      <span>${escapeHtml(label)}</span>
      <div class="pagination">
        <button type="button">Previous</button>
        ${Array.from({ length: pages }, (_, index) => `<button class="${index === 0 ? 'active' : ''}" type="button">${index + 1}</button>`).join('')}
        <button type="button">Next</button>
      </div>
    </div>
  `;
}

function statusPill(status, dark = false) {
  const safeStatus = String(status || 'active').toLowerCase();
  const label = titleCase(safeStatus);
  const className = safeStatus.replace(/\s+/g, '-');
  return `<span class="status-pill status-${escapeHtml(className)} ${dark ? 'dark' : ''}">${escapeHtml(label)}</span>`;
}

function titleCase(value) {
  return String(value ?? '')
    .replace(/[-_]/g, ' ')
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function bindViewEvents() {
  const pageSearch = document.querySelector('#page-search');
  if (pageSearch) {
    pageSearch.addEventListener('input', (event) => {
      state.search = event.target.value;
      renderShell();
      document.querySelector('#page-search')?.focus();
    });
  }

  bindFilter('#user-status-filter', 'userStatus');
  bindFilter('#transaction-date-filter', 'transactionDate');
  bindFilter('#transaction-status-filter', 'transactionStatus');
  bindFilter('#transaction-type-filter', 'transactionType');
  bindFilter('#goal-category-filter', 'goalCategory');
  bindFilter('#log-date-filter', 'logDate');
  bindFilter('#log-level-filter', 'logLevel');
}

function bindFilter(selector, filterName) {
  const node = document.querySelector(selector);
  if (!node) return;

  node.addEventListener('change', (event) => {
    state.filters[filterName] = event.target.value;
    renderShell();
  });
}

function subscribeToData() {
  unsubscribeData.forEach((unsubscribe) => unsubscribe());
  unsubscribeData = [
    onSnapshot(collectionGroup(db, 'goals'), (snapshot) => {
      state.goals = normalizeSnapshot(snapshot).sort((a, b) =>
        String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))
      );
      renderShell();
    }),
    onSnapshot(collectionGroup(db, 'expenses'), (snapshot) => {
      state.expenses = normalizeSnapshot(snapshot).sort((a, b) =>
        String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))
      );
      renderShell();
    }),
    onSnapshot(collectionGroup(db, 'notifications'), (snapshot) => {
      state.notifications = normalizeSnapshot(snapshot).sort((a, b) =>
        String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))
      );
      renderShell();
    }),
    onSnapshot(collectionGroup(db, 'transactions'), (snapshot) => {
      state.transactions = normalizeSnapshot(snapshot).sort((a, b) =>
        String(b.createdAt ?? '').localeCompare(String(a.createdAt ?? ''))
      );
      renderShell();
    }),
    onSnapshot(collectionGroup(db, 'meta'), (snapshot) => {
      state.profiles = normalizeSnapshot(snapshot).filter((item) => item.id === 'profile');
      renderShell();
    }),
    onSnapshot(collection(db, 'systemLogs'), (snapshot) => {
      state.logs = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .sort((a, b) => String(b.timestamp ?? b.createdAt ?? '').localeCompare(String(a.timestamp ?? a.createdAt ?? '')));
      renderShell();
    }),
  ];
}

onAuthStateChanged(auth, async (user) => {
  state.currentUser = user;
  state.authReady = true;

  unsubscribeData.forEach((unsubscribe) => unsubscribe());
  unsubscribeData = [];

  if (!user) {
    state.isAdmin = false;
    renderAuth();
    return;
  }

  const token = await getIdTokenResult(user, true);
  state.isAdmin = token.claims.admin === true;

  if (!state.isAdmin) {
    renderDenied();
    return;
  }

  renderShell();
  subscribeToData();
});

renderAuth();
