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

// ============================================
// APP STATE
// ============================================

const API_URL = "/tasks";

let tasks = [];

// ============================================
// INITIAL LOAD
// ============================================

document.addEventListener('DOMContentLoaded', () => {

    initializeTheme();

    fetchTasks();

});

// ============================================
// FETCH TASKS FROM MONGODB
// ============================================

async function fetchTasks() {

    try {

        const response = await fetch(API_URL);

        tasks = await response.json();

        renderTasks();

        updateStats();

    } catch (error) {

        console.error(
            "Failed to fetch tasks:",
            error
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

        taskInput.value = "";

        taskInput.focus();

    } catch (error) {

        console.error(
            "Failed to create task:",
            error
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

    } catch (error) {

        console.error(
            "Failed to update task:",
            error
        );

    }

}

// ============================================
// DELETE TASK
// ============================================

async function deleteTask(id) {

    try {

        await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );

        tasks = tasks.filter(
            task => task._id !== id
        );

        renderTasks();

        updateStats();

    } catch (error) {

        console.error(
            "Failed to delete task:",
            error
        );

    }

}

// ============================================
// RENDER TASKS
// ============================================

function renderTasks() {

    taskList.innerHTML = '';

    if (tasks.length === 0) {

        emptyState.classList.add('show');

        return;

    }

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