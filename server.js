if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');

const { verifyToken } = require('./helpers/jwt');
const authRouter = require('./routes/authRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/auth', authRouter);

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

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}! 🚀`);
});
