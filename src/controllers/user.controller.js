import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  const { username, fullName, email, password } = req.body;

  // validation
  const userNameRegex = new RegExp("^[a-zA-Z0-9_]+$");
  const passwordRegex = new RegExp(
    "^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{8,}$"
  );

  if (
    userNameRegex.test(username) === false ||
    passwordRegex.test(password) === false
  ) {
    throw new ApiError(400, "Invalid username or password format");
  }

  // check if user already exists : username
  const userExists = User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(409, "User already exists");
  }

  // check for images (avatar)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coveImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload image to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coveImageLocalPath);

  if (!avatar) {
    throw new ApiError(500, "Error uploading avatar");
  }

  // create user object - create entry in db
  const user = await User.create({
    username: username.toLowerCase(),
    fullName,
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // remove pass and refresh token from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Error creating user");
  }

  //return res
  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { registerUser };
