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
      <div className="flex justify-between bg-gray-100 px-4 py-4 border-b border-gray-200">
        <h1 className="font-bold">My Dashboard</h1>
        <div onClick={()=>navigate("/profile")} className="">profile</div>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4 flex justify-end gap-4 border-b border-gray-300">
        <button
          onClick={() => setActiveTab("videos")}
          className="hover:bg-green-600 hover:text-white border px-3 py-2 rounded-full border-gray-300"
        >
          Videos
        </button>
        <button
          onClick={() => setActiveTab("images")}
          className="hover:bg-green-600 hover:text-white border px-3 py-2 rounded-full border-gray-300"
        >
          Images
        </button>

        <button
          className="hover:bg-green-600 hover:text-white border px-3 py-2 rounded-full border-gray-300"
        >
          Document
        </button>
      </div>

      {/* Media Grid */}
      <div className="flex-1 px-4 py-4 overflow-auto">
        {activeTab === "videos" && (
          <div className="grid grid-cols-4 gap-3">
            {allMedia.allVideo.map((video, i) => (
              <video
                key={i}
                src={video}
                controls
                className="w-full h-40 rounded-lg"
              />
            ))}
          </div>
        )}

        {activeTab === "images" && (
          <div className="grid grid-cols-4 gap-3">
            {allMedia.allImage.map((img, i) => (
              <img key={i} src={img} className="w-full h-40 rounded-lg" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;