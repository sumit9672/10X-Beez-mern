require("dotenv").config();

const path = require("path");
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const adRoutes = require("./routes/adRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;

// =========================
// DATABASE
// =========================
connectDB();

// =========================
// MIDDLEWARE
// =========================
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// =========================
// LOG REQUESTS
// =========================
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// =========================
// STATIC UPLOADS
// =========================
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =========================
// ROUTES
// =========================
app.use("/api/auth", authRoutes);
app.use("/api/ads", adRoutes);
app.use("/api/chat", chatRoutes);


// =========================
// HOME
// =========================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "10X BEEZ API is running 🚀",
  });
});

// =========================
// TEST API
// =========================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "Test API working 🔥",
  });
});

// =========================
// SOCKET.IO
// =========================
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);

    console.log(
      `👤 ${socket.id} joined room: ${roomId}`
    );
  });

  socket.on("send-message", (message) => {
    console.log("💬 Message received:", message);

    io.to(message.roomId).emit(
      "receive-message",
      message
    );
  });

  socket.on("disconnect", () => {
    console.log("🔴 User disconnected:", socket.id);
  });
});

// =========================
// SERVER
// =========================
server.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );

  console.log(
    "Socket.IO server is ready 🚀"
  );
});