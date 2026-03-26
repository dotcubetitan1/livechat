import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../api/config";
import { useNavigate } from "react-router-dom";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("images");
  const [allMedia, setAllMedia] = useState({ allVideo: [], allImage: [] });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllMedia = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/getAllMedia`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllMedia(res.data);
      } catch (err) {
        console.error("Error fetching media:", err);
      }
    };
    fetchAllMedia();
  }, [token]);

  return (
    <div className="flex flex-col bg-white h-full">

      {/* Header */}
      <div className="flex items-center justify-between bg-gray-100 px-4 py-4 border-b border-gray-200">
        {/* ✅ Mobile back button */}
        <button
          onClick={() => navigate("/chat")}
          className="md:hidden text-2xl mr-2"
        >
          ←
        </button>
        <h1 className="font-bold flex-1">My Dashboard</h1>
        <div
          onClick={() => navigate("/profile")}
          className="cursor-pointer text-green-600 font-medium"
        >
          Profile
        </div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-3 flex gap-3 border-b border-gray-300 overflow-x-auto">
        {["images", "videos", "documents"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full border text-sm capitalize whitespace-nowrap transition
              ${activeTab === tab
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-300 hover:bg-green-600 hover:text-white"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Media Grid */}
      <div className="flex-1 px-4 py-4 overflow-auto">
        {activeTab === "videos" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allMedia.allVideo.map((video, i) => (
              <video key={i} src={video} controls
                className="w-full h-32 sm:h-40 rounded-lg object-cover"
              />
            ))}
          </div>
        )}
        {activeTab === "images" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {allMedia.allImage.map((img, i) => (
              <img key={i} src={img}
                className="w-full h-32 sm:h-40 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
        {activeTab === "documents" && (
          <div className="flex items-center justify-center h-40 text-gray-400">
            No documents found
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;