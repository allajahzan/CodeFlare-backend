import { Server } from "socket.io";
import http from "http";
import { chatSocket } from "./chatSocket";
import { videoCallSocket } from "./videoCallSocket";

// io instance
let io: Server;

/**
 * Connects socket.io to the server and sets up the chat, and video call sockets also notification events.
 * @param server - The server to connect socket.io to.
 */
export const connectSocketIO = (server: http.Server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL,
        },
    });

    io.on("connection", (socket) => {
        console.log("Socket io connected with id", socket.id);

        // Chat socket
        chatSocket(io, socket);

        // Video call socket
        videoCallSocket(socket);
    });
};

// Export the socket.io instance
export const getIO = () => io;
