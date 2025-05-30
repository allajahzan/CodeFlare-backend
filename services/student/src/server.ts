// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { redisConnection, MongodbConnection } from "@codeflare/common";
import { isEnvDefined } from "./utils/envChecker";
import "./jobs/attendenceMonitering";
import { rabbitmq } from "./config/rabbitmq";

// server
const startServer = async () => {
    try {
        // check all env are defined
        isEnvDefined();

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // connect to rabbitmq
        await rabbitmq.connect();

        // connect to redis
        redisConnection();

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("Student service running on port 3003")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
