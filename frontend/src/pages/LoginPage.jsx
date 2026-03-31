import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api/config.js";
import { getFCMToken } from "../notification/firebase.js"

const LoginPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/login`, {
        email: formData.email,
        password: formData.password,
      });
      console.log("login response", res.data);
      localStorage.setItem("token", res.data.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      const token = res.data.data.token;

      const fcmToken = await getFCMToken()
      console.log("login fcm token",fcmToken);
      if (fcmToken) {
        await axios.post(`${API_BASE_URL}/update-fcm-token`, { fcmToken },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )
      } else if (err) {
        console.log("fcm error", err);

      }

      navigate("/chat");

    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center ">
        <div className=" bg-gray-200 backdrop-blur-ls rounded-2xl md:p-12 p-6 shadow-2xl">
          {/* Card Container */}
          <div className="flex flex-col space-y-4 text-black ">
            <h2 className="text-center font-bold text-gray-600 md:text-2xl text-[24px]">Login</h2>

            <div>
              <h1>Email</h1>
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                className="outline-none border rounded-full px-4 mt-2 py-1"
                onChange={handleChange}
              />
            </div>

            <div>
              <h1>Password</h1>
              <input
                name="password"
                type="password"
                placeholder="Enter your password"
                className="outline-none border rounded-full px-4 mt-2 py-1"
                onChange={handleChange}
              />
            </div>

            <div className="text-center">
              <button
                onClick={handleLogin}
                className="bg-blue-400 px-6 py-1 rounded-full text-white"
              >
                Login
              </button>
            </div>

            <div className="mt-2 text-center">
              <p>
                Don’t have an account?
                <Link
                  to="/signup"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors ml-1"
                >
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
