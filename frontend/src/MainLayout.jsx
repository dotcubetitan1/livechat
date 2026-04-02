import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaPlusCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { API_BASE_URL } from "./api/config";

const MainLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [onlineUser, setOnlineUser] = useState([]);
  const socketRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const isChatPage = location.pathname.match(/^\/chat\/.+/);;
  const isSubPage = location.pathname.includes("/profile") ||
    location.pathname.includes("/dashboard");

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/getAllContacts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(res.data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    fetchContacts();
  }, [token]);

  useEffect(() => {
    socketRef.current = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });
    socketRef.current.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });
    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  return (
    <div className="w-screen h-screen flex relative overflow-hidden">

      {/* ─── Sidebar ─────────────────────────────────── */}
      <div className={`
        bg-gray-100 p-3 transition-all duration-300
        w-full md:w-1/4 lg:w-1/5 shrink-0
        ${(isChatPage || isSubPage) ? "hidden md:block" : "block"}
      `}>

        {/* Dashboard Button */}
        <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-between px-4 py-3 bg-[#075E54] rounded-xl cursor-pointer mb-3"
        >
          <h2 className="text-white font-medium text-sm">Dashboard</h2>
          <MdDashboard className="text-white text-lg" />
        </div>
        <div className="bg-[#075E54] px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">WhatsApp</h1>
        </div>

        {/* Contacts */}
        <div className="px-4 py-3 font-semibold flex justify-between">
          <h2>Chats</h2>
          <FaPlusCircle className="text-gray-500" />
        </div>

        {contacts.map((c) => {
          const isOnline = onlineUser.includes(c._id);
          return (
            <div
              key={c._id}
              onClick={() => navigate(`/chat/${c._id}`)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-100"
            >
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-medium text-lg overflow-hidden">
                  {c.profilePic
                    ? <img src={c.profilePic} className="w-full h-full object-cover" />
                    : c.fullName?.charAt(0)}
                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white"></span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-900 text-sm">{c.fullName}</p>
                  <p className="text-xs text-gray-400">{isOnline ? "now" : ""}</p>
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Right Section ────────────────────────────── */}
      <div className={`
  flex flex-col flex-1 bg-white overflow-hidden
  ${(isChatPage || isSubPage) ? "flex" : "hidden md:flex"}
`}>
        <Outlet context={{ socketRef }} />
      </div>

    </div>
  );
};

export default MainLayout;