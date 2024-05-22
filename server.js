if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const authRouter = require('./routes/authRoutes');
const { verifyToken } = require('./helpers/jwt');
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
  const self = verifyToken(socket.handshake.auth.token);

  if (!self) {
    socket.disconnect();
  }

  socket.emit('self', { self: { ...self, socketId: socket.id } });

  socket.on('call:start', ({ remoteId, self, signal }) => {
    io.to(remoteId).emit('call:started', { remote: self, signal });
  });

  socket.on('call:accept', ({ remoteId, self, signal }) => {
    io.to(remoteId).emit('call:accepted', { remote: self, signal });
  });

  socket.on('call:end', ({ remoteId }) => {
    io.to(remoteId).emit('call:ended');
  });

  // socket.emit('self', socket.id);

  // socket.on('call:start', ({ selfId, remoteId, signal }) => {
  //   // console.log({ selfId, remoteId }, '<<< ini call:start');
  //   io.to(remoteId).emit('call:started', { remoteId: selfId, signal });
  // });

  // socket.on('call:accept', ({ selfId, remoteId, signal }) => {
  //   // console.log({ selfId, remoteId }, '<<< ini call:accept');
  //   io.to(remoteId).emit('call:accepted', { remoteId: selfId, signal });
  // });

  // socket.on('call:end', ({ remoteId }) => {
  //   // console.log({ remoteId }, '<<< ini call:end');
  //   io.to(remoteId).emit('call:ended');
  // });
});

app.use(errorMiddleware);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}! 🚀`);
});
