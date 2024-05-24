const { createServer } = require('http');
const { Server } = require('socket.io');
const { verifyToken } = require('./helpers/jwt');
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  const { token } = socket.handshake.auth;

  if (!token) {
    socket.disconnect();
  }

  const self = { ...verifyToken(token), socketId: socket.id };

  socket.emit('self', { self });

  socket.on('call:start', ({ remoteId, self, signal }) => {
    io.to(remoteId).emit('call:started', { remote: self, signal });
  });

  socket.on('call:accept', ({ remoteId, self, signal }) => {
    io.to(remoteId).emit('call:accepted', { remote: self, signal });
  });

  socket.on('call:end', ({ remoteId }) => {
    io.to(remoteId).emit('call:ended');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}! 🚀`);
});
