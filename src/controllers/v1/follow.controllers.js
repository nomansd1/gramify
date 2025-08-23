import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";

export const followUser = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { user } = req;

  if (user.id === userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot follow yourself");
  }

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: user.id,
      followingId: userId,
    },
  });

  if (existingFollow) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "You are already following this user"
    );
  }

  const follow = await prisma.follow.create({
    data: {
      followerId: user.id,
      followingId: userId,
    },
  });

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(StatusCodes.CREATED, "User followed successfully", follow)
    );
});

export const unfollowUser = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { user } = req;

  if (user.id === userId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot unfollow yourself");
  }

  const existingFollow = await prisma.follow.findFirst({
    where: {
      followerId: user.id,
      followingId: userId,
    },
  });

  if (!existingFollow) {
    throw new ApiError(
      StatusCodes.NOT_FOUND,
      "You are not following this user"
    );
  }

  await prisma.follow.delete({
    where: {
      id: existingFollow.id,
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "User unfollowed successfully"));
});

export const getFollowers = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  let followers = await prisma.follow.findMany({
    where: {
      followingId: userId,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  followers = followers.map((follow) => follow.follower);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        "Followers retrieved successfully",
        followers
      )
    );
});

export const getFollowing = asyncHandler(async (req, res) => {
  const { id: userId } = req.params;
  const { page = 1 } = req.query;
  const limit = 10;
  const skip = (page - 1) * limit;

  let following = await prisma.follow.findMany({
    where: {
      followerId: userId,
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      following: {
        select: {
          id: true,
          username: true,
          name: true,
          profilePicture: true,
        },
      },
    },
  });

  following = following.map((follow) => follow.following);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        "Following retrieved successfully",
        following
      )
    );
});