import express from "express";
import cors from "cors";
import http from "http"
import dotenv from "dotenv"
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { initSocket } from "./lib/socket.js";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const __dirname = path.resolve();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://livechat-1-fcqq.onrender.com", // ✅ Your frontend URL
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
}));
app.use(express.json());

app.use(authRoutes);
app.use(messageRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "Server is running!",
    status: "OK" 
  });
});


app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

const server = http.createServer(app)

initSocket(server);

server.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
  connectDB();
});