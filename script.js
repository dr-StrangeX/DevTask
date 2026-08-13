// =========================
// DEVTASK APPLICATION
// =========================

"use strict";


// =========================
// CONSTANTS
// =========================

const STORAGE_KEY = "devtask_tasks";
const THEME_KEY = "devtask_theme";


// =========================
// DOM ELEMENTS
// =========================

const addTaskButton = document.getElementById("addTaskButton");
const emptyAddTask = document.getElementById("emptyAddTask");

const modalOverlay = document.getElementById("modalOverlay");
const modalTitle = document.getElementById("modalTitle");
const closeModal = document.getElementById("closeModal");
const cancelTask = document.getElementById("cancelTask");

const taskForm = document.getElementById("taskForm");

const taskId = document.getElementById("taskId");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const clearCompleted = document.getElementById("clearCompleted");

const mobileMenu = document.getElementById("mobileMenu");
const sidebar = document.getElementById("sidebar");

const themeToggle = document.getElementById("themeToggle");


// Statistics

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const activeTasks = document.getElementById("activeTasks");
const completionRate = document.getElementById("completionRate");

const progressPercentage =
    document.getElementById("progressPercentage");

const progressCompleted =
    document.getElementById("progressCompleted");

const progressRemaining =
    document.getElementById("progressRemaining");

const progressCircle =
    document.querySelector(".progress-circle");


// =========================
// TASK STATE
// =========================

let tasks = loadTasks();


// =========================
// LOAD TASKS
// =========================

function loadTasks() {

    try {

        const storedTasks =
            localStorage.getItem(STORAGE_KEY);

        if (!storedTasks) {

            return [];

        }

        const parsedTasks =
            JSON.parse(storedTasks);

        if (!Array.isArray(parsedTasks)) {

            return [];

        }

        return parsedTasks
            .filter(task =>
                task &&
                typeof task === "object"
            )
            .map(task => ({
                id: Number(task.id),
                title: String(task.title || "").trim(),
                description: String(
                    task.description || ""
                ).trim(),
                priority:
                    ["low", "medium", "high"].includes(
                        task.priority
                    )
                        ? task.priority
                        : "medium",
                dueDate: String(
                    task.dueDate || ""
                ),
                completed:
                    Boolean(task.completed),
                createdAt:
                    task.createdAt ||
                    new Date().toISOString()
            }))
            .filter(task =>
                Number.isFinite(task.id) &&
                task.title
            );

    } catch (error) {

        console.error(
            "Unable to load saved tasks:",
            error
        );

        return [];

    }

}


// =========================
// SAVE TASKS
// =========================

function saveTasks() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error(
            "Unable to save tasks:",
            error
        );

        alert(
            "Your tasks could not be saved. Please check your browser storage settings."
        );

    }

}


// =========================
// OPEN MODAL
// =========================

function openModal() {

    if (!modalOverlay || !taskForm) {
        return;
    }

    taskForm.reset();

    taskId.value = "";

    if (modalTitle) {

        modalTitle.textContent =
            "Create Task";

    }

    modalOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

    if (taskTitle) {

        taskTitle.focus();

    }

}


// =========================
// CLOSE MODAL
// =========================

function closeTaskModal() {

    if (!modalOverlay) {
        return;
    }

    modalOverlay.classList.remove("active");

    document.body.style.overflow = "";

    if (taskForm) {

        taskForm.reset();

    }

    if (taskId) {

        taskId.value = "";

    }

    if (modalTitle) {

        modalTitle.textContent =
            "Create Task";

    }

}


// =========================
// CREATE / UPDATE TASK
// =========================

if (taskForm) {

    taskForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                taskTitle.value.trim();

            const description =
                taskDescription.value.trim();

            const priority =
                taskPriority.value;

            const dueDate =
                taskDueDate.value;

            if (!title) {

                taskTitle.focus();

                return;

            }

            const editingId =
                Number(taskId.value);

            // =========================
            // UPDATE
            // =========================

            if (editingId) {

                const task =
                    tasks.find(
                        item =>
                            item.id === editingId
                    );

                if (!task) {

                    closeTaskModal();

                    return;

                }

                task.title =
                    title;

                task.description =
                    description;

                task.priority =
                    priority;

                task.dueDate =
                    dueDate;

            }

            // =========================
            // CREATE
            // =========================

            else {

                const newTask = {

                    id: generateTaskId(),

                    title,

                    description,

                    priority,

                    dueDate,

                    completed: false,

                    createdAt:
                        new Date().toISOString()

                };

                tasks.push(newTask);

            }

            saveTasks();

            renderTasks();

            updateStatistics();

            closeTaskModal();

        }
    );

}


