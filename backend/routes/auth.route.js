import express from "express"
import { signup, login ,getProfile ,updateProfile ,updateFCMToken , logoutUser} from "../controllers/auth.controller.js";
import verifyToken from "../middleware/verifyToken.middleware.js";
import upload from "../middleware/upload.middleware.js";
 
const router = express.Router();

router.post("/signup" ,signup)
router.post("/login" ,login)
router.get("/getProfile" , verifyToken ,getProfile)
router.put("/updateProfile" , verifyToken ,upload.single("profilePic") , updateProfile)
router.post("/update-fcm-token" , verifyToken, updateFCMToken)
router.post("/logout", verifyToken, logoutUser)

export default router;