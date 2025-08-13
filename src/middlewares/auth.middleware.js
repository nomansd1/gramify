import jwt from "jsonwebtoken";
import { asyncHandler, ApiError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";
import { ACCESS_TOKEN_SECRET } from "../utils/constants.js";
import prisma from "../db/index.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace('Bearer', '').trim();

        if (!token) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Unauthorized request");
        }

        const decodedToken = jwt.verify(token, ACCESS_TOKEN_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decodedToken?.id },
            select: {
                id: true,
                email: true,
                name: true,
            }
        });

        if (!user) {
            throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token");
        }

        req.user = user;
        next();

    } catch (error) {
        throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid access token", error.errors);
    }
});

export default verifyJWT;