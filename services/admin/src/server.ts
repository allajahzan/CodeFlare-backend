// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { isEnvDefined } from "./utils/envChecker";

// Start Server
const startServer = async () => {
    try {
        // Check all env are defined
        isEnvDefined()

        // port listening
        app.listen(process.env.PORT, () => {
            console.log(`Admin service running on port ${process.env.PORT}`);
        });
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
