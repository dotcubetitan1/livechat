import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto"

const public_id = (req, file) => {
  const hash = crypto.createHash("md5").update(file.originalname).digest("hex")
  return hash
}
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "chat_media",
    public_id: public_id,
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mp3", "mov", "mkv", "webm"],
  },
});
const upload = multer({ storage });
export default upload;
