
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "email already exists" });
    const newUser = await User.create({
      fullName,
      email,
      password,
    });
    res.status(201).json({
      message: "new user create success",
      data: { user: newUser },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.password !== password)
      return res.status(400).json({ message: "password is increate" });
    const token = jwt.sign(
      { userId: user._id, fullName: user.fullName, email: email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );
    res.status(200).json({
      message: "user login success",
      data: { token, user },
    });
  } catch (error) {
    console.log("login error", error);
    res.status(500).json({ message: error.message });
  }
};
export const socialLogin = async (req, res) => {
  try {
    const { email, fullName, profilePic, socialLoginId } = req.body;
    console.log(req.body)
    const existUser = await User.findOne({ email }).lean();
    const isAlreadyExist = !!existUser
    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: { fullName, profilePic, socialLoginId },
        $setOnInsert: { email }
      },
      {
        new: true,
        upsert: true,
        lean: true
      }
    )
    const token = jwt.sign(
      { userId: user._id, email: user.email, fullName: user.fullName },
      process.env.JWT_SECRET, { expiresIn: "365d" }
    )
    res.status(200).json({
      message: "login successFully",
      data: { token, user, isAlreadyExist }
    })
  } catch (error) {
    console.error("Social login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    console.log(user);

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    if (req.file) {
      updateData.profilePic = req.file.path;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
export const updateFCMToken = async (req, res) => {
  try {
    const userId = req.user._id;
    const { fcmToken } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );
    res.status(200).json({
      message: "FCM token updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("FCM update error:", error);
    res.status(500).json({ message: "failed to update fcm token" });
  }
};
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, {
      fcmToken: null,
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" })
  }
}