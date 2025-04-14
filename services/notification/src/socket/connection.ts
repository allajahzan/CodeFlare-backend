import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server;

// Socket connection
export const connectSocketIO = (server: HTTPServer) => {
    io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    // Socket io connection
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);
    });
};

// get io instance
export const getIO = () => io;
