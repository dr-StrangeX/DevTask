// =========================
// DEVTASK APPLICATION
// =========================

let tasks = JSON.parse(
    localStorage.getItem("devtask_tasks")
) || [];


// =========================
// DOM ELEMENTS
// =========================

const addTaskButton = document.getElementById("addTaskButton");
const emptyAddTask = document.getElementById("emptyAddTask");

const modalOverlay = document.getElementById("modalOverlay");
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


// =========================
// SAVE TASKS
// =========================

function saveTasks() {

    localStorage.setItem(
        "devtask_tasks",
        JSON.stringify(tasks)
    );

}


// =========================
// OPEN MODAL
// =========================

function openModal() {

    taskForm.reset();

    taskId.value = "";

    const modalTitle =
        document.getElementById("modalTitle");

    if (modalTitle) {

        modalTitle.textContent =
            "Create Task";

    }

    modalOverlay.classList.add("active");

    taskTitle.focus();

}


// =========================
// CLOSE MODAL
// =========================

function closeTaskModal() {

    modalOverlay.classList.remove("active");

    taskForm.reset();

    taskId.value = "";

    const modalTitle =
        document.getElementById("modalTitle");

    if (modalTitle) {

        modalTitle.textContent =
            "Create Task";

    }

}


// =========================
// EVENT LISTENERS
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


// Close modal when clicking outside

if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        event => {

            if (event.target === modalOverlay) {

                closeTaskModal();

            }

        }
    );

}


// Escape key closes modal

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeTaskModal();

        }

    }
);


// Search

if (searchInput) {

    searchInput.addEventListener(
        "input",
        renderTasks
    );

}


// Filter

if (filterSelect) {

    filterSelect.addEventListener(
        "change",
        renderTasks
    );

}


// Clear completed

