import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { FaPlus } from "react-icons/fa";
import { API_BASE_URL } from "./api/config";
import InfiniteScroll from "react-infinite-scroll-component"
import { ClipLoader } from "react-spinners";
import { CgProfile } from "react-icons/cg";
import CreateGroupModal from "./components/group/CreateGroupModal"

const MainLayout = () => {
  const [contacts, setContacts] = useState([]);
  const [onlineUser, setOnlineUser] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [groups, setGroups] = useState([]);
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab")
  }); //chats, "groups"
  const [showCreateGroup, setShowCreateGroup] = useState(false);

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

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups/my-groups`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      // console.log(res.data.data)
      setGroups(res.data.data)
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  }
  useEffect(() => {
    fetchGroups()
  }, [token])
  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])


  return (
    <div className="w-screen h-screen flex relative overflow-hidden">
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        refreshGroups={fetchGroups}
      />
      {/* ─── Sidebar ─────────────────────────────────── */}
      <div className={`
        bg-gray-100 p-3 transition-all duration-300
        w-full md:w-1/4 lg:w-1/5 shrink-0
        ${hideSidebarOnMobile ? " hidden md:block" : "block"}
      `}>
        <div className="bg-[#075E54] px-4 py-4 flex items-center justify-between">
          <h1 className="text-white text-lg font-semibold">WhatsApp</h1>
          <div className="flex items-center gap-3">
            {/* + icon — group banane ke liye */}

            <div
              onClick={() => setShowCreateGroup(true)}
              className="text-white/80 cursor-pointer text-xl p-1">
              <FaPlus />
            </div>
            <div
              onClick={() => navigate("/profile")}
              className="text-white/80 cursor-pointer text-2xl">
              <CgProfile />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-100">
          <button
            onClick={() => setActiveTab("chats")}
            className={`flex-1 py-2 text-sm font-medium transition
      ${activeTab === "chats" ? "text-[#075E54] border-b-2 border-[#075E54]" : "text-gray-500"}`}>
            Chats
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-2 text-sm font-medium transition
      ${activeTab === "groups" ? "text-[#075E54] border-b-2 border-[#075E54]" : "text-gray-500"}`}>
            Groups
          </button>
        </div>

        {/* Contacts ya Groups list */}
        <div id="scrollableDiv" style={{ height: 'calc(100vh - 160px)', overflow: 'auto' }}>
          {activeTab === "chats" ? (
            <InfiniteScroll
              dataLength={contacts.length}
              next={fetchNextPage}
              hasMore={hasMore}
              scrollableTarget="scrollableDiv"
              loader={<div className="w-full flex justify-center items-center py-4"><ClipLoader size={50} color="#075E54" /></div>}
              endMessage={<p className="text-center py-6 text-gray-400 text-xs font-bold uppercase tracking-widest">No more contacts</p>}
            >
              {contacts.map((c) => {
                const isOnline = onlineUser.includes(c._id);
                return (
                  <div key={c._id} onClick={() => navigate(`/chat/${c._id}`)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-100">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-medium text-lg overflow-hidden">
                        {c.profilePic ? <img src={c.profilePic} className="w-full h-full object-cover" /> : c.fullName?.charAt(0)}
                      </div>
                      {isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] rounded-full border-2 border-white"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <p className="font-medium text-gray-900 text-sm">{c.fullName}</p>
                        <p className="text-xs text-gray-400">{isOnline ? "now" : ""}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{isOnline ? "Online" : "Offline"}</p>
                    </div>
                  </div>
                );
              })}
            </InfiniteScroll>
          ) : (
            // Groups tab
            <div>
              {groups.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  <p>No Group Found</p>
                  <p className="text-xs mt-1">+ create group</p>
                </div>
              ) : (
                groups.map((g) => (
                  <div key={g._id} onClick={() => navigate(`/group/${g._id}`)}
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-200 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-full bg-[#075E54] text-white flex items-center justify-center font-medium text-lg overflow-hidden">
                      {g.groupIcon ? <img src={g.groupIcon} className="w-full h-full object-cover" /> : g.groupName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm">{g.groupName}</p>
                      <p className="text-xs text-gray-500">{g.participants?.length} members</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
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