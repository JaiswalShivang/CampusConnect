const { Server } = require("socket.io");
const Message = require("../models/Message");
const Club = require("../models/Club")

let users = {};
let io;

const socketConnection = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {

    socket.on("join", async ({ userId, username, clubId }) => {
      try {
        const club = await Club.findById(clubId);

        if (!club) return;

        const isAdmin = club.admin.toString() === userId;
        const isMember = club.members
          .map((id) => id.toString())
          .includes(userId);

        if (!isAdmin && !isMember) {
          socket.emit("error", "Not authorized to join this club");
          return socket.disconnect(); 
        }

        users[socket.id] = { username, clubId, userId };
        socket.join(clubId);
        io.to(clubId).emit("user-joined", username);
      } catch (error) {
        console.error("Join error:", error.message);
        socket.disconnect();
      }
    });

    socket.on("chat", async ({ message }) => {
      const userData = users[socket.id];
      if (!userData || !userData.clubId) return;

      const { username, clubId, userId } = userData;

      try {
        const savedMessage = await Message.create({
          club: clubId,
          sender: userId,
          content: message,
        });

        const senderUser = await require("../models/User").findById(userId);
        io.to(clubId).emit("receive", {
          username: senderUser?.name || username,
          photo: senderUser?.photo || null,
          userId: userId,
          message,
          timestamp: savedMessage.timestamp,
        });
      } catch (err) {
        console.error("Error saving message:", err.message);
      }
    });

    socket.on("disconnect", () => {
      const userData = users[socket.id];
      if (userData) {
        io.to(userData.clubId).emit("left", userData.username);
        delete users[socket.id];
        console.log(`${userData.username} left club ${userData.clubId}`);
      }
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { socketConnection, getIO };
