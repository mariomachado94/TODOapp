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
        server.emit('update', todo);
    }

    // Accepts when a client makes a new todo
    client.on('make', (t) => {
        // Make a new todo
        const newTodo = new Todo(title=t.title);
        // Push this newly created todo to our database
        DB.push(newTodo);

        // Send the latest todos to the client
        loadNewTodo(newTodo);
    });

    // Send the DB downstream on connect
    // server.emit('load', DB) updates all clients
    // This only updates the client that connected
    client.emit('load', DB);
});

console.log('Waiting for clients to connect');
server.listen(3003);
