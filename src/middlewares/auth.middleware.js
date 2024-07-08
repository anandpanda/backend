import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // for both browser and mobile and app clients
    const token =
      req.cookies?.accessToken ||
      req.headers("authorization")?.replace("Bearer ", "") ||
      "";

    if (!token) {
      throw new ApiError(401, "Unauthorized");
    }

    const verified = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(verified._id);

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token");
  }
});
