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

    // Accepts when a client makes a new todo
    client.on('make', (todo) => {
        // Make a new todo
        const newTodo = new Todo(title=todo.title);
        // Push this newly created todo to our database
        DB.push(newTodo);
        // Send new todo to other clients only
        client.broadcast.emit('addTodo', todo);
    });

    // Updates a todo on DB, then broadcasts to others
    client.on('update', (todo) => {
        const index = DB.findIndex(t => t.title === todo.title);
        DB[index].completed = todo.completed;
        client.broadcast.emit('update', todo);
    })

    // Deletes a todo on DB, then broadcasts to others
    client.on('delete', (title) => {
        const index = DB.findIndex(todo => todo.title === title);
        DB.splice(index, 1);
        client.broadcast.emit('remove', title);
    });

    client.on('completeAll', () => {
        DB.forEach(todo => todo.completed = true);
        client.broadcast.emit('completeAll');
    });

    client.on('deleteAll', () => {
        const items = DB.length;
        for (let i = 0; i < items; i++) {
            DB.pop();
        }

        client.broadcast.emit('deleteAll');
    });

    // Send the DB downstream on connect
    // server.emit('load', DB) updates all clients
    // This only updates the client that connected
    client.emit('load', DB);
});

console.log('Waiting for clients to connect');
server.listen(3003);
