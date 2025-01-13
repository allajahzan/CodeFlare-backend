// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import mongose from "mongoose";
import { isEnvDefined } from "./utils/envChecker";


// server
const startServer = () => {
    try {
        // check all env are defined
        isEnvDefined();

        // connect to db
        mongose.connect(process.env.MONGO_DB_URL as string);

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("Authentication service running on port 3000")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