if (clearCompleted) {

    clearCompleted.addEventListener(
        "click",
        clearCompletedTasks
    );

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
            // UPDATE EXISTING TASK
            // =========================

            if (editingId) {

                const task =
                    tasks.find(
                        task => task.id === editingId
                    );


                if (task) {

                    task.title =
                        title;

                    task.description =
                        description;

                    task.priority =
                        priority;

                    task.dueDate =
                        dueDate;

                }

            }


            // =========================
            // CREATE NEW TASK
            // =========================

            else {

                const newTask = {

                    id: Date.now(),

                    title: title,

                    description: description,

                    priority: priority,

                    dueDate: dueDate,

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
// RENDER TASKS
// =========================

function renderTasks() {

    if (!taskList) {
        return;
    }


    // Remove existing task elements

    const existingTasks =
        taskList.querySelectorAll(
            ".task-item"
        );


    existingTasks.forEach(
        task => task.remove()
    );


    // =========================
    // SEARCH
    // =========================

    const searchTerm =
        searchInput
            ? searchInput.value
                .toLowerCase()
                .trim()
            : "";


    // =========================
    // FILTER
    // =========================

    const filter =
        filterSelect
            ? filterSelect.value
            : "all";


    // =========================
    // FILTER TASKS
    // =========================

    let filteredTasks =
        tasks.filter(task => {

            const title =
                (task.title || "")
                    .toLowerCase();


            const description =
                (task.description || "")
                    .toLowerCase();


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
    // SORT TASKS
    // =========================

    const priorityOrder = {

        high: 1,

        medium: 2,

        low: 3

    };


    filteredTasks.sort(
        (a, b) => {

            // Active tasks first

            if (
                a.completed !==
                b.completed
            ) {

                return a.completed
                    ? 1
                    : -1;

            }


            // Priority sorting

            const priorityA =
                priorityOrder[a.priority] || 99;


            const priorityB =
                priorityOrder[b.priority] || 99;


            return priorityA - priorityB;

        }
    );


    // =========================
    // EMPTY STATE
    // =========================

    if (filteredTasks.length === 0) {

        if (emptyState) {

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

            }

            else {

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


        return;

    }


    // Hide empty state

    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    // =========================
    // DISPLAY TASKS
    // =========================

    filteredTasks.forEach(
        task => {

            const taskElement =
                createTaskElement(task);


            taskList.appendChild(
                taskElement
            );

        }
    );

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


    checkbox.className =
        "task-check";


    checkbox.type =
        "button";


    checkbox.innerHTML =
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
        () => {

            toggleTask(task.id);

        }
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
            task.priority || "medium"
        );


    meta.appendChild(
        priority
    );


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


    content.appendChild(
        title
    );


    content.appendChild(
        description
    );


    content.appendChild(
        meta
    );


    // =========================
    // ACTIONS
    // =========================

    const actions =
        document.createElement("div");


    actions.className =
        "task-actions";


    // Edit button

    const editButton =
        document.createElement("button");


    editButton.className =
        "task-action";


    editButton.type =
        "button";


    editButton.innerHTML =
        "✎";


    editButton.title =
        "Edit task";


    editButton.addEventListener(
        "click",
        () => {

            editTask(task.id);

        }
    );


    // Delete button

    const deleteButton =
        document.createElement("button");


    deleteButton.className =
        "task-action";


    deleteButton.type =
        "button";


    deleteButton.innerHTML =
        "×";


    deleteButton.title =
        "Delete task";


    deleteButton.addEventListener(
        "click",
        () => {

            deleteTask(task.id);

        }
    );


    actions.appendChild(
        editButton
    );


    actions.appendChild(
        deleteButton
    );


    // =========================
    // BUILD TASK
    // =========================

    article.appendChild(
        checkbox
    );


    article.appendChild(
        content
    );


    article.appendChild(
        actions
    );


    return article;

}


// =========================
// TOGGLE TASK
// =========================

function toggleTask(id) {

    const task =
        tasks.find(
            task => task.id === id
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

    const confirmed =
        confirm(
            "Are you sure you want to delete this task?"
        );


    if (!confirmed) {

        return;

    }


    tasks =
        tasks.filter(
            task => task.id !== id
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
            task => task.id === id
        );


    if (!task) {

        return;

    }


    taskId.value =
        task.id;


    taskTitle.value =
        task.title;


    taskDescription.value =
        task.description || "";


    taskPriority.value =
        task.priority || "medium";


    taskDueDate.value =
        task.dueDate || "";


    const modalTitle =
        document.getElementById("modalTitle");


    if (modalTitle) {

        modalTitle.textContent =
            "Edit Task";

    }


    modalOverlay.classList.add(
        "active"
    );


    taskTitle.focus();

}


// =========================
// CLEAR COMPLETED TASKS
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
        confirm(
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
        new Date(date);


    if (Number.isNaN(
        formatted.getTime()
    )) {

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


    return value.charAt(0).toUpperCase() +
        value.slice(1);

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
    // STATISTICS CARDS
    // =========================

    const totalTasks =
        document.getElementById(
            "totalTasks"
        );


    const completedTasks =
        document.getElementById(
            "completedTasks"
        );


    const activeTasks =
        document.getElementById(
            "activeTasks"
        );


    const completionRate =
        document.getElementById(
            "completionRate"
        );


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
    // PROGRESS PANEL
    // =========================

    const progressPercentage =
        document.getElementById(
            "progressPercentage"
        );


    const progressCompleted =
        document.getElementById(
            "progressCompleted"
        );


    const progressRemaining =
        document.getElementById(
            "progressRemaining"
        );


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

    const progressCircle =
        document.querySelector(
            ".progress-circle"
        );


    if (progressCircle) {

        const degrees =
            percentage * 3.6;


        progressCircle.style.background =
            `conic-gradient(
                var(--blue) ${degrees}deg,
                var(--border) ${degrees}deg
            )`;

    }

}


// =========================
// MOBILE SIDEBAR
// =========================

if (mobileMenu && sidebar) {

    mobileMenu.addEventListener(
        "click",
        () => {

            sidebar.classList.toggle(
                "open"
            );

        }
    );

}


// Close sidebar after navigation

document.querySelectorAll(
    ".sidebar-nav .nav-item"
).forEach(
    link => {

        link.addEventListener(
            "click",
            () => {

                if (sidebar) {

                    sidebar.classList.remove(
                        "open"
                    );

                }

            }
        );

    }
);


// =========================
// THEME TOGGLE
// =========================

if (themeToggle) {

    themeToggle.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light-theme"
            );


            const lightMode =
                document.body.classList.contains(
                    "light-theme"
                );


            localStorage.setItem(
                "devtask_theme",
                lightMode
                    ? "light"
                    : "dark"
            );

        }
    );

}


// =========================
// LOAD SAVED THEME
// =========================

const savedTheme =
    localStorage.getItem(
        "devtask_theme"
    );


if (savedTheme === "light") {

    document.body.classList.add(
        "light-theme"
    );

}


// =========================
// INITIALIZE APPLICATION
// =========================

renderTasks();

updateStatistics();