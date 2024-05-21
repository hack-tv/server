if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { LoginController } = require("./controllers/loginController");

const PORT = process.env.PORT || 3000;

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post("/login/google", LoginController.googleLogin);

io.on("connection", (socket) => {
  console.log("user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}! 🚀`);
});
