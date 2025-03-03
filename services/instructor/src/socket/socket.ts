import { Server } from "socket.io";
import { ReviewRepository } from "../repository/implementation/reviewRepository";
import Review from "../schema/reviewSchema";
import { ReviewService } from "../service/implementation/reviewService";

// Dependency Injunction
const reviewRepository = new ReviewRepository(Review);
const reviewService = new ReviewService(reviewRepository);

// Instructor Socket
export const instructorSocket = (server: any) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
        },
    });

    // Connect to socket
    io.on("connection", (socket) => {
        console.log("Socket connected", socket.id);

        // Load reviews on scroll
        socket.on(
            "loadReviews",
            async (
                keyword: string,
                sort: string,
                order: number,
                date: string,
                status: string,
                batchIds: string[],
                skip: number
            ) => {
                const reviews = await reviewService.searchReviews(
                    keyword,
                    sort,
                    order,
                    date,
                    status,
                    batchIds,
                    skip
                );

                if (reviews && reviews.length) {
                    io.to(socket.id).emit("loadedReviews", reviews);
                } else {
                    io.to(socket.id).emit("loadedReviews", []);
                }
            }
        );

        // Disconnect the socket
        socket.on("disconnect", () => {
            console.log("Socket disconnected", socket.id);
        });
    });
};
