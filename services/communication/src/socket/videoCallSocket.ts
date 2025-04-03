import { DefaultEventsMap, Server } from "socket.io";
import * as mediasoup from "mediasoup";

const rooms = new Map();
let worker: mediasoup.types.Worker;

const createWorker = async () => {
    try {
        worker = await mediasoup.createWorker({
            rtcMinPort: 2000,
            rtcMaxPort: 2020,
        });

        // console.log("worker created of PID", worker.pid);

        worker.on("died", (err) => {
            console.log(err);
        });

        return worker;
    } catch (err: unknown) {
        console.log(err);
    }
};

const createRouter = async (worker: mediasoup.types.Worker) => {
    try {
        const router = await worker.createRouter({
            mediaCodecs: [
                {
                    kind: "audio",
                    mimeType: "audio/opus",
                    clockRate: 48000,
                    channels: 2,
                },
                {
                    kind: "video",
                    mimeType: "video/VP8",
                    clockRate: 90000,
                    parameters: {
                        "x-google-start-bitrate": 1000,
                    },
                },
            ],
        });

        return router;
    } catch (err: unknown) {
        console.log(err);
    }
};

// Function to create a new room
async function createRoom(roomId: string) {
    if (!rooms.has(roomId)) {
        const worker = await createWorker();

        if (!worker) return;

        const router = await createRouter(worker);

        rooms.set(roomId, {
            router,
            peers: new Map(),
        });
    }
}

// Function to get room by id
function getRoom(roomId: string): {
    router: mediasoup.types.Router;
    peers: Map<
        string,
        {
            transports: mediasoup.types.WebRtcTransport[];
            producers: mediasoup.types.Producer[];
            consumers: mediasoup.types.Consumer[];
        }
    >;
} | null {
    const room = rooms.get(roomId);
    if (!room) return null;

    return room;
}

