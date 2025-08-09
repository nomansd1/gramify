import { PrismaClient } from "../db/generated/prisma/client.js";
import { ApiError } from "../utils/index.js";
import { StatusCodes } from "http-status-codes";

const prisma = new PrismaClient();

const connectToDatabase = async () => {
  try {
    
    await prisma.$connect();
    console.log("Connected to the database successfully.");

  } catch (error) {
    
    console.error("Error connecting to the database:", error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Database connection failed",
      error
    );

  }
};

connectToDatabase();

export default prisma;