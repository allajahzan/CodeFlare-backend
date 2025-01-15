// dotenv config
import dotenv from "dotenv"; 
dotenv.config();

import app from "./app";

// Start Server
const startServer = async () => {
    try {
        // port listening
        app.listen(process.env.PORT, () => {
            console.log(`Admin service running on port ${process.env.PORT}`);
        });
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
