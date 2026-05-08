document.addEventListener('DOMContentLoaded', () => {
    try {
        if (typeof io !== 'undefined') {
            const socket = io();
            socket.on('connect', () => console.log('WebSocket connected'));
            socket.on('task_update', () => { fetchTasks(); fetchAnalytics(); });
        }
    } catch (e) {
        console.warn('WebSocket not available:', e);
    }

    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('pageTitle');
    const pageSubtitle = document.getElementById('pageSubtitle');

    const sectionMeta = {
        dashboard: { title: 'Dashboard', subtitle: 'Overview of all your tasks' },
        tasks:     { title: 'My Tasks', subtitle: 'View and manage all your tasks' },
        analytics: { title: 'Analytics', subtitle: 'Insights powered by Pandas & NumPy' }
    };

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.dataset.section;

            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(s => s.classList.remove('active'));
            const targetSection = document.getElementById('section-' + target);
            if (targetSection) targetSection.classList.add('active');

            if (pageTitle && sectionMeta[target]) {
                pageTitle.textContent = sectionMeta[target].title;
                pageSubtitle.textContent = sectionMeta[target].subtitle;
            }
        });
    });

    const taskForm = document.getElementById('addTaskForm');
    const taskList = document.getElementById('taskList');
    const recentTaskList = document.getElementById('recentTaskList');
    const filterBar = document.getElementById('filterBar');

    const elTotal = document.getElementById('totalTasks');
    const elCompleted = document.getElementById('completedTasks');
    const elPending = document.getElementById('pendingTasks');
    const elRate = document.getElementById('completionRate');

    const anTotal = document.getElementById('anTotalTasks');
    const anCompleted = document.getElementById('anCompletedTasks');
    const anPending = document.getElementById('anPendingTasks');
    const anRate = document.getElementById('anCompletionRate');
    const anHigh = document.getElementById('anHighCount');
    const anMedium = document.getElementById('anMediumCount');
    const anLow = document.getElementById('anLowCount');
    const anProgressPercent = document.getElementById('anProgressPercent');
    const anProgressBar = document.getElementById('anProgressBar');

    let allTasks = [];
    let currentFilter = 'all';

    if (filterBar) {
        filterBar.addEventListener('click', (e) => {
            const tab = e.target.closest('.filter-tab');
            if (!tab) return;
            filterBar.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderFullTaskList(allTasks);
        });
    }

    async function fetchTasks() {
        try {
            const response = await fetch('/api/tasks');
            allTasks = await response.json();
            renderFullTaskList(allTasks);
            renderRecentTasks(allTasks);
            updateFilterCounts(allTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    }

    function updateFilterCounts(tasks) {
        const countAll = document.getElementById('countAll');
        const countPending = document.getElementById('countPending');
        const countCompleted = document.getElementById('countCompleted');
        if (countAll) countAll.textContent = tasks.length;
        if (countPending) countPending.textContent = tasks.filter(t => t.status === 'Pending').length;
        if (countCompleted) countCompleted.textContent = tasks.filter(t => t.status === 'Completed').length;
    }

    function renderFullTaskList(tasks) {
        if (!taskList) return;
        taskList.innerHTML = '';

        let filtered = tasks;
        if (currentFilter === 'pending') filtered = tasks.filter(t => t.status === 'Pending');
        if (currentFilter === 'completed') filtered = tasks.filter(t => t.status === 'Completed');

        if (filtered.length === 0) {
            taskList.innerHTML = `<div class="empty-state"><i class="ph ph-clipboard-text"></i><p>No tasks found</p></div>`;
            return;
        }

        filtered.forEach(task => renderTaskCard(task, taskList));
    }

    function renderRecentTasks(tasks) {
        if (!recentTaskList) return;
        recentTaskList.innerHTML = '';

        const recent = tasks.slice(0, 4);
        if (recent.length === 0) {
            recentTaskList.innerHTML = `<div class="empty-state"><i class="ph ph-clipboard-text"></i><p>No tasks yet. Add your first task above!</p></div>`;
            return;
        }
        recent.forEach(task => renderTaskCard(task, recentTaskList));
    }

    function renderTaskCard(task, container) {
        const isCompleted = task.status === 'Completed';
        const card = document.createElement('div');
        card.className = `task-card ${isCompleted ? 'completed' : ''}`;

        const iconClass = task.priority.toLowerCase();
        const iconMap = { high: 'ph-fire', medium: 'ph-flag', low: 'ph-leaf' };

        card.innerHTML = `
            <div class="task-card-header">
                <div class="task-card-icon ${iconClass}">
                    <i class="ph-fill ${iconMap[iconClass] || 'ph-flag'}"></i>
                </div>
                <span class="badge badge-${task.status.toLowerCase()}">${task.status}</span>
            </div>
            <div class="task-card-title">${escapeHTML(task.title)}</div>
            ${task.description ? `<div class="task-card-desc">${escapeHTML(task.description)}</div>` : ''}
            <div class="task-card-footer">
                <div class="task-card-meta">
                    <span class="badge badge-${iconClass}">${task.priority}</span>
                    <span>${task.created_date}</span>
                </div>
                <div class="task-card-actions">
                    ${isCompleted
                        ? `<button class="complete-btn" onclick="updateTaskStatus(${task.id}, 'Pending')" title="Mark Pending"><i class="ph ph-arrow-counter-clockwise"></i></button>`
                        : `<button class="complete-btn" onclick="updateTaskStatus(${task.id}, 'Completed')" title="Complete"><i class="ph ph-check"></i></button>`
                    }
                    <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        `;
        container.appendChild(card);
    }

    async function fetchAnalytics() {
        try {
            const response = await fetch('/api/analytics');
            const data = await response.json();

            if (elTotal) elTotal.textContent = data.total_tasks;
            if (elCompleted) elCompleted.textContent = data.completed_tasks;
            if (elPending) elPending.textContent = data.pending_tasks;
            if (elRate) elRate.textContent = data.completion_percentage + '%';

            if (anTotal) anTotal.textContent = data.total_tasks;
            if (anCompleted) anCompleted.textContent = data.completed_tasks;
            if (anPending) anPending.textContent = data.pending_tasks;
            if (anRate) anRate.textContent = data.completion_percentage + '%';

            if (anProgressPercent) anProgressPercent.textContent = data.completion_percentage + '%';
            if (anProgressBar) anProgressBar.style.width = data.completion_percentage + '%';

            updatePriorityCounts();
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    }

    function updatePriorityCounts() {
        if (anHigh) anHigh.textContent = allTasks.filter(t => t.priority === 'High').length;
        if (anMedium) anMedium.textContent = allTasks.filter(t => t.priority === 'Medium').length;
        if (anLow) anLow.textContent = allTasks.filter(t => t.priority === 'Low').length;
    }

    function handleAddTask(e) {
        e.preventDefault();
        const form = e.target;
        const titleEl = document.getElementById('taskTitle');
        const priorityEl = document.getElementById('taskPriority');
        const descEl = document.getElementById('taskDesc');

        const title = titleEl.value;
        const priority = priorityEl.value;
        const desc = descEl.value;

        fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, priority, description: desc })
        })
        .then(response => {
            if (response.ok) {
                form.reset();
                fetchTasks();
                fetchAnalytics();
            } else {
                alert('Error adding task');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    if (taskForm) taskForm.addEventListener('submit', handleAddTask);

    window.updateTaskStatus = async (id, status) => {
        try {
            await fetch(`/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchTasks();
            fetchAnalytics();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    window.deleteTask = async (id) => {
        if (!confirm('Delete this task?')) return;
        try {
            await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
            fetchTasks();
            fetchAnalytics();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g,
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag])
        );
    }

    fetchTasks();
    fetchAnalytics();
});
