// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectRedis, MongodbConnection } from "@codeflare/common";
import http from 'http'
import { chatSocket } from "./socket/chatSocket";

// server
const startServer = async () => {
    try {
        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // connect to redis
        connectRedis();

        // Chat socket connection initialization
        const server = http.createServer(app);
        chatSocket(server);

        //listen to port
        server.listen(process.env.PORT, () =>
            console.log("Communication service running on port 5000")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();