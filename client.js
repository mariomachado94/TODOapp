const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');
const cachedTodos = [];

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    const input = document.getElementById('todo-input');
    // Do not accept empty strings as todo's
    if(input.value === "") {
        alert("Must add a title for the TODO!")
        return;
    }

    if(cachedTodos.findIndex(todo => todo.title === input.value) == -1) {
        const todo = {title: input.value, completed: false};
        addTodo(todo);

        // Emit the new todo as some data to the server
        server.emit('make', todo);
        // TODO: refocus the element
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
    const listItem = document.getElementById(title).parentElement;
    list.removeChild(listItem);
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

// NOTE: These are listeners for events from the server
// This event is for (re)loading the entire list of todos from the server
server.on('load', (todos) => {
    //If the server restarts, must remove the old li
    clearTodos();
    todos.forEach(todo => addTodo(todo));
});

server.on('addTodo', (todo) =>{
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

