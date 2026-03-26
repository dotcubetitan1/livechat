import { useState } from "react";
import { Link } from "react-router";
import axios from "axios";
import { API_BASE_URL } from "../api/config.js";
import { useNavigate } from "react-router";

const SignUpPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/signup`, formData);
      setFormData({
        fullName: "",
        email: "",
        password: "",
      });
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <>
      <div className="w-screen h-screen flex items-center justify-center ">
        <div className=" bg-gray-200 backdrop-blur-ls rounded-2xl md:p-12 p-6 shadow-2xl">
          {/* Card Container */}
          <div className="flex flex-col md:space-y-4 space-y-6 text-black ">
            <h2 className="text-center font-bold text-gray-600 md:text-2xl text-[24px]">Create Account</h2>
            <div>
              <h1>Full Name</h1>
              <input
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                className="outline-none border rounded-full px-4 mt-2 py-1"
                onChange={handleChange}
              />
            </div>
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
                type="text"
                placeholder="Enter your password"
                className="outline-none border rounded-full px-4 mt-2 py-1"
                onChange={handleChange}
              />
            </div>

            <div className=" text-center ">
              <button
                onClick={handleSignup}
                className="bg-blue-400 px-6 py-1 rounded-full text-white"
              >
                Sign Up
              </button>
            </div>

            <div className="mt-2 text-center">
              <p className="">
                Already have an account?
                <Link
                  to="/login"
                  className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default SignUpPage;
