// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { redisConnection, MongodbConnection } from "@codeflare/common";
import { isEnvDefined } from "./utils/envChecker";
import { startGrpcServer } from "./grpc/grpcServer";

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

        // start grpc server
        startGrpcServer()

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("User service running on port 3000")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
