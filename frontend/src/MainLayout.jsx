import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaPlusCircle } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { API_BASE_URL } from "./api/config";
import InfiniteScroll from "react-infinite-scroll-component"
import { ClipLoader } from "react-spinners";
import { CgProfile } from "react-icons/cg";

const MainLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const socketRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const isChatPage = location.pathname.match(/^\/chat\/.+/);
  const isProfilePage = location.pathname.includes("/profile"); 
 const hideSidebarOnMobile = isChatPage || isProfilePage
  useEffect(() => {
    if (!token) return;

    socketRef.current = io(API_BASE_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected in MainLayout");
      setSocketConnected(true);
    });

    socketRef.current.on("getOnlineUsers", (users) => {
      setOnlineUser(users);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [token]);

  const fetchContacts = async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/getAllContacts?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newData = res.data.data;
      const currentTotalPages = res.data.totalPage;
      setTotalPage(currentTotalPages);

      if (pageNum === 1) {
        setContacts(newData);
      } else {
        setContacts((prev) => [...prev, ...newData]);
      }

      if (pageNum >= currentTotalPages) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      setPage(1);
      setHasMore(true);
      fetchContacts(1);
    }
  }, [token]);

  useEffect(() => {
    if (page > 1) {
      setTimeout(() => {
        fetchContacts(page);
      }, 1000)
    }
  }, [page]);
  const fetchNextPage = () => {
    if (!loading && hasMore && page < totalPage) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="w-screen h-screen flex relative overflow-hidden">

      {/* ─── Sidebar ─────────────────────────────────── */}
      <div className={`
        bg-gray-100 p-3 transition-all duration-300
        w-full md:w-1/4 lg:w-1/5 shrink-0
        ${hideSidebarOnMobile ? " hidden md:block" : "block"}
      `}>
        {/* Dashboard Button */}
        {/* <div
          onClick={() => navigate("/dashboard")}
          className="flex items-center justify-between px-4 py-3 bg-[#075E54] rounded-xl cursor-pointer mb-3"
        >
          <h2 className="text-white font-medium text-sm">Dashboard</h2>
          <MdDashboard className="text-white text-lg" />
        </div> */}

        <div className="bg-[#075E54] px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">WhatsApp</h1>
          <div
            onClick={() => {
              navigate("/profile")
            }}
            className="text-white/80 cursor-pointer text-2xl " >
            <CgProfile />

          </div>
        </div>

        {/* Contacts - Fixed scroll container */}
        <div
          id="scrollableDiv"
          style={{
            height: 'calc(100vh - 160px)',
            overflow: 'auto',
          }}
        >
          <InfiniteScroll
            dataLength={contacts.length}
            next={fetchNextPage}
            hasMore={hasMore}
            scrollableTarget="scrollableDiv"
            loader={
              <div className="w-full flex justify-center items-center py-4">
                <ClipLoader size={50} color="#075E54" />
              </div>
            }
            endMessage={
              <p className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">
                No more contacts
              </p>
            }

          >
            <div className="px-4 py-3 font-semibold flex justify-between sticky top-0 bg-gray-100 z-10">
              <h2>Chats</h2>
              <FaPlusCircle className="text-gray-500 cursor-pointer" />
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
          </InfiniteScroll>
        </div>
      </div>

      {/* ─── Right Section ────────────────────────────── */}
      <div className={`
        flex flex-col flex-1 bg-white overflow-hidden
        ${hideSidebarOnMobile ? "flex" : "hidden md:flex"}
      `}>
        <Outlet context={{ socketRef, socketConnected }} />
      </div>

    </div>
  );
};

export default MainLayout;