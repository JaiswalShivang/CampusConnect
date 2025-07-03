const express = require("express");
const app = express();

require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const http = require("http");

const dbconnect = require("./config/database");
dbconnect();

const { cloudinaryConnect } = require("./config/cloudinary");
cloudinaryConnect();

const { socketConnection } = require("./utils/socket"); 

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ['https://campusconnect-tau.vercel.app/'],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
}));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

const announcementRoutes = require('./routes/announcementRoutes');
const authRoutes = require('./routes/authRoutes');
const clubRoutes = require('./routes/clubRoutes');
const eventRoutes = require('./routes/eventRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');

app.use("/announcement", announcementRoutes);
app.use("/auth", authRoutes);
app.use("/club", clubRoutes);
app.use("/event", eventRoutes);
app.use("/user", userRoutes);
app.use("/messages", messageRoutes);

const server = http.createServer(app);
socketConnection(server); 

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
