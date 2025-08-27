import { Server } from "socket.io";
import { ApiError } from "./index.js";
import { StatusCodes } from "http-status-codes";
import { CORS_ORIGIN } from "./constants.js";

let io;

export const intiSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: CORS_ORIGIN,
            methods: ["GET", "POST"]
        }
    });

    return io;
};

export const getSocket = () => {
    if (!io) {
        throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, "Socket.io not initialized");
    }
    return io;
}