// =========================
// GENERATE UNIQUE ID
// =========================

function generateTaskId() {

    let id = Date.now();

    while (
        tasks.some(
            task => task.id === id
        )
    ) {

        id++;

    }

    return id;

}


// =========================
// RENDER TASKS
// =========================

function renderTasks() {

    if (!taskList) {
        return;
    }

    // Remove existing task elements.

    taskList
        .querySelectorAll(".task-item")
        .forEach(task =>
            task.remove()
        );


    const searchTerm =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    const filter =
        filterSelect
            ? filterSelect.value
            : "all";


    // =========================
    // FILTER
    // =========================

    const filteredTasks =
        tasks.filter(task => {

            const title =
                task.title.toLowerCase();

            const description =
                task.description.toLowerCase();

            const matchesSearch =
                title.includes(searchTerm) ||
                description.includes(searchTerm);

            if (!matchesSearch) {

                return false;

            }

            switch (filter) {

                case "active":
                    return !task.completed;

                case "completed":
                    return task.completed;

                case "high":
                    return task.priority === "high";

                default:
                    return true;

            }

        });


    // =========================
    // SORT
    // =========================

    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
    };


    filteredTasks.sort(
        (a, b) => {

            // Active tasks first.

            if (
                a.completed !==
                b.completed
            ) {

                return a.completed
                    ? 1
                    : -1;

            }


            // High priority first.

            const priorityA =
                priorityOrder[a.priority] || 99;

            const priorityB =
                priorityOrder[b.priority] || 99;

            if (
                priorityA !==
                priorityB
            ) {

                return priorityA -
                    priorityB;

            }


            // Newest first.

            return (
                new Date(b.createdAt) -
                new Date(a.createdAt)
            );

        }
    );


    // =========================
    // EMPTY STATE
    // =========================

    if (filteredTasks.length === 0) {

        showEmptyState();

        return;

    }


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // =========================
    // DISPLAY TASKS
    // =========================

    const fragment =
        document.createDocumentFragment();

    filteredTasks.forEach(task => {

        fragment.appendChild(
            createTaskElement(task)
        );

    });

    taskList.appendChild(fragment);

}


// =========================
// EMPTY STATE
// =========================

function showEmptyState() {

    if (!emptyState) {
        return;
    }

    emptyState.style.display =
        "flex";

    const emptyTitle =
        emptyState.querySelector("h4");

    const emptyDescription =
        emptyState.querySelector("p");


    if (tasks.length === 0) {

        if (emptyTitle) {

            emptyTitle.textContent =
                "No tasks yet";

        }

        if (emptyDescription) {

            emptyDescription.textContent =
                "Create your first task to get started.";

        }

    } else {

        if (emptyTitle) {

            emptyTitle.textContent =
                "No matching tasks";

        }

        if (emptyDescription) {

            emptyDescription.textContent =
                "Try changing your search or filter.";

        }

    }

}


// =========================
// CREATE TASK ELEMENT
// =========================

