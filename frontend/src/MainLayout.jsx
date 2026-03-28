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

  const isChatPage = location.pathname.includes("/chat/");
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
        w-full md:w-1/4 lg:w-1/5 flex-shrink-0
        ${(isChatPage || isSubPage) ? "hidden md:block" : "block"}
      `}>

        {/* Dashboard Button */}
        <div
          onClick={() => navigate("/dashboard")}
          className="px-4 py-3 rounded-2xl font-semibold bg-green-600 flex items-center justify-between cursor-pointer mb-2"
        >
          <h2 className="text-white font-bold">Dashboard</h2>
          <MdDashboard className="text-white" />
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
              className="p-3 flex gap-3 cursor-pointer hover:bg-gray-200 rounded-lg"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center overflow-hidden">
                  {
                    c.profilePic ? (<img src={c.profilePic} alt="profile" className="w-full h-full object-cover" />) : (
                    <span className="font-semibold">
                      {c.fullName?.charAt(0)}
                    </span>)
                  }


                </div>
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                )}
              </div>
              <div>
                <p className="font-medium">{c.fullName}</p>
                <p className="text-xs text-gray-500">
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