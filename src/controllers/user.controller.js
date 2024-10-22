import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

export const registerUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (![email, password].every(Boolean)) {
    return res
      .status(400)
      .json(new ApiError(400, "Email and Password is required"));
  }

  if (!email.includes("@")) {
    return res
      .status(401)
      .json(new ApiError(401, "Please enter a valid email address"));
  }

  const existedUser = await User.findOne({ email }).lean();
  if (existedUser) {
    return res.status(402).json(new ApiError(402, "User already exists!"));
  }
  const username = email.split("@")[0];
  const user = await User.create({
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  if (!createdUser) {
    return res
      .status(500)
      .json(
        res.status(500).json(new ApiError(500, "Error creating user account"))
      );
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const generateTokens = async (user) => {
  try {
    const accessToken = user.generateAccessToken(); // NOTE: here the user is the instance of the User model not the schema.
    const refreshToken = user.generateRefreshToken();

    // storing the refresh token in the database
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); // so that the required field from schema does not invoke here

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};
export const loginUser = asyncHandler(async (req, res) => {
  // req.body -> data
  // check if user exists
  // check if password is correct
  // generate access and refresh token & save refresh token in the database
  // send cookies

  const { username, email, password } = req.body;

  if (!email && !username) {
    return res
      .status(400)
      .json(new ApiError(400, "Username or email required."));
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    return res
      .status(401)
      .json(new ApiError(401, "User does not exist! Please register."));
  }
  if (!(await user.isCorrectPassword(password))) {
    return res.status(401).json(new ApiError(401, "Invalid credentials"));
  }

  const { accessToken, refreshToken } = await generateTokens(user);
  const loggedInUser = await User.findById(user._id) // we are making a request to the database to get the user details which will include refreshToken
    .select("-password -refreshToken")
    .lean();

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "User logged in successfully", {
        user: loggedInUser,
        accessToken,
        refreshToken,
      })
    );
});

export const logOutUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: { refreshToken: "" },
    },
    { new: true } // to return the updated vlaue of refreshToken not the old one
  );
  user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, "User logged out successfully", {}));
});

export const updateRefreshToken = asyncHandler(async (req, res) => {
  // get the refresh token from the cookies
  // verify the refresh token with the one stored in db
  // if the refresh token is valid then generate a new access token and refresh token
  // save the new refresh token in the db
  // send the new access token and refresh token in the cookies
  const incommingRefreshToken = req.cookies?.refreshToken;
  if (!incommingRefreshToken) {
    return res
      .status(401)
      .json(new ApiError(401, "Invalid Token, please login."));
  }
  const decodedToken = jwt.verify(
    incommingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  );
  const user = await User.findById(decodedToken.id);
  if (!user) {
    return res.status(401).json(new ApiError(401, "Invalid Token"));
  }

  if (user.refreshToken !== incommingRefreshToken) {
    return res
      .status(401)
      .json(new ApiError(401, "incorrect refresh token Invalid token!"));
  }
  const { accessToken, refreshToken } = await generateTokens(user);

  user.refreshToken = refreshToken;
  user.save({ validateBeforeSave: false });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, options)
    .cookie("accessToken", accessToken, options)
    .json(
      new ApiResponse(200, "Token refreshed successfully", {
        accessToken,
        refreshToken,
      })
    );
});

export const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  if (!(await user.isCorrectPassword(currentPassword))) {
    return res.status(401).json(new ApiError(401, "Invalid password"));
  }
  user.password = newPassword;
  user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(new ApiResponse(200, "Password updated successfully", {}));
});

export const getUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});