// Video call socket
export const videoCallSocket = (
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
    try {
        // Socket io connection
        io.on("connection", (socket) => {
            console.log("Socket io connected with id", socket.id);

            // Join room ================================================================
            socket.on("joinRoom", async ({ roomId }, callback) => {
                // check room exist in db , if not exist dont let user to join
                //
                //
                // Add db fetcing here

                const isRoomExist = rooms.get(roomId); // Temp for vc
                if (!isRoomExist) {
                    await createRoom(roomId);
                }

                // Get room by id
                const room = getRoom(roomId);
                if (!room) return;

                room.peers.set(socket.id, {
                    transports: [],
                    producers: [],
                    consumers: [],
                });

                // Join the specified room
                socket.join(roomId);

                callback(room.router.rtpCapabilities);
            });

            // create WebRtc Transport ==================================================
            socket.on(
                "createWebRtcTransport",
                async ({ sender, roomId }, callback) => {
                    try {
                        const room = getRoom(roomId); // Get room
                        if (!room) return;

                        const router = room.router; // Get router of room

                        // Create Transport
                        const transport = await createWebRtcTransport(router, sender);

                        if (!transport) return;

                        transport.appData.role = sender ? "producer" : "consumer"; // set role

                        const peer = room.peers.get(socket.id); // Get peer
                        if (!peer) return;

                        peer.transports.push(transport); // Push transport to peer

                        callback({
                            params: {
                                id: transport.id,
                                iceParameters: transport.iceParameters,
                                iceCandidates: transport.iceCandidates,
                                dtlsParameters: transport.dtlsParameters,
                            },
                        });
                    } catch (err: any) {
                        callback({
                            params: {
                                error: err,
                            },
                        });
                    }
                }
            );

            // Connect transport ========================================================
            socket.on(
                "connectTransport",
                async ({ roomId, transportId, dtlsParameters }) => {
                    const room = getRoom(roomId); // Get room
                    if (!room) return;

                    const peer = room.peers.get(socket.id); // Get peer
                    if (!peer) return;

                    // Find webrtc transport (consumer or producer)
                    const transport = peer.transports.find(
                        (transport) => transport.id === transportId
                    );

                    if (!transport) return;

                    // Connect to webrtc transport
                    await transport.connect({ dtlsParameters });

                    // console.log("Transport connected");
                }
            );

            // Produce transport ============================================================
            socket.on(
                "produceTransport",
                async (
                    {
                        roomId,
                        transportId,
                        kind,
                        rtpParameters,
                        isAudioMute,
                        isVideoMute,
                    },
                    callback
                ) => {
                    const room = getRoom(roomId); // Get room
                    if (!room) return;

                    const peer = room.peers.get(socket.id); // Get peer
                    if (!peer) return;

                    // Find webrtc transport (producer)
                    const transport = peer.transports.find(
                        (transport) => transport.id === transportId
                    );

                    if (!transport) return;

                    // Determine which mute state to set
                    const muteState =
                        kind === "audio"
                            ? { isAudioMute: isAudioMute ?? false }
                            : { isVideoMute: isVideoMute ?? false };

                    // Create producer
                    const producer = await transport.produce({
                        kind,
                        rtpParameters,
                        appData: {
                            socketId: socket.id,
                            ...muteState, // Set mute state
                        },
                    });

                    if (!producer) return;

                    // When producer is closed
                    producer.on("transportclose", () => {
                        console.log("Producer closed");
                        producer.close();
                    });

                    peer.producers.push(producer); // Push producer to peer

                    callback({ id: producer.id }); // To notify

                    // console.log("Producer created");

                    // Notify new producer to other peeers in the room
                    socket.broadcast.to(roomId).emit("newProducer", {
                        producerId: producer.id,
                        kind,
                        appData: producer.appData,
                        socketId: socket.id,
                    });
                }
            );

            // Consume transport ============================================================
            socket.on(
                "consume",
                async (
                    { roomId, transportId, producerId, rtpCapabilities, appData },
                    callback
                ) => {
                    try {
                        const room = getRoom(roomId); // Get room
                        if (!room) return;

                        const peer = room.peers.get(socket.id); // Get peer
                        if (!peer) return;

                        // Find webrtc transport (consumer)
                        const transport = peer.transports.find(
                            (transport) => transport.id === transportId
                        );

                        if (!transport) return;

                        const router = room.router; // Get router of room

                        if (router.canConsume({ producerId, rtpCapabilities })) {
                            // Create consumer
                            const consumer = await transport.consume({
                                producerId,
                                rtpCapabilities,
                                paused: true, // By default consumer is paused
                                appData,
                            });

                            if (!consumer) return;

                            // When consumer is closed
                            consumer.on("transportclose", () => {
                                console.log("Consumer closed");
                            });

                            // When producer is closed
                            consumer.on("producerclose", () => {
                                console.log("Producer closed");
                            });

                            peer.consumers.push(consumer); // Push consumer to peer

                            // console.log("Consumer created");

                            callback({
                                params: {
                                    id: consumer.id,
                                    producerId,
                                    kind: consumer.kind,
                                    rtpParameters: consumer.rtpParameters,
                                    appData: consumer.appData,
                                },
                            });
                        }
                    } catch (err: any) {
                        callback({
                            params: {
                                error: err,
                            },
                        });
                    }
                }
            );

            // To resume consumer ============================================================
            socket.on("resumeConsumer", async ({ roomId, consumerId }, callback) => {
                try {
                    const room = getRoom(roomId); // Get room
                    if (!room) return;

                    const peer = room.peers.get(socket.id); // Get peer
                    if (!peer) return;

                    // Find consumer
                    const consumer = peer.consumers.find(
                        (consumer) => consumer.id === consumerId
                    );

                    if (!consumer) return;

                    // Resume consumer
                    await consumer.resume();

                    callback({ params: { success: true } });

                    // console.log("consumer resumed");
                } catch (err: any) {
                    callback({ params: { success: false } });
                }
            });

            // Mute-Unmute toggle event =========================================================
            socket.on("muteToggle", ({ roomId, type, isMuted, socketId }) => {
                socket.broadcast
                    .to(roomId)
                    .emit("peerMuteChange", { type, isMuted, socketId });
            });

            // Socket disconnect ================================================================
            socket.on("disconnect", () => {
                console.log("Socket io disconnected with id", socket.id);
            });
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

// Create web rtc transport
const createWebRtcTransport = async (
    router: mediasoup.types.Router,
    sender: boolean
) => {
    try {
        const transport = await router.createWebRtcTransport({
            listenIps: [{ ip: "0.0.0.0", announcedIp: "127.0.0.1" }],
            enableUdp: true,
            enableTcp: true,
            preferUdp: true,
        });

        console.log(
            `${sender ? "producer" : "consumer"}` +
            " transport created " +
            transport.id
        );

        transport.on("dtlsstatechange", (dtlsState) => {
            if (dtlsState === "closed") {
                transport.close();
            }
        });

        transport.on("@close", () => {
            console.log(`${sender ? "producer" : "consumer"}` + " transport closed");
        });

        return transport;
    } catch (err: unknown) {
        console.log(err);
    }
};
