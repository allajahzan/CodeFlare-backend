// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectRedis, MongodbConnection } from "@codeflare/common";


// server
const startServer = async () => {
    try {
      

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // connect to redis
        connectRedis();

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("Authentication service running on port 3000")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();