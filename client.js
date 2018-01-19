const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');
const cachedTodos = [];

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    const input = document.getElementById('todo-input');
    // Do not accept empty strings as todo's
    if(input.value === "") {
        alert("Must add a title for new TODO's!")
        return;
    }

    if(cachedTodos.findIndex(todo => todo.title === input.value) == -1) {
        const todo = {title: input.value, completed: false};
        addTodo(todo);

        // Emit the new todo as some data to the server
        server.emit('make', todo);
    }
    // Clear the input
    input.value = '';
}

// Adds Todo to client display and cache
function addTodo(todo) {
    render(todo);
    cachedTodos.push(todo);
}

// Complete All button handler
function completeAll() {
    completeAllTodos();
    server.emit('completeAll');
}

// Sets all todos in cache to completed
function completeAllTodos() {
    cachedTodos.forEach(todo => updateTodo({title: todo.title, completed: true}));
}

// Delete button handler
function deleteAll() {
    clearTodos();
    server.emit('deleteAll');
}

// Clears all Todos from client display and cache
function clearTodos() {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    const items = cachedTodos.length;
    for (let i = 0; i < items; i++) {
        cachedTodos.pop();
    }
}

// Removes todo from client, and server.
function remove(title) {
    removeTodo(title);
    server.emit('delete', title);
}

// Removes Todo from client cache and display
function removeTodo(title) {
    const index = cachedTodos.findIndex(todo => todo.title === title);
    cachedTodos.splice(index, 1);
    // Remove from display
    let listItem = document.getElementById(title);
    while(listItem.nodeName !== "LI") {
        listItem = listItem.parentElement;
    }
    list.removeChild(listItem);
}

// Checkbox handler
function update(title) {
    // const todo = updateTodoWithUI(title);
    const todoCheckBox = document.getElementById(title);
    const todo = updateTodoCache(title, todoCheckBox.checked);
    const todoText = todoCheckBox.parentElement.parentElement.nextSibling;
    todoText.className = todoCheckBox.checked ? "form-control list-group-item-secondary" : "form-control";

    server.emit('update', todo);
}

// Used for updates from server
function updateTodo(todo) {
    updateTodoCache(todo.title, todo.completed);
    // update display
    const todoCheckBox = document.getElementById(todo.title);
    todoCheckBox.checked = todo.completed;
    const todoText = todoCheckBox.parentElement.parentElement.nextSibling;
    todoText.className = todoCheckBox.checked ? "form-control list-group-item-secondary" : "form-control";
}

function updateTodoCache(title, completed) {
    const index = cachedTodos.findIndex(t => t.title === title);
    cachedTodos[index].completed = completed;
    return cachedTodos[index];
}

function render(todo) {
    const listItem = document.createElement('li');
    listItem.innerHTML = generateInnerHTML(todo);
    listItem.className = "list-group-item";

    list.append(listItem);
}

// Static HTML template for a list item utilizing bootstrap
function generateInnerHTML(todo) {
    return `<div class="row"><div class="col-9"><div class="input-group"><div class="input-group-prepend"><div class="input-group-text">
    <input type="checkbox" ${todo.completed ? "checked" : ""} id="${todo.title}" class="checkbox" onclick="update('${todo.title}')"></div></div><span class="${todo.completed ? "form-control list-group-item-secondary": "form-control"}">${todo.title}</span>
    </div></div><div class="col-3"><button class="btn btn-outline-danger float-right" onclick="remove('${todo.title}')">Delete</button></div></div>`;
}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    //If the server restarts, must remove the old li
    clearTodos();
    todos.forEach(todo => addTodo(todo));
});

server.on('addTodo', todo => addTodo(todo));

server.on('update', todo => updateTodo(todo));

server.on('remove', title => removeTodo(title));

server.on('completeAll', () => completeAllTodos());

server.on('deleteAll', () => clearTodos());

