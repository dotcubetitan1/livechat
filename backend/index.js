import express from "express";
import cors from "cors";
import http from "http"
import dotenv from "dotenv"
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { initSocket } from "./lib/socket.js";
import groupRoutes from "./routes/group.route.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({
  origin: "*",
  credentials: true
}));

app.use(express.json());

app.use(authRoutes);
app.use(messageRoutes);
app.use("/groups", groupRoutes)

app.get("/", (req, res) => {
  res.json({
    message: "Server is running!",
    status: "OK"
  });
});

const server = http.createServer(app)

initSocket(server);

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});