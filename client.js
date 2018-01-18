const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');
const cachedTodos = [];

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    const input = document.getElementById('todo-input');
    const todo = {title: input.value, completed: false};
    addTodo(todo);
    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });

    // Clear the input
    input.value = '';
    // TODO: refocus the element
}

// Complete All button handler
function completeAll() {
    completeAllTodos();
    server.emit('completeAll');
}

function completeAllTodos() {
    const items = document.getElementsByClassName("checkbox");
    for (let i = 0; i < items.length; i++) {
        items[i].checked = true;
    }
    cachedTodos.forEach(todo => todo.completed = true);
}

// Delete button handler
function deleteAll() {
    clearTodos();
    server.emit('deleteAll');
}

// Checkbox handler
function update(title) {
    const todoCheckBox = document.getElementById(title);
    const todo = updateTodo(title, todoCheckBox.checked);

    server.emit('update', todo);
}

// Updates todo in cache, returns updated todo
function updateTodo(title, completed) {
    const index = cachedTodos.findIndex(t => t.title === title);
    cachedTodos[index].completed = completed;
    return cachedTodos[index];
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
    removeTodoElmnt(title);
}

// Removes Todo from client display
function removeTodoElmnt(title) {
    const listItem = document.getElementById(title).parentElement;
    list.removeChild(listItem);
}

function render(todo) {
    const listItem = document.createElement('li');

    const checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.checked = todo.completed;
    checkBox.id = todo.title;
    checkBox.className = "checkbox";
    checkBox.addEventListener("click", () => update(todo.title));

    const delBtn = document.createElement('button');
    delBtn.appendChild(document.createTextNode("Delete"));
    delBtn.addEventListener("click", () => remove(todo.title));

    const listItemText = document.createTextNode(todo.title);
    listItem.appendChild(checkBox);
    listItem.appendChild(listItemText);
    listItem.appendChild(delBtn);

    list.append(listItem);
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

// Adds Todo to client display and cache
function addTodo(todo) {
    render(todo);
    cachedTodos.push(todo);
}

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    //If the server restarts, must remove the old li
    clearTodos();
    todos.forEach(todo => addTodo(todo));
});

server.on('loadNewTodo', (todo) =>{
    addTodo(todo);
});

server.on('update', (todo) => {
    updateTodo(todo.title, todo.completed);
    document.getElementById(todo.title).checked = todo.completed;
});

server.on('remove', (title) => {
    removeTodo(title);
});

server.on('completeAll', () => completeAllTodos());

server.on('deleteAll', () => clearTodos());

