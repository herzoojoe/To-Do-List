const STORAGE_KEY = "basic_todos";
const FILTER_KEY = "basic_filter";
const THEME_KEY = "basic_theme";

const CATEGORY_LABELS = {
  work: "업무",
  personal: "개인",
  study: "공부",
};

let todos = loadTodos();
let currentFilter = loadFilter();

const addForm = document.getElementById("addForm");
const todoInput = document.getElementById("todoInput");
const categorySelect = document.getElementById("categorySelect");
const filterTabs = document.getElementById("filterTabs");
const todoListEl = document.getElementById("todoList");
const overallCount = document.getElementById("overallCount");
const overallFill = document.getElementById("overallFill");
const overallPercent = document.getElementById("overallPercent");
const dashboardCategories = document.getElementById("dashboardCategories");
const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.setAttribute(
    "aria-label",
    theme === "dark" ? "라이트 모드 전환" : "다크 모드 전환"
  );
}

function getCurrentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark"
    ? "dark"
    : "light";
}

themeToggle.addEventListener("click", () => {
  const next = getCurrentTheme() === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
});

applyTheme(getCurrentTheme());

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function loadFilter() {
  const saved = localStorage.getItem(FILTER_KEY);
  return saved && ["all", "work", "personal", "study"].includes(saved)
    ? saved
    : "all";
}

function saveFilter() {
  localStorage.setItem(FILTER_KEY, currentFilter);
}

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addTodo(text, category) {
  todos.unshift({
    id: createId(),
    text,
    completed: false,
    category,
    createdAt: new Date().toISOString(),
  });
  saveTodos();
  render();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  render();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

function formatRelativeTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffSec = Math.max(0, Math.floor(diffMs / 1000));

  if (diffSec < 60) return "방금 전";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}일 전`;

  return new Date(isoString).toLocaleDateString("ko-KR", {
    month: "short",
    day: "numeric",
  });
}

function getFilteredTodos() {
  const list =
    currentFilter === "all"
      ? todos
      : todos.filter((t) => t.category === currentFilter);

  return [...list].sort((a, b) => Number(a.completed) - Number(b.completed));
}

function createTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.setAttribute("aria-label", `${todo.text} 완료 처리`);
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const main = document.createElement("div");
  main.className = "todo-main";

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;

  const meta = document.createElement("div");
  meta.className = "todo-meta";

  const categoryTag = document.createElement("span");
  categoryTag.className = "category-tag";
  categoryTag.dataset.category = todo.category;
  categoryTag.textContent = CATEGORY_LABELS[todo.category] || todo.category;

  const time = document.createElement("span");
  time.className = "todo-time";
  time.dataset.createdAt = todo.createdAt;
  time.textContent = formatRelativeTime(todo.createdAt);

  meta.append(categoryTag, time);
  main.append(text, meta);

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "delete-btn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "×";
  deleteBtn.setAttribute("aria-label", `${todo.text} 삭제`);
  deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

  li.append(checkbox, main, deleteBtn);
  return li;
}

function renderDashboard() {
  const total = todos.length;
  const done = todos.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  overallCount.textContent = `${done} / ${total}`;
  overallFill.style.width = percent + "%";
  overallPercent.textContent = percent + "%";

  dashboardCategories.innerHTML = "";

  Object.keys(CATEGORY_LABELS).forEach((category) => {
    const items = todos.filter((t) => t.category === category);
    const catTotal = items.length;
    const catDone = items.filter((t) => t.completed).length;
    const catPercent = catTotal === 0 ? 0 : Math.round((catDone / catTotal) * 100);

    const row = document.createElement("div");
    row.className = "dashboard-category";
    row.dataset.category = category;

    const label = document.createElement("span");
    label.className = "dashboard-category-label";
    label.textContent = CATEGORY_LABELS[category];

    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("div");
    fill.className = "bar-fill";
    fill.style.width = catPercent + "%";
    track.appendChild(fill);

    const count = document.createElement("span");
    count.className = "dashboard-category-count";
    count.textContent = `${catDone} / ${catTotal}`;

    row.append(label, track, count);
    dashboardCategories.appendChild(row);
  });
}

function render() {
  todoListEl.innerHTML = "";

  const list = getFilteredTodos();

  if (list.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "할 일이 없습니다. 위에서 추가해보세요.";
    todoListEl.appendChild(empty);
  } else {
    list.forEach((todo) => todoListEl.appendChild(createTodoItem(todo)));
  }

  [...filterTabs.children].forEach((tab) =>
    tab.classList.toggle("active", tab.dataset.filter === currentFilter)
  );

  renderDashboard();
}

function tickRelativeTimes() {
  document.querySelectorAll(".todo-time").forEach((el) => {
    el.textContent = formatRelativeTime(el.dataset.createdAt);
  });
}

setInterval(tickRelativeTimes, 60000);

addForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = todoInput.value.trim();
  if (!text) return;
  addTodo(text, categorySelect.value);
  todoInput.value = "";
  todoInput.focus();
});

filterTabs.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-tab");
  if (!btn) return;
  currentFilter = btn.dataset.filter;
  saveFilter();
  render();
});

render();
