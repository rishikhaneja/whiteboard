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

// ==== Socket.IO Events ==== //
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Relay drawing data to all other clients
  socket.on('draw', (data) => {
    socket.broadcast.emit('draw', data);
  });

  // Relay clear board event to all other clients
  socket.on('clear', () => {
    socket.broadcast.emit('clear');
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==== Start Server ==== //
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
