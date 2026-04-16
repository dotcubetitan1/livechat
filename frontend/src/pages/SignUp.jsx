import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { API_BASE_URL } from "../api/config.js";
import { useNavigate } from "react-router";
import { signInWithGoogle } from "../config/firebase.js"
import toast from "react-hot-toast";
import { getFCMToken } from "../config/firebase.js"

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/signup`, formData);
      toast.success(res.data.message)
      navigate("/login");
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Signup failed. Please try again")
    }
  };
  const handleGoogleLogin = async () => {
    try {
      const googleUser = await signInWithGoogle();
      // console.log(googleUser)
      const res = await axios.post(`${API_BASE_URL}/socialLogin`, {
        email: googleUser.email,
        fullName: googleUser.displayName,
        googleId: googleUser.uid,
        profilePic: googleUser.photoURL
      })
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      const token = res.data.data.token;
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        await axios.post(`${API_BASE_URL}/update-fcm-token`, { fcmToken }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      toast.success("Login successful");
      navigate("/chat");
    } catch (error) {
      console.error("Google login error:", error);
      toast.error(error.response?.data?.message || "Google login failed. Please try again")
    }
  }
  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="w-full bg-[#075E54] py-8 flex flex-col items-center justify-center">
        <h1 className="text-white text-xl font-medium">Create Account</h1>
        <p className="text-white/70 text-sm mt-1">Join WhatsApp today</p>
      </div>

      <div className="w-full max-w-sm bg-white px-6 py-8 shadow-md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
            <input
              name="fullName" type="text" placeholder="John Doe"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5] transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
            <input
              name="email" type="email" placeholder="your@email.com"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5] transition"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Password</label>
            <input
              name="password" type="password" placeholder="••••••••"
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5] transition"
            />
          </div>

          <button
            onClick={handleSignup} disabled={loading}
            className="bg-[#075E54] text-white rounded-full py-3 text-sm font-medium mt-2 disabled:opacity-70 flex items-center justify-center"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              : "Create Account"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-[#00BFA5] font-medium">Sign in</Link>
        </p>

        <button
          onClick={handleGoogleLogin}
          className=" w-full flex gap-2 justify-center items-center py-2.5 mt-3 border border-gray-300 rounded-full hover:bg-gray-50 transition "
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" />
          <span className="text-sm text-gray-700 font-medium">Continue with Google</span>
        </button>
      </div>
    </div>
  );
};
export default SignUpPage;
