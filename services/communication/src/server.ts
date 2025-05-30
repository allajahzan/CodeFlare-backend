// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { redisConnection, MongodbConnection } from "@codeflare/common";
import http from 'http'
import { connectSocketIO } from "./socket/connection";
import { rabbitmq } from "./config/rabbitmq";
import { isEnvDefined } from "./utils/envChecker";

// server
const startServer = async () => {
    try {
         // check all env are defined
        isEnvDefined();
        
        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // connect to redis
        redisConnection();

        // connect to rabbitmq
        await rabbitmq.connect();

        // Chat socket connection initialization
        const server = http.createServer(app);
        connectSocketIO(server)

        //listen to port
        server.listen(process.env.PORT, () =>
            console.log("Communication service running on port 5000")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();