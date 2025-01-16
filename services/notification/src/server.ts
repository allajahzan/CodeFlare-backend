// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";

// Start server
const startServer = () => {
    try {
        //listen to port
        app.listen(process.env.PORT, () => {
            console.log(`Notification service running on port ${process.env.PORT}`);
        });
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
