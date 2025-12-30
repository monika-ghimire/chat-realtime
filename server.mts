import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

type User = {
  username: string;
  room: string;
  socketId: string;
};

const users: Record<string, User> = {};

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);

  const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  io.on("connection", (socket) => {
    console.log(`✅ user connected: ${socket.id}`);

    // Send current active users immediately on connect
    socket.emit("active_users", Object.values(users));

    // Join room
    socket.on("join-room", ({ room, username }) => {
      users[socket.id] = { username, room, socketId: socket.id };
      socket.join(room);

      // Emit updated active users to everyone
      io.emit("active_users", Object.values(users));

      socket.to(room).emit("user_joined", `${username} joined room`);
    });

    socket.on("typing", () => {
      const user = users[socket.id];
      if (!user) return;
      socket.to(user.room).emit("typing", user.username);
    });

    socket.on("stop_typing", () => {
      const user = users[socket.id];
      if (!user) return;
      socket.to(user.room).emit("stop_typing", user.username);
    });

    // Private message
    socket.on("private-message", ({ toSocketId, message }) => {
      const sender = users[socket.id]?.username;
      if (!sender) return;
      io.to(toSocketId).emit("private-message", { sender, message });
    });

    // Disconnect
    socket.on("disconnect", () => {
      const user = users[socket.id];
      delete users[socket.id];

      io.emit("active_users", Object.values(users));

      if (user)
        socket.to(user.room).emit("user_left", `${user.username} left room`);
      console.log(`❌ user disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 server running on http://${hostname}:${port}`);
  });
});
