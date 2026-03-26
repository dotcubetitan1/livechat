import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    fullName: "", email: "", profilePic: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [updating, setUpdating] = useState(false);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ fullName: res.data.fullName, email: res.data.email, profilePic: null });
      setPreviewImage(res.data.profilePic);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("email", formData.email);
      if (formData.profilePic) {
        formDataToSend.append("profilePic", formData.profilePic);
      }
      const res = await axios.put(`${API_BASE_URL}/updateProfile`, formDataToSend, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFormData((prev) => ({ ...prev, profilePic: null }));
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  return (
    <div className="flex flex-col h-full">

      {/* ✅ Header with back button */}
      <div className="flex items-center bg-gray-100 px-4 py-4 border-b-2 border-gray-200">
        <button
          onClick={() => navigate("/dashboard")}
          className="md:hidden text-2xl mr-3"
        >
          ←
        </button>
        <h1 className="font-semibold text-xl text-gray-700">Profile</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto flex justify-center items-start py-8 px-4">
        <div className="w-full max-w-md">
          <div className="border-2 border-gray-200 rounded-2xl p-6 md:p-10">

            {/* Profile Image */}
            <label className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-green-500 flex justify-center items-center cursor-pointer overflow-hidden block mb-6">
              {previewImage ? (
                <img src={previewImage} className="w-full h-full object-cover rounded-full" />
              ) : (
                <span className="text-white text-5xl font-semibold">
                  {formData.fullName?.charAt(0)?.toUpperCase()}
                </span>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setFormData((prev) => ({ ...prev, profilePic: file }));
                  setPreviewImage(URL.createObjectURL(file));
                }}
              />
            </label>

            {/* Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text" name="fullName" value={formData.fullName}
                  onChange={handleInputChange} placeholder="Enter your name"
                  className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleInputChange} placeholder="Enter email"
                  className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="text-center pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;