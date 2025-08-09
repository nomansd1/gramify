import dotenv from "dotenv";

dotenv.config({ path: '.env' });

const CORS_ORIGIN = process.env.CORS;
const PORT = process.env.PORT;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY;

// Options for cookies
const options = {
    httpOnly: true,
    secure: true
};

export { 
    PORT, 
    CORS_ORIGIN,
    ACCESS_TOKEN_SECRET, 
    ACCESS_TOKEN_EXPIRY,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY,
    options
};