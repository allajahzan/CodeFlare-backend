// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { isEnvDefined } from "./utils/envChecker";
import { MongodbConnection } from "@codeflare/common";

// Start Server
const startServer = async () => {
    try {
        // Check all env are defined
        isEnvDefined();

        // Connect to MongoDB
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // port listening
        app.listen(process.env.PORT, () => {
            console.log(`Admin service running on port ${process.env.PORT}`);
        });
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
