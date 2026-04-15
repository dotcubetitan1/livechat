import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/config";

const ChatHeader = ({ userId }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (userId) {
      fetchUserById(userId);
      fetchOnlineUsers();
    }
  }, [userId]);

  const fetchUserById = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/get-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSelectedUser(res.data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getOnlineUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log("online user", res)
      setOnlineUser(res.data.onlineUsers);
    } catch (error) {
      console.error("Error fetching online user :", error);
    }
  };

  if (!selectedUser) {
    return (
      <div className="px-4 py-3 bg-[#075E54] flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#ffffff] animate-pulse"></div>
        <div className="h-4 w-32 bg-white/20 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-[#075E54] flex items-center gap-3">
      <button onClick={() => navigate("/chat")} className="md:hidden text-white text-2xl mr-1 p-2 -m-2">
        <IoArrowBackCircleOutline />
      </button>
      <div
        onClick={() => navigate(`/media/${userId}`)}
        className="w-9 h-9 rounded-full bg-[#ffffff] text-[#272626] flex items-center justify-center font-medium text-lg overflow-hidden cursor-pointer"
      >
        {selectedUser?.profilePic
          ? <img src={selectedUser.profilePic} className="w-full h-full object-cover" />
          : selectedUser.fullName?.charAt(0)}
      </div>
      <div>
        <p className="text-white font-medium text-sm">{selectedUser.fullName}</p>
        <p className={`text-xs ${onlineUser.includes(userId) ? "text-green-300" : "text-white/50"}`}>
          {onlineUser.includes(userId) ? "🟢 Online" : "⚫ Offline"}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;