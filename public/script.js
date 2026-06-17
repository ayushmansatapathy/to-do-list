// ============================================
// DARK MODE TOGGLE
// ============================================

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

function initializeTheme() {

    const savedTheme = localStorage.getItem('theme') || 'light';

    if (savedTheme === 'dark') {

        html.classList.add('dark-mode');

        themeToggle.querySelector('.toggle-icon').textContent = '☀️';

    } else {

        html.classList.remove('dark-mode');

        themeToggle.querySelector('.toggle-icon').textContent = '🌙';

    }

}

themeToggle.addEventListener('click', () => {

    html.classList.toggle('dark-mode');

    const isDarkMode = html.classList.contains('dark-mode');

    localStorage.setItem(
        'theme',
        isDarkMode ? 'dark' : 'light'
    );

    themeToggle.querySelector('.toggle-icon').textContent =
        isDarkMode ? '☀️' : '🌙';

});

// ============================================
// DOM ELEMENTS
// ============================================

const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const taskCount = document.getElementById('taskCount');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const toastContainer = document.getElementById('toastContainer');
const deleteModal =
    document.getElementById("deleteModal");

const cancelDeleteBtn =
    document.getElementById(
        "cancelDeleteBtn"
    );

const confirmDeleteBtn =
    document.getElementById(
        "confirmDeleteBtn"
    );

// ============================================
// APP STATE
// ============================================

const API_URL = "/tasks";

let tasks = [];

let taskToDelete = null;

// ============================================
// INITIAL LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    initializeTheme();

    fetchTasks();

});

// ============================================
// FETCH TASKS
// ============================================

async function fetchTasks() {

    try {

        loadingState.classList.add("show");

        const response = await fetch(API_URL);

        tasks = await response.json();

        renderTasks();

        updateStats();

    } catch (error) {

        console.error(
            "Failed to fetch tasks:",
            error
        );

        showToast(
            "Failed to load tasks",
            "error"
        );

    } finally {

        loadingState.classList.remove(
            "show"
        );

    }

}

// ============================================
// CREATE TASK
// ============================================

async function addTask() {

    const title = taskInput.value.trim();

    if (!title) {

        taskInput.focus();

        return;

    }

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title
            })

        });

        const newTask = await response.json();

        tasks.push(newTask);

        renderTasks();

        updateStats();

        showToast(
            "Task added successfully",
            "success"
        );

        taskInput.value = "";

        taskInput.focus();

    } catch (error) {

        console.error(
            "Failed to create task:",
            error
        );

        showToast(
            "Failed to add task",
            "error"
        );

    }

}

addBtn.addEventListener('click', addTask);

taskInput.addEventListener('keypress', (e) => {

    if (e.key === 'Enter') {

        addTask();

    }

});

// ============================================
// UPDATE TASK
// ============================================

async function toggleTask(id) {

    try {

        const task = tasks.find(
            t => t._id === id
        );

        const response = await fetch(
            `${API_URL}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: !task.completed
                })

            }
        );

        const updatedTask = await response.json();

        tasks = tasks.map(task =>
            task._id === id
                ? updatedTask
                : task
        );

        renderTasks();

        updateStats();

        showToast(
            updatedTask.completed
                ? "Task completed"
                : "Task marked active",
            "success"
        );

    } catch (error) {

        console.error(
            "Failed to update task:",
            error
        );

        showToast(
            "Failed to update task",
            "error"
        );

    }

}

// ============================================
// DELETE TASK
// ============================================

function deleteTask(id) {

    taskToDelete = id;

    deleteModal.classList.add(
        "show"
    );

}


cancelDeleteBtn.addEventListener(
    "click",
    () => {

        taskToDelete = null;

        deleteModal.classList.remove(
            "show"
        );

    }
);

confirmDeleteBtn.addEventListener(
    "click",
    async () => {

        if (!taskToDelete)
            return;

        try {

            await fetch(
                `${API_URL}/${taskToDelete}`,
                {
                    method: "DELETE"
                }
            );

            tasks = tasks.filter(
                task =>
                    task._id !== taskToDelete
            );

            renderTasks();

            updateStats();

            showToast(
                "Task deleted",
                "success"
            );

        } catch (error) {

            showToast(
                "Delete failed",
                "error"
            );

        }

        deleteModal.classList.remove(
            "show"
        );

        taskToDelete = null;

    }
);

// ============================================
// RENDER TASKS
// ============================================

function renderTasks() {

    taskList.innerHTML = '';

    tasks.sort((a, b) => {

        if (a.completed === b.completed)
            return 0;

        return a.completed ? 1 : -1;

    });

    if (tasks.length === 0) {

        emptyState.classList.add('show');

        taskList.style.display = "none";

        return;

    }

    taskList.style.display = "block";

    emptyState.classList.remove('show');

    tasks.forEach(task => {

        const li = document.createElement('li');

        li.className =
            `task-item ${task.completed ? 'completed' : ''}`;

        li.innerHTML = `
            <div class="task-left">

                <input
                    type="checkbox"
                    class="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask('${task._id}')"
                >

                <span class="task-title">
                    ${escapeHtml(task.title)}
                </span>

            </div>

            <button
                class="delete-btn"
                onclick="deleteTask('${task._id}')"
            >
                🗑
            </button>
        `;

        taskList.appendChild(li);

    });

}

// ============================================
// UPDATE STATS
// ============================================

function updateStats() {

    const total = tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    taskCount.textContent = total;

    progressText.textContent =
        `${percentage}%`;

    progressFill.style.width =
        `${percentage}%`;

}

// ============================================
// TOAST SYSTEM
// ============================================

function showToast(message, type = "success") {

    const toast =
        document.createElement("div");

    toast.className =
        `toast ${type}`;

    toast.textContent =
        message;

    toastContainer.appendChild(
        toast
    );

    setTimeout(() => {

        toast.classList.add(
            "show"
        );

    }, 50);

    setTimeout(() => {

        toast.remove();

    }, 3000);

}

// ============================================
// SECURITY
// ============================================

function escapeHtml(text) {

    const map = {

        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'

    };

    return text.replace(
        /[&<>"']/g,
        m => map[m]
    );

}