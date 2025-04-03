import { Server } from "socket.io";
import { chatSocket } from "./chatSocket";
import { videoCallSocket } from "./videoCallSocket";

/**
 * Connects socket.io to the server and sets up the chat and video call sockets.
 * @param server - The server to connect socket.io to.
 */
export const connectSocketIO = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    // Chat socket
    chatSocket(io);

    // Video call socket
    videoCallSocket(io);
};
