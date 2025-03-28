import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";
import {
    getUser,
    getUsers,
    updateUser,
    getStudentsIds,
} from "./server/userServer";

// Load user proto file
const packageDefinition = protoLoader.loadSync(
    path.join(__dirname, "/proto/user.proto")
);

// Load user proto
const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// GRPC server for user service
export const startGrpcServer = () => {
    try {
        const server = new grpc.Server();

        // Regiser user service gRPC functions
        server.addService((userProto as any).UserService.service, {
            getUser,
            getUsers,
            updateUser,
            getStudentsIds,
        });

        // Bind server
        server.bindAsync(
            "0.0.0.0:50052",
            grpc.ServerCredentials.createInsecure(),
            () => {
                console.log("GRPC server for user service running on port 50052");
            }
        );
    } catch (err) {
        console.log(err);
    }
};
