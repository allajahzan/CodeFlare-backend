const morgan = require("morgan");
const winston = require("winston");
require("winston-daily-rotate-file");

// Create Winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
            filename: "logs/%DATE%-requests.log",
            datePattern: "YYYY-MM-DD",
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d",
        }),
    ],
});

// Morgan middleware to log HTTP requests
const morganMiddleware = morgan("combined", {
    stream: {
        write: (message: string) => logger.info(message.trim()),
    },
});

export { morganMiddleware, logger}
