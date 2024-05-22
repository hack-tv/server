if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { LoginController } = require('./controllers/loginController');

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
app.post('/login/google', LoginController.googleLogin);

io.on('connection', (socket) => {
  socket.emit('self', socket.id);

  socket.on('call:start', ({ selfId, remoteId, signal }) => {
    // console.log({ selfId, remoteId }, '<<< ini call:start');
    io.to(remoteId).emit('call:started', { remoteId: selfId, signal });
  });

  socket.on('call:accept', ({ selfId, remoteId, signal }) => {
    // console.log({ selfId, remoteId }, '<<< ini call:accept');
    io.to(remoteId).emit('call:accepted', { remoteId: selfId, signal });
  });

  socket.on('call:end', ({ remoteId }) => {
    // console.log({ remoteId }, '<<< ini call:end');
    io.to(remoteId).emit('call:ended');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}! 🚀`);
});
