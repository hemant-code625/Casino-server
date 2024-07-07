import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import User from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

// asyncHandler is used to catch any unhandled errors thrown by your asynchronous route handlers and pass them to Express's error handling middleware, while `try-catch` blocks inside your route handlers are used to handle specific errors and send custom responses.
export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.headers["authorization"]?.replace("Bearer ", ""); // get the token from the cookies or the Authorization header
    if (!token) {
      return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?.id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return res.status(401).json(new ApiError(401, "Invalid access token"));
    }

    //   now we have a valid user
    req.user = user;
    next();
  } catch (error) {
    return res
      .status(401)
      .json(
        new ApiError(
          401,
          "Invalid access token. Please login to get a new token ",
          error?.message
        )
      );
  }
});
