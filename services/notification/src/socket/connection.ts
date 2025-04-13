import { Server } from "socket.io";

// Socket connection
export const connectSocketIO = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    // // Chat socket
    // snapshotSocket(io);
};

