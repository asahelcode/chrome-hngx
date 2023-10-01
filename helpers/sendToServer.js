import cloudinary from "../config/cloudinary";

const upload = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file, {
      folder: "videos",
    });
    return result;
  } catch (error) {
    console.log(error);
  }
};

export default upload;
