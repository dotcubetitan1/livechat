import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { API_BASE_URL } from "../api/config.js";
import { useNavigate } from "react-router";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", email: "", password: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/signup`, formData);
      navigate("/login");
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

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
      </div>
    </div>
  );
};
export default SignUpPage;
