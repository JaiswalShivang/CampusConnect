const cloudinary = require('cloudinary').v2

exports.uploadImagetoCloudinary = async (file, folder, height, quality) => {
  try {
    const options = { folder };

    if (height) {
      options.height = height;
    }

    if (quality) {
      options.quality = quality;
    }

    options.resource_type = "auto";

    const result = await cloudinary.uploader.upload(file.tempFilePath, options);
    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error; 
  }
};