function createTaskElement(task) {

    const article =
        document.createElement("article");

    article.className =
        "task-item";

    if (task.completed) {

        article.classList.add(
            "completed"
        );

    }


    // =========================
    // CHECKBOX
    // =========================

    const checkbox =
        document.createElement("button");

    checkbox.type = "button";

    checkbox.className =
        "task-check";

    checkbox.setAttribute(
        "aria-label",
        task.completed
            ? `Mark "${task.title}" as incomplete`
            : `Mark "${task.title}" as complete`
    );

    checkbox.setAttribute(
        "aria-pressed",
        String(task.completed)
    );

    checkbox.textContent =
        task.completed
            ? "✓"
            : "";

    if (task.completed) {

        checkbox.classList.add(
            "completed"
        );

    }

    checkbox.addEventListener(
        "click",
        () => toggleTask(task.id)
    );


    // =========================
    // CONTENT
    // =========================

    const content =
        document.createElement("div");

    content.className =
        "task-content";


    const title =
        document.createElement("h4");

    title.className =
        "task-title";

    title.textContent =
        task.title;


    const description =
        document.createElement("p");

    description.className =
        "task-description";

    description.textContent =
        task.description ||
        "No description provided.";


    // =========================
    // META
    // =========================

    const meta =
        document.createElement("div");

    meta.className =
        "task-meta";


    const priority =
        document.createElement("span");

    priority.className =
        `priority ${task.priority}`;

    priority.textContent =
        capitalize(
            task.priority
        );

    meta.appendChild(priority);


    if (task.dueDate) {

        const dueDate =
            document.createElement("span");

        dueDate.className =
            "due-date";

        dueDate.textContent =
            `Due: ${formatDate(
                task.dueDate
            )}`;

        meta.appendChild(
            dueDate
        );

    }


    content.appendChild(title);
    content.appendChild(description);
    content.appendChild(meta);


    // =========================
    // ACTIONS
    // =========================

    const actions =
        document.createElement("div");

    actions.className =
        "task-actions";


    // Edit

    const editButton =
        document.createElement("button");

    editButton.type = "button";

    editButton.className =
        "task-action";

    editButton.textContent =
        "✎";

    editButton.setAttribute(
        "aria-label",
        `Edit "${task.title}"`
    );

    editButton.title =
        "Edit task";

    editButton.addEventListener(
        "click",
        () => editTask(task.id)
    );


    // Delete

    const deleteButton =
        document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className =
        "task-action";

    deleteButton.textContent =
        "×";

    deleteButton.setAttribute(
        "aria-label",
        `Delete "${task.title}"`
    );

    deleteButton.title =
        "Delete task";

    deleteButton.addEventListener(
        "click",
        () => deleteTask(task.id)
    );


    actions.appendChild(editButton);
    actions.appendChild(deleteButton);


    // =========================
    // BUILD
    // =========================

    article.appendChild(checkbox);
    article.appendChild(content);
    article.appendChild(actions);

    return article;

}


// =========================
// TOGGLE TASK
// =========================

function toggleTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) {
        return;
    }

    task.completed =
        !task.completed;

    saveTasks();

    renderTasks();

    updateStatistics();

}


// =========================
// DELETE TASK
// =========================

function deleteTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete "${task.title}"?`
        );

    if (!confirmed) {
        return;
    }


    tasks =
        tasks.filter(
            item => item.id !== id
        );

    saveTasks();

    renderTasks();

    updateStatistics();

}


// =========================
// EDIT TASK
// =========================

function editTask(id) {

    const task =
        tasks.find(
            item => item.id === id
        );

    if (!task) {
        return;
    }


    taskId.value =
        task.id;

    taskTitle.value =
        task.title;

    taskDescription.value =
        task.description;

    taskPriority.value =
        task.priority;

    taskDueDate.value =
        task.dueDate;


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Task";

    }


    modalOverlay.classList.add(
        "active"
    );

    document.body.style.overflow =
        "hidden";

    taskTitle.focus();

}


// =========================
// CLEAR COMPLETED
// =========================

function clearCompletedTasks() {

    const completedCount =
        tasks.filter(
            task => task.completed
        ).length;


    if (completedCount === 0) {
        return;
    }


    const confirmed =
        window.confirm(
            `Delete ${completedCount} completed task(s)?`
        );


    if (!confirmed) {
        return;
    }


    tasks =
        tasks.filter(
            task => !task.completed
        );


    saveTasks();

    renderTasks();

    updateStatistics();

}


// =========================
// FORMAT DATE
// =========================

function formatDate(date) {

    if (!date) {
        return "";
    }


    const formatted =
        new Date(`${date}T00:00:00`);


    if (
        Number.isNaN(
            formatted.getTime()
        )
    ) {

        return date;

    }


    return formatted.toLocaleDateString(
        undefined,
        {
            month: "short",
            day: "numeric",
            year: "numeric"
        }
    );

}


// =========================
// CAPITALIZE
// =========================

function capitalize(value) {

    if (!value) {
        return "";
    }

    return (
        value.charAt(0).toUpperCase() +
        value.slice(1)
    );

}


// =========================
// UPDATE STATISTICS
// =========================

function updateStatistics() {

    const total =
        tasks.length;

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    const active =
        total - completed;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );


    // =========================
    // STATISTICS
    // =========================

    if (totalTasks) {

        totalTasks.textContent =
            total;

    }

    if (completedTasks) {

        completedTasks.textContent =
            completed;

    }

    if (activeTasks) {

        activeTasks.textContent =
            active;

    }

    if (completionRate) {

        completionRate.textContent =
            `${percentage}%`;

    }


    // =========================
    // PROGRESS
    // =========================

    if (progressPercentage) {

        progressPercentage.textContent =
            `${percentage}%`;

    }

    if (progressCompleted) {

        progressCompleted.textContent =
            completed;

    }

    if (progressRemaining) {

        progressRemaining.textContent =
            active;

    }


    // =========================
    // PROGRESS CIRCLE
    // =========================

    if (progressCircle) {

        const degrees =
            percentage * 3.6;

        progressCircle.style.background =
            `conic-gradient(
                var(--blue) ${degrees}deg,
                var(--border) ${degrees}deg
            )`;


        progressCircle.setAttribute(
            "aria-valuenow",
            percentage
        );

        progressCircle.setAttribute(
            "aria-label",
            `Task completion progress: ${percentage}%`
        );

    }

}


// =========================
// SEARCH
// =========================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTasks
    );

}


// =========================
// FILTER
// =========================

if (filterSelect) {

    filterSelect.addEventListener(
        "change",
        renderTasks
    );

}


// =========================
// CLEAR COMPLETED
// =========================

if (clearCompleted) {

    clearCompleted.addEventListener(
        "click",
        clearCompletedTasks
    );

}


// =========================
// OPEN MODAL BUTTONS
// =========================

if (addTaskButton) {

    addTaskButton.addEventListener(
        "click",
        openModal
    );

}


if (emptyAddTask) {

    emptyAddTask.addEventListener(
        "click",
        openModal
    );

}


// =========================
// CLOSE MODAL
// =========================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeTaskModal
    );

}


if (cancelTask) {

    cancelTask.addEventListener(
        "click",
        closeTaskModal
    );

}


// =========================
// CLICK OUTSIDE MODAL
// =========================

if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                modalOverlay
            ) {

                closeTaskModal();

            }

        }
    );

}


// =========================
// ESCAPE KEY
// =========================

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            modalOverlay &&
            modalOverlay.classList.contains("active")
        ) {

            closeTaskModal();

        }

    }
);


// =========================
// MOBILE SIDEBAR
// =========================

if (mobileMenu && sidebar) {

    mobileMenu.addEventListener(
        "click",
        () => {

            const isOpen =
                sidebar.classList.toggle(
                    "open"
                );

            mobileMenu.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );

}


// Close sidebar after navigation.

document.querySelectorAll(
    ".sidebar-nav .nav-item"
).forEach(link => {

    link.addEventListener(
        "click",
        () => {

            if (sidebar) {

                sidebar.classList.remove(
                    "open"
                );

            }

            if (mobileMenu) {

                mobileMenu.setAttribute(
                    "aria-expanded",
                    "false"
                );

            }

        }
    );

});


// =========================
// THEME TOGGLE
// =========================

function setTheme(theme) {

    const isLight =
        theme === "light";

    document.body.classList.toggle(
        "light-theme",
        isLight
    );

    if (themeToggle) {

        themeToggle.setAttribute(
            "aria-pressed",
            String(isLight)
        );

    }

}


if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            const isLight =
                !document.body.classList.contains(
                    "light-theme"
                );

            const theme =
                isLight
                    ? "light"
                    : "dark";

            setTheme(theme);

            localStorage.setItem(
                THEME_KEY,
                theme
            );

        }
    );

}


// =========================
// LOAD SAVED THEME
// =========================

const savedTheme =
    localStorage.getItem(
        THEME_KEY
    );

if (savedTheme === "light") {

    setTheme("light");

} else {

    setTheme("dark");

}


// =========================
// INITIALIZE
// =========================

renderTasks();

updateStatistics();