// ==== Imports and Setup ==== //
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ==== Static File Serving ==== //
app.use(express.static(path.join(__dirname, 'public')));

// ==== State ==== //
const boardState = [];
const usernames = {};

// ==== Events ==== //
io.on('connection', (socket) => {
  // Send current board state to new user
  socket.emit('board-state', boardState);
  console.log('A user connected:', socket.id);

  // Relay drawing data to all other clients
  socket.on('draw', (data) => {
    boardState.push(data);
    socket.broadcast.emit('draw', data);
  });

  // Relay clear board event to all other clients
  socket.on('clear', () => {
    boardState.length = 0;
    socket.broadcast.emit('clear');
  });

  // Handle username setting
  socket.on('set-username', (username) => {
    usernames[socket.id] = username;
    io.emit('user-list', Object.values(usernames));
    console.log(`User ${socket.id} set username: ${username}`);
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    delete usernames[socket.id];
    io.emit('user-list', Object.values(usernames));
    console.log('User disconnected:', socket.id);
  });
});

// ==== Start Server ==== //
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
