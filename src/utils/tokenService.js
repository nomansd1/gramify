import jwt from "jsonwebtoken";
import { 
    ACCESS_TOKEN_SECRET, 
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY 
} from "./constants.js";

const generateAccessToken = (user) => {
    const payload = { id: user.id, username: user.username };
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

const generateRefreshToken = (user) => {
    const payload = { id: user.id };
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

export { generateAccessToken, generateRefreshToken };