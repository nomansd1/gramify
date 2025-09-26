import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
  deleteFromImageKit,
  bulkUploadOnImageKit,
} from "../../utils/index.js";
import { getSocket } from "../../utils/socket.js";

export const uploadStory = asyncHandler(async (req, res) => {
  const { caption } = req.body;
  const id = req.user.id;

  const files = req.files.story;
  const hasMedia = files.length > 0;

  if (!hasMedia) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Please upload a media file.");
  }

  let localMedia = [],
    cloudMedia = [];
  const folderPath = `users/${id}/stories`;

  files.forEach((file) => {
    localMedia.push({
      type: file.mimetype,
      url: file.path,
    });
  });

  if (localMedia.length > 0) {
    cloudMedia = await bulkUploadOnImageKit(localMedia, folderPath);
  }

  console.log("cloud media: ", cloudMedia);

  if (cloudMedia.length > 0) {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const story = await prisma.story.create({
        data: {
          userId: id,
          ...(caption && { caption }),
          url: cloudMedia[0].url,
          type: cloudMedia[0].type,
          fileId: cloudMedia[0].fileId,
          expiresAt,
        },
        select: {
          id: true,
          caption: true,
          url: true,
          type: true,
          fileId: true,
          createdAt: true,
          expiresAt: true,
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              profilePicture: true,
            },
          },
        },
      });

      const io = getSocket();
      io.emit("story:created", story);

      return res
        .status(StatusCodes.CREATED)
        .json(
          new ApiResponse(
            StatusCodes.CREATED,
            "Story created successfully",
            story
          )
        );
    } catch (error) {
      if (cloudMedia.length > 0) {
        for (const media of cloudMedia) {
          await deleteFromImageKit(media.fileId);
        }
      }

      throw error;
    }
  }
});

export const deleteStory = asyncHandler(async (req, res) => {
  const { id: storyId } = req.params;
  const userId = req.user.id;

  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
      userId,
    },
    select: {
      id: true,
      fileId: true,
      userId: trues,
    },
  });

  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Story not found");
  }

  if (story.userId !== userId) {
    throw new ApiError(
      StatusCodes.FORBIDDEN,
      "You don't have permission to delete it"
    );
    s;
  }

  await prisma.story.delete({
    where: {
      id: storyId,
      userId,
    },
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Story has deleted successfully"));
});

export const getFollowingUsersStories = asyncHandler(async (req, res) => {

});

export const getSpecificStory = asyncHandler(async (req, res) => {
  const { id: storyId } = req.params;

  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
    select: {
      id: true,
      caption: true,
      url: true,
      type: true,
      fileId: true,
      createdAt: true,
      expiresAt: true,
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          profilePicture: true,
        },
      },
    },
  });

  if (!story) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Story not found");
  }

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "Story fetched successfully", story));
});