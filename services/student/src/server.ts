// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectRedis, MongodbConnection } from "@codeflare/common";
import { isEnvDefined } from "./utils/envChecker";
import "./utils/cronjob";

// server
const startServer = async () => {
    try {
        // check all env are defined
        isEnvDefined();

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // connect to redis
        connectRedis();

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("Student service running on port 3003")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
