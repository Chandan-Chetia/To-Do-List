document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoInput = document.getElementById('todo-input');
    const addBtn = document.getElementById('add-btn');
    const todoList = document.getElementById('todo-list');
    const clearAllBtn = document.getElementById('clear-all');
    const clearCompletedBtn = document.getElementById('clear-completed');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('task-count');
    const completedCount = document.getElementById('completed-count');
    const currentDate = document.getElementById('current-date');
    const appVersion = document.getElementById('app-version');

    // Current date display
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = new Date().toLocaleDateString('en-US', options);

    // App version
    appVersion.textContent = 'v1.1.0';

    // Current filter
    let currentFilter = 'all';

    // Load tasks from localStorage
    loadTasks();

    // Event listeners
    addBtn.addEventListener('click', addTask);
    todoInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    clearAllBtn.addEventListener('click', clearAllTasks);
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            filterTasks(currentFilter);
        });
    });

    // Functions
    function addTask() {
        const taskText = todoInput.value.trim();
        if (taskText) {
            const taskItem = createTaskElement(taskText);
            todoList.appendChild(taskItem);
            todoInput.value = '';
            saveTasks();
            updateTaskCount();
            animateAdd(taskItem);
        }
    }

    function createTaskElement(taskText) {
        const li = document.createElement('li');
        li.dataset.created = Date.now();
        
        const checkbox = document.createElement('button');
        checkbox.className = 'task-btn';
        checkbox.innerHTML = '<i class="far fa-circle"></i>';
        
        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = taskText;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'task-btn';
        editBtn.innerHTML = '<i class="far fa-edit"></i>';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-btn delete-btn';
        deleteBtn.innerHTML = '<i class="far fa-trash-alt"></i>';
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        
        li.appendChild(checkbox);
        li.appendChild(taskSpan);
        li.appendChild(actionsDiv);
        
        // Toggle completed status
        checkbox.addEventListener('click', function() {
            taskSpan.classList.toggle('completed');
            checkbox.innerHTML = taskSpan.classList.contains('completed') ? 
                '<i class="fas fa-check-circle"></i>' : '<i class="far fa-circle"></i>';
            saveTasks();
            updateTaskCount();
        });
        
        // Edit task
        editBtn.addEventListener('click', function() {
            const newText = prompt('Edit task:', taskSpan.textContent);
            if (newText !== null && newText.trim() !== '') {
                taskSpan.textContent = newText.trim();
                saveTasks();
            }
        });
        
        // Delete task
        deleteBtn.addEventListener('click', function() {
            animateRemove(li, () => {
                li.remove();
                saveTasks();
                updateTaskCount();
            });
        });
        
        return li;
    }

    function clearAllTasks() {
        if (todoList.children.length > 0 && confirm('Are you sure you want to delete all tasks?')) {
            animateClearAll(() => {
                todoList.innerHTML = '';
                saveTasks();
                updateTaskCount();
            });
        }
    }

    function clearCompletedTasks() {
        const completedTasks = document.querySelectorAll('.task-text.completed');
        if (completedTasks.length > 0) {
            if (confirm(`Are you sure you want to delete ${completedTasks.length} completed tasks?`)) {
                completedTasks.forEach(task => {
                    const li = task.closest('li');
                    animateRemove(li, () => {
                        li.remove();
                        saveTasks();
                        updateTaskCount();
                    });
                });
            }
        } else {
            alert('No completed tasks to clear!');
        }
    }

    function filterTasks(filter) {
        const tasks = document.querySelectorAll('#todo-list li');
        tasks.forEach(task => {
            const isCompleted = task.querySelector('.task-text').classList.contains('completed');
            
            switch(filter) {
                case 'all':
                    task.style.display = 'flex';
                    break;
                case 'active':
                    task.style.display = isCompleted ? 'none' : 'flex';
                    break;
                case 'completed':
                    task.style.display = isCompleted ? 'flex' : 'none';
                    break;
            }
        });
    }

    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#todo-list li').forEach(li => {
            tasks.push({
                text: li.querySelector('.task-text').textContent,
                completed: li.querySelector('.task-text').classList.contains('completed'),
                created: li.dataset.created
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            const tasks = JSON.parse(savedTasks);
            tasks.forEach(task => {
                const taskItem = createTaskElement(task.text);
                if (task.completed) {
                    taskItem.querySelector('.task-text').classList.add('completed');
                    taskItem.querySelector('.task-btn').innerHTML = '<i class="fas fa-check-circle"></i>';
                }
                taskItem.dataset.created = task.created;
                todoList.appendChild(taskItem);
            });
            updateTaskCount();
        }
    }

    function updateTaskCount() {
        const totalTasks = document.querySelectorAll('#todo-list li').length;
        const completedTasks = document.querySelectorAll('.task-text.completed').length;
        const activeTasks = totalTasks - completedTasks;
        
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
        completedCount.textContent = `${completedTasks} ${completedTasks === 1 ? 'task' : 'tasks'} completed`;
    }

    // Animation functions
    function animateAdd(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    }

    function animateRemove(element, callback) {
        element.style.opacity = '0';
        element.style.transform = 'translateX(50px)';
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            callback();
        }, 300);
    }

    function animateClearAll(callback) {
        const items = Array.from(todoList.children);
        let delay = 0;
        
        items.forEach(item => {
            setTimeout(() => {
                item.style.opacity = '0';
                item.style.transform = 'translateX(50px)';
                item.style.transition = 'all 0.3s ease';
            }, delay);
            delay += 50;
        });
        
        setTimeout(callback, delay + 300);
    }

    // Initialize
    updateTaskCount();
});

