import { userProto } from "@codeflare/common";
import * as grpc from "@grpc/grpc-js";

const userClient = new (userProto as any).UserService(
    process.env.GRPC_URL,
    grpc.credentials.createInsecure()
);

export { userClient };
