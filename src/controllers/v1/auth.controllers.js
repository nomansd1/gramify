import { hash, compare } from "bcrypt";
import { StatusCodes } from "http-status-codes";
import prisma from "../../db/index.js";
import { ApiError, ApiResponse, asyncHandler } from "../../utils/index.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/tokenService.js";
import { options } from "../../utils/constants.js";

const generateTokens = async (userId) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    if (!accessToken || !refreshToken) {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Unexpected error occurs while generating tokens"
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshToken },
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error while generating tokens",
      error
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, name } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
      username: username,
    },
  });

  if (existingUser) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "User already exists with this email or username"
    );
  }

  const hashedPassword = await hash(password, 10);

  const createdUser = await prisma.user.create({
    data: {
      username: username,
      email: email,
      password: hashedPassword,
      name: name,
    },
  });

  if (!createdUser) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Something went wrong while registering the user"
    );
  }

  res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, "User registered successfully", {
      user: {
        id: createdUser.id,
        username: createdUser.username,
        email: createdUser.email,
        name: createdUser.name,
      },
    })
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
      username: username,
    },
  });

  if (!user) {
    throw new ApiError(
      StatusCodes.UNAUTHORIZED,
      "Invalid email/username or password"
    );
  }

  const isPasswordValid = await compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);

  res
    .status(StatusCodes.OK)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(StatusCodes.OK, "User logged in successfully", {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
        },
        tokens: {
          accessToken,
          refreshToken,
        },
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  
  const userId = req.user.id;
  
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  
  res
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
