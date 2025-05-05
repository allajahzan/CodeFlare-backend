import { userProto } from "@codeflare/common";
import * as grpc from "@grpc/grpc-js";

const userClient = new (userProto as any).UserService(
    "localhost:50052",
    grpc.credentials.createInsecure()
);

export { userClient };
