import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  uploadOnImageKit,
  deleteFromImageKit,
} from "../../utils/index.js";

export const getProfile = asyncHandler(async (req, res) => {
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
    },
  });

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        "User profile retrieved successfully",
        user
      )
    );
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, name, bio } = req.body;

  if (req.user.id !== id) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You can only edit your own profile"
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      profilePicture: true,
      profilePictureId: true,
    },
  });

  let profilePictureLocalPath,
    profilePictureCloudPath,
    profilePictureId,
    folderPath = null;
  if (
    req.files &&
    Array.isArray(req.files.profilePicture) &&
    req.files.profilePicture.length > 0
  ) {
    profilePictureLocalPath = req.files.profilePicture[0].path;
  }

  if (profilePictureLocalPath) {
    folderPath = `users/${id}/profilePicture`;
    const { url, fileId } = await uploadOnImageKit(
      profilePictureLocalPath,
      folderPath
    );
    profilePictureCloudPath = url;
    profilePictureId = fileId;

    if (profilePictureCloudPath) {
      await deleteFromImageKit(existingUser.profilePictureId);
    }
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(name && { name }),
        ...(bio && { bio }),
        ...(profilePictureCloudPath && {
          profilePicture: profilePictureCloudPath,
        }),
        ...(profilePictureId && { profilePictureId }),
      },
      select: {
        id: true,
        username: true,
        name: true,
        bio: true,
        profilePicture: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          "User profile updated successfully",
          user
        )
      );

  } catch (error) {
    
    if (profilePictureId) {
      await deleteFromImageKit(profilePictureId);
    }
    
    throw error;
  }
});

export const getProfilePosts = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1 } = req.query;
  const limit = 6;
  const skip = (page - 1) * limit;

  const profilePosts = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      posts: {
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          caption: true,
          createdAt: true,
          updatedAt: true,
          media: {
            select: {
              id: true,
              type: true,
              url: true,
            }
          },
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              profilePicture: true,
            },
          },
        }
      }
    }
  });

  if (!profilePosts) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  return res.status(StatusCodes.OK).json(
    new ApiResponse(
      StatusCodes.OK,
      "Profile posts retrieved successfully",
      profilePosts.posts
    )
  );
});