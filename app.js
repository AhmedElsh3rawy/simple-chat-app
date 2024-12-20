import express from "express";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import http from "http";
import path from "path";

const app = express();

const server = http.createServer(app);

const io = new Server(server);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

let socketConnected = new Set();

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
    socketConnected.add(socket.id);

    io.emit("clients-total", socketConnected.size);

    // user disconnected
    socket.on("disconnect", () => {
        console.log("A user disconnect", socket.id);
        socketConnected.delete(socket.id);
    });

    socket.on("message", (data) => {
        console.log(data);
        // send to all users except the sender
        socket.broadcast.emit("chat-message", data);
    });

    socket.on("feedback", (data) => {
        socket.broadcast.emit("feedback", data);
    });
});

const PORT = 8080;

server.listen(PORT, () =>
    console.log(`[server]: running on localhost:${PORT}`),
);
