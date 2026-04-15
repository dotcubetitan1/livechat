import { useEffect, useState } from "react";
import axios from "axios";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/config";

const ChatHeader = ({ groupId}) => {
  const [selectedGroup, setselectedGroup] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (groupId) {
      fetchGroupById(groupId);
      fetchOnlineUsers();
    }
  }, [groupId]);

  const fetchGroupById = async (groupId) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups/get-group/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res)
      setselectedGroup(res.data.data);
    } catch (error) {
      console.error("Error fetching groups details:", error);
    }
  };

  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getOnlineUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res);
      setOnlineUser(res.data.onlineUsers);
    } catch (error) {
      console.error("Error fetching online user :", error);
    }
  };

  if (!selectedGroup) {
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
        onClick={() => navigate(`/media/${groupId}`)}
        className="w-9 h-9 rounded-full bg-[#ffffff] text-[#272626] flex items-center justify-center font-medium text-lg overflow-hidden cursor-pointer"
      >
        {selectedGroup?.groupIcon
          ? <img src={selectedGroup.groupIcon} className="w-full h-full object-cover" />
          : selectedGroup.groupName?.charAt(0)}
      </div>
      <div>
        <p className="text-white font-medium text-sm">{selectedGroup.groupName}</p>
        {/* <p className={`text-xs ${onlineUser.includes(userId) ? "text-green-300" : "text-white/50"}`}>
          {onlineUser.includes(userId) ? "🟢 Online" : "⚫ Offline"}
        </p> */}
      </div>
    </div>
  );
};

export default ChatHeader;