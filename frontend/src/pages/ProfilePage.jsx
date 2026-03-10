import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { useState, useEffect } from "react";

const ProfilePage = () => {
  // const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    profilePic: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [updating, setUpdating] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("token"));

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // setProfileData(res.data);
      setFormData({
        fullName: res.data.fullName,
        email: res.data.email,
        profilePic: null,
      });
      setPreviewImage(res.data.profilePic);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //update profile
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
      const res = await axios.put(
        `${API_BASE_URL}/updateProfile`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("Update Response:", res.data);
      setFormData(res.data.user);
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (formData.profilePic) {
        setFormData((prev) => ({ ...prev, profilePic: null }));
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };
  useEffect(() => {
    fetchProfile();
  }, []);
  return (
    <>
      <div>
        <div className=" bg-gray-100 px-4 py-4 border-b-2 border-gray-200">
          <h1 className="font-semibold text-2xl text-gray-700">Profile Page</h1>
        </div>
        <div className="flex justify-center items-center">
          <div className="w-125 mt-7  ">
            <div className="border-2 border-gray-200  rounded-2xl p-10">
              <div className="text-center">
                <input
                  type="file"
                  className="bg-amber-200 h-40 w-40 rounded-full"
                />
              </div>
              <form
                action=""
                onSubmit={handleUpdateProfile}
                className="space-y-4"
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                    className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="email"
                    className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                {/* Button */}
                <button
                  type="submit"
                  onClick={fetchProfile}
                  className="px-4 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition"
                >
                  Refresh
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
