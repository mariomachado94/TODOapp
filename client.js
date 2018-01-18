const server = io('http://localhost:3003/');
const list = document.getElementById('todo-list');

// NOTE: These are all our globally scoped functions for interacting with the server
// This function adds a new todo from the input
function add() {
    console.warn(event);
    const input = document.getElementById('todo-input');

    // Emit the new todo as some data to the server
    server.emit('make', {
        title : input.value
    });

    // Clear the input
    input.value = '';
    // TODO: refocus the element
}

function update(title) {
    const todoCheckBox = document.getElementById(title);

    server.emit('update', {
        title : title,
        completed : todoCheckBox.checked
    });

}

function remove(title) {
    removeTodoElmnt(title)
    server.emit('delete', title);
}

function removeTodoElmnt(title) {
    const listItem = document.getElementById(title).parentElement;
    list.removeChild(listItem);
}

function render(todo) {
    console.log(todo);
    const listItem = document.createElement('li');

    const checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.checked = todo.completed;
    checkBox.id = todo.title;
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
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
    todos.forEach((todo) => render(todo));
});

server.on('loadNewTodo', (todo) =>{
    render(todo);
});

server.on('update', (todo) => {
    const todoCheckBox = document.getElementById(todo.title);
    todoCheckBox.checked = todo.completed;
});

server.on('remove', (title) => {
    removeTodoElmnt(title);
});

