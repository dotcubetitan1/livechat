import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config.js";
import { getFCMToken } from "../notification/firebase.js"

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await axios.post(`${API_BASE_URL}/login`, formData);
      const token = res.data.data.token;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));
      const fcmToken = await getFCMToken();
      if (fcmToken) {
        await axios.post(`${API_BASE_URL}/update-fcm-token`, { fcmToken }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      navigate("/chat");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Top green header */}
      <div className="w-full bg-[#075E54] py-10 flex flex-col items-center justify-center mb-0">
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="white">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
          </svg>
        </div>
        <h1 className="text-white text-2xl font-medium">WhatsApp</h1>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm bg-white px-6 py-8 shadow-md">
        <h2 className="text-xl font-medium text-gray-800 mb-1">Welcome back</h2>
        <p className="text-sm text-gray-500 mb-6">Sign in to continue</p>

        <div className="flex flex-col gap-4">
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

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleLogin} disabled={loading}
            className="bg-[#075E54] text-white rounded-full py-3 text-sm font-medium mt-2 disabled:opacity-70 flex items-center justify-center"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              : "Login"}
          </button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-[#00BFA5] font-medium">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
