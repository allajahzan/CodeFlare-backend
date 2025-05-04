import * as grpc from "@grpc/grpc-js";
import {
    getUser,
    getUsers,
    updateUser,
    getStudentsIds,
} from "./server/userServer";
import { userProto } from "@codeflare/common";

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
            process.env.GRPC_URL as string,
            grpc.ServerCredentials.createInsecure(),
            () => {
                console.log("GRPC server for user service running on port 50052");
            }
        );
    } catch (err) {
        console.log(err);
    }
};
