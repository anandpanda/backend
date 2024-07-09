import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload file
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    //file uploaded
    // console.log("File uploaded successfully", response);

    fs.unlinkSync(localFilePath); //remove file from local storage
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove file from local storage
    return null;
  }
};

const deleteFromCloudinary = async (publicUrl) => {
  try {
    const splitUrl = publicUrl.split("/");
    const publicIdcumExt = splitUrl[splitUrl.length - 1].split(".");
    const publicId = publicIdcumExt[0];

    //delete file
    const response = await cloudinary.uploader.destroy(publicId);
    return response;
  } catch (error) {
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
