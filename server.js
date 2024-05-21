const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());

io.on('connection', (socket) => {
  console.log('user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}! 🚀`);
});
