// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { MongodbConnection } from "@codeflare/common";
import { isEnvDefined } from "./utils/envChecker";
import { rabbitmq } from "./config/rabbitmq";
import { connectSocketIO } from "./socket/connection";
import http from "http";

// Start server
const startServer = async () => {
    try {
        // check all env are defined
        isEnvDefined();

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // connect to rabbitmq
        await rabbitmq.connect();

        const server = http.createServer(app);

        // socket connection
        connectSocketIO(server);

        //listen to port
        server.listen(process.env.PORT, () => {
            console.log(`Notification service running on port ${process.env.PORT}`);
        });
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
