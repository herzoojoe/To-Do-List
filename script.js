const STORAGE_KEY = "todos";
const THEME_KEY = "theme";

let todos = loadTodos();
let currentFilter = "전체";

const addForm = document.getElementById("addForm");
const todoInput = document.getElementById("todoInput");
const categorySelect = document.getElementById("categorySelect");
const filterTabs = document.getElementById("filterTabs");
const todoListEl = document.getElementById("todoList");
const emptyState = document.getElementById("emptyState");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
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

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function addTodo(text, category) {
  todos.unshift({
    id: createId(),
    text,
    category,
    completed: false,
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

function updateTodo(id, text, category) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.text = text;
    todo.category = category;
    saveTodos();
    render();
  }
}

function getFilteredTodos() {
  if (currentFilter === "전체") return todos;
  return todos.filter((t) => t.category === currentFilter);
}

function renderProgress() {
  const list = getFilteredTodos();
  const total = list.length;
  const done = list.filter((t) => t.completed).length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  progressFill.style.width = percent + "%";
  progressText.textContent = `완료 ${done} / ${total} (${percent}%)`;
}

function createTodoItem(todo) {
  const li = document.createElement("li");
  li.className = "todo-item" + (todo.completed ? " completed" : "");
  li.dataset.id = todo.id;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.addEventListener("change", () => toggleTodo(todo.id));

  const text = document.createElement("span");
  text.className = "todo-text";
  text.textContent = todo.text;
  text.addEventListener("dblclick", () => enterEditMode(li, todo));

  const category = document.createElement("span");
  category.className = "todo-category";
  category.dataset.category = todo.category;
  category.textContent = todo.category;

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const editBtn = document.createElement("button");
  editBtn.textContent = "수정";
  editBtn.type = "button";
  editBtn.addEventListener("click", () => enterEditMode(li, todo));

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "삭제";
  deleteBtn.type = "button";
  deleteBtn.addEventListener("click", () => {
    if (confirm("이 할 일을 삭제할까요?")) {
      deleteTodo(todo.id);
    }
  });

  actions.append(editBtn, deleteBtn);
  li.append(checkbox, text, category, actions);
  return li;
}

function enterEditMode(li, todo) {
  li.innerHTML = "";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = todo.completed;
  checkbox.disabled = true;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "todo-edit-input";
  input.value = todo.text;
  input.maxLength = 200;

  const select = document.createElement("select");
  select.className = "todo-edit-select";
  ["업무", "개인", "공부"].forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    if (cat === todo.category) opt.selected = true;
    select.appendChild(opt);
  });

  const actions = document.createElement("div");
  actions.className = "todo-actions";

  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "저장";
  const commit = () => {
    const newText = input.value.trim();
    if (newText) {
      updateTodo(todo.id, newText, select.value);
    } else {
      render();
    }
  };
  saveBtn.addEventListener("click", commit);

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "취소";
  cancelBtn.addEventListener("click", () => render());

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    if (e.key === "Escape") render();
  });

  actions.append(saveBtn, cancelBtn);
  li.append(checkbox, input, select, actions);
  input.focus();
  input.select();
}

function render() {
  const list = getFilteredTodos();
  todoListEl.innerHTML = "";

  if (list.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
    list.forEach((todo) => todoListEl.appendChild(createTodoItem(todo)));
  }

  renderProgress();
}

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
  [...filterTabs.children].forEach((tab) =>
    tab.classList.toggle("active", tab === btn)
  );
  render();
});

render();
