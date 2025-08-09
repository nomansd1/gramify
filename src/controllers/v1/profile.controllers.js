import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

const getProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
    }
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

    res.status(StatusCodes.OK).json(
        new ApiResponse(StatusCodes.OK, "User profile retrieved successfully", user)
    );

});

const updateProfile = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { username, name, bio, profilePicture } = req.body;

    if (username) {
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser && existingUser.id !== id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Username already exists");
        }
    }

    const user = await prisma.user.update({
        where: { id },
        data: {
            username,
            name,
            bio,
            profilePicture
        },
        select: {
            id: true,
            username: true,
            name: true,
            bio: true,
            profilePicture: true,
            updatedAt: true
        }
    });


});

export { getProfile, updateProfile };