import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircleOutline } from "react-icons/io5";

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    fullName: "", email: "", profilePic: null,
  });
  const [previewImage, setPreviewImage] = useState("");
  const [updating, setUpdating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false)

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/getProfile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ fullName: res.data.fullName, email: res.data.email, profilePic: null });
      setPreviewImage(res.data.profilePic);
    } catch (error) {
      console.log(error.response?.data || error.message);
    } finally {
      setLoading(false)
    }
  };
  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      await axios.post(`${API_BASE_URL}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.clear();
      window.location.href = "/login"
    } catch (error) {
      console.log(error.message);
      setLogoutLoading(false)
    }
  }
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


  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <div className="w-15 h-15 border-4 border-[#075E54] rounded-full border-t-transparent animate-spin mx-auto "></div>
    </div>
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      <div className="bg-[#075E54] px-4 py-4 flex items-center gap-3">
        <button onClick={() => navigate("/chat")} className=" text-white text-[28px]">
          <IoArrowBackCircleOutline />
        </button>
      </div>

      {/* Green profile header */}
      <div className="bg-[#075E54] pb-8 pt-4 flex flex-col items-center">
        <label className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center cursor-pointer overflow-hidden mb-3">
          {previewImage
            ? <img src={previewImage} className="w-full h-full object-cover rounded-full" />
            : <span className="text-white text-3xl font-medium">{formData.fullName?.charAt(0)?.toUpperCase()}</span>}
          <input type="file" accept="image/*" className="hidden"
            onChange={e => { const f = e.target.files[0]; setFormData(p => ({ ...p, profilePic: f })); setPreviewImage(URL.createObjectURL(f)); }} />
        </label>
        <p className="text-white font-medium">{formData.fullName}</p>
        <p className="text-white/70 text-sm">{formData.email}</p>
      </div>

      <div className="flex-1 overflow-auto px-4 py-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <p className="text-xs text-[#00BFA5] font-medium uppercase tracking-wide mb-3">Account Info</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Full Name</label>
              <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-[#00BFA5]" />
            </div>
          </div>
        </div>

        <button onClick={handleUpdateProfile} disabled={updating}
          className="bg-[#075E54] text-white rounded-full py-3 text-sm font-medium disabled:opacity-60">
          {updating ? "Updating..." : "Update Profile"}
        </button>

        <button onClick={handleLogout}
          disabled={logoutLoading}
          className="bg-red-500 text-white rounded-full py-3 text-sm font-medium">
          {logoutLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </>
          ) : (
            "Logout"
          )}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;