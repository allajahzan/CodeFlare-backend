// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { redisConnection, MongodbConnection } from "@codeflare/common";
import { isEnvDefined } from "./utils/envChecker";
import http from 'http'

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

        // Http server
        const server = http.createServer(app)

        //listen to port
        server.listen(process.env.PORT, () =>
            console.log("Instructor service running on port 3002")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
