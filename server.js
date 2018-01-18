const server = require('socket.io')();
const firstTodos = require('./data');
const Todo = require('./todo');

// This is going to be our fake 'database' for this application
// Parse all default Todo's from db
const DB = firstTodos.map((t) => {
    // Form new Todo objects
    return new Todo(title=t.title);
});

server.on('connection', (client) => {

    function loadNewTodo(todo) {
        server.emit('loadNewTodo', todo);
    }

    function updateTodo(todo){
        // Broadcasts update to other clients only
        client.broadcast.emit('update', todo);
    }

    // Accepts when a client makes a new todo
    client.on('make', (todo) => {
        // Make a new todo
        const newTodo = new Todo(title=todo.title);
        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the new todo to the client
        loadNewTodo(newTodo);
    });

    client.on('update', (todo) => {
        const index = DB.findIndex(t => t.title === todo.title);
        DB[index].completed = todo.completed;
        updateTodo(todo);
    })

    // Send the DB downstream on connect
    // server.emit('load', DB) updates all clients
    // This only updates the client that connected
    client.emit('load', DB);
});

console.log('Waiting for clients to connect');
server.listen(3003);
