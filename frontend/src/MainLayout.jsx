import { Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaPlusCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { API_BASE_URL } from "./api/config";

const MainLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [onlineUser, setOnlineUser] = useState([]);
  const socketRef = useRef();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

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

    socketRef.current.on("connect", () => {
      console.log("Connected:", socketRef.current.id);
    });

    socketRef.current.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [token]);

  const handleUserSelect = (contact) => {
    setSelectedUser(contact);
    navigate(`/chat/${contact._id}`);
  };

  return (
    <div className="w-screen h-screen bg-gray-100 flex">
      {/* LEFT SIDEBAR — FIXED */}
      <div className="w-1/5 overflow-auto bg-gray-100 p-3">
        <div
          onClick={() => navigate("/dashboard")}
          className="px-4 py-3 rounded-2xl font-semibold bg-green-600 flex items-center justify-between cursor-pointer"
        >
          <h2 className="text-white font-bold">My Dashboard</h2>
          <p>
            <MdDashboard className="text-white" />
          </p>
        </div>

        <div className="px-4 py-3 font-semibold flex items-center justify-between">
          <h2>My Channels</h2>
          <p>
            <FaPlusCircle className="hover:text-green-600 text-gray-500" />
          </p>
        </div>

        {contacts.map((c) => {
          const isOnline = onlineUser.includes(c._id);

          return (
            <div
              key={c._id}
              onClick={() => handleUserSelect(c)}
              className="p-4 flex gap-3 cursor-pointer hover:bg-gray-100"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                  {c.fullName?.charAt(0)}
                </div>

                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
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

      {/* RIGHT SIDE — CHANGEABLE */}
      <div className="w-4/5 flex flex-col">
        <Outlet context={{ selectedUser, socketRef }} />
      </div>
    </div>
  );
};

export default MainLayout;