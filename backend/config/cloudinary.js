
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "rommify",

    // ✅ FIX: correct key name
    allowed_formats: ["jpg", "png", "jpeg"],

    // ✅ ensure proper image type
    resource_type: "image",

    // ✅ optional but recommended
    transformation: [{ width: 800, height: 600, crop: "limit",quality: "auto" }],

    // ✅ VERY IMPORTANT
  public_id: (req, file) => {
    return Date.now() + "-" + file.originalname;
  }



  },
});

module.exports = { storage, cloudinary };