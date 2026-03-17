import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat_media",
    resource_type:"auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp","mp4","mp3" , "mov","mkv","webm"],
  },
});
const upload = multer({ storage });
export default upload;
 