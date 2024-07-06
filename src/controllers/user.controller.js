import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const AccessToken = user.generateAccessToken();
    const RefreshToken = user.generateRefreshToken();

    user.refreshToken = RefreshToken;
    await user.save({ validateBeforeSave: false });

    return { AccessToken, RefreshToken };
  } catch (error) {
    throw new ApiError(500, "Error generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // console.log(req.body);

  // get user details from frontend
  const { username, fullName, email, password } = req.body;

  // validation
  const userNameRegex = new RegExp("^[a-zA-Z0-9_]+$");
  const passwordRegex = new RegExp(
    "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%^&*])(?=.{8,})"
  );

  if (!userNameRegex.test(username) || !passwordRegex.test(password)) {
    throw new ApiError(
      400,
      "Username: letters, numbers, underscore | Password: atleast 1 uppercase, lowercase, number, special character each, min 8 characters"
    );
  }

  // check if user already exists : username
  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(409, "User already exists");
  }

  // check for images (avatar)
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const temp = req.files?.coverImage;
  const coveImageLocalPath =
    Array.isArray(temp) && temp.length > 0 ? temp[0].path : null;

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
    fullName,
    email,
    password,
    username: username.toLowerCase(),
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // console.log(user);

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

const loginUser = asyncHandler(async (req, res) => {
  // get data from req body
  const { username, email, password } = req.body;

  if (!email && !username) {
    throw new ApiError(400, "Username or Email is required");
  }

  //find user by email or username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  //check if user exists
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  //check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  //generate access and refresh token
  const { AccessToken, RefreshToken } = await generateAccessandRefreshToken(
    user._id
  );

  //cookies and response
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .send(200)
    .cookie("accessToken", AccessToken, options)
    .cookie("refreshToken", RefreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          AccessToken,
          RefreshToken,
        },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { refreshToken: "" },
    { new: true, validateBeforeSave: false }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

export { registerUser, loginUser, logoutUser };
