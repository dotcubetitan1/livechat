import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../api/config";
import toast from "react-hot-toast";

const MessagesArea = ({ groupId, socketRef, socketConnected, setPreview, messages, setMessages }) => {
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");
  const bottomRef = useRef(null);
  const longPressTimer = useRef(null);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const isFirstLoad = useRef(true);

  // Fetch messages - Initial load
  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/groups/group-messages/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res)
      setMessages(res.data.data); 
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Delete message
  const handleDelete = async (deleteType) => {
    setShowActionMenu(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/delete-message/${selectedMsg._id}`,
        { deleteType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(res.data.message);
      if (deleteType === "forme") {
        setMessages((prev) => prev.filter((m) => m._id !== selectedMsg._id));
      } else {
        setMessages((prev) => prev.map((m) => 
          m._id === selectedMsg._id ? { ...m, deletedForEveryone: true, text: "", images: [], videos: [] } : m
        ));
      }
    } catch (error) {
      toast.error(error.response?.data?.message);
    } finally {
      setShowActionMenu(false);
      setSelectedMsg(null);
    }
  };

  // Edit message
  const handleEditMessage = async () => {
    if (!editText.trim()) return;
    setMessages((prev) => prev.map((m) =>
      m._id === editingMsg._id ? { ...m, text: editText, isEdited: true } : m
    ));
    setEditingMsg(null);
    setEditText("");
    try {
      await axios.post(`${API_BASE_URL}/update-message/${editingMsg._id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(msg);
      // fetchMessages(groupId);
    }
  };

  // Press handlers
  const handlePressStart = (msg) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedMsg(msg);
      setShowActionMenu(true);
    }, 500);
  };

  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };

  // Socket listeners
  useEffect(() => {
    if (groupId) {
      fetchMessages(groupId);
    }
  }, [groupId]);

  useEffect(() => {
    if (!socketConnected || !socketRef?.current) return;

    const handleNewMessage = (msg) => {
      // const senderIdOfIncomingMsg = msg.senderId?.toString();
      // const receiverIdOfIncomingMsg = msg.receiverId?.toString();
      // const currentChatWith = userId?.toString();
      if (msg.groupId === groupId) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    const handleMessageDeleted = ({ messageId, deletedForEveryone }) => {
      if (deletedForEveryone) {
        setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, deletedForEveryone: true, text: "", images: [], videos: [] } : m));
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    };

    const handleMessageUpdated = ({ messageId, text, isEdited }) => {
      setMessages((prev) => prev.map((m) =>
        m._id === messageId ? { ...m, text: text, isEdited: true } : m
      ));
    };

    socketRef.current.on("newMessage", handleNewMessage);
    socketRef.current.on("messageDeleted", handleMessageDeleted);
    socketRef.current.on("messageUpdated", handleMessageUpdated);

    return () => {
      socketRef.current.off("newMessage", handleNewMessage);
      socketRef.current.off("messageDeleted", handleMessageDeleted);
      socketRef.current.off("messageUpdated", handleMessageUpdated);
    };
  }, [groupId, socketConnected, socketRef, setMessages]); 

  // Auto scroll
  useEffect(() => {
    if (!bottomRef.current || messages.length === 0) return;
    if (isFirstLoad.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Message bubble component
  const MessageBubble = ({ msg }) => {
    const isMe = msg.senderId?.toString() === user._id.toString();
    
    return (
      <div
        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
        onMouseDown={() => handlePressStart(msg)}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={() => handlePressStart(msg)}
        onTouchEnd={handlePressEnd}
      >
        <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm
          ${isMe ? "bg-[#DCF8C6] rounded-br-none" : "bg-white rounded-bl-none"}`}>
          {msg.deletedForEveryone ? (
            <p> 🚫 This message was deleted</p>
          ) : (
            <>
              {msg.text && (
                <div>
                  <p className="text-gray-800">{msg.text}</p>
                  {msg.isEdited && (
                    <span className="text-[10px] text-gray-400 ml-1">edited</span>
                  )}
                </div>
              )}
              {msg.images?.map((img, i) => (
                <img key={i} src={img} onClick={() => setPreview({ type: "image", url: img })}
                  className="w-40 h-40 object-cover rounded-lg mt-1 cursor-pointer" />
              ))}
              {msg.videos?.map((video, i) => (
                <video key={i} src={video} onClick={() => setPreview({ type: "video", url: video })}
                  className="w-40 h-40 object-cover rounded-lg mt-1 cursor-pointer" />
              ))}
              {msg.audios?.map((audio, i) => (
                <audio key={i} controls className="mt-1 w-48"><source src={audio} /></audio>
              ))}
              {msg.location && (
                <a href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                  target="_blank" rel="noreferrer"
                  className="block mt-1 rounded-lg overflow-hidden w-48">
                  <div className="relative h-28 bg-green-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-2xl">📍</span>
                  </div>
                  <span className="text-blue-500 text-xs mt-1 block text-center">View on Google Maps</span>
                </a>
              )}
              <p className={`text-[10px] mt-1 text-right ${isMe ? "text-green-600" : "text-gray-400"}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-[#ECE5DD]"
        onClick={() => { setShowActionMenu(false); setSelectedMsg(null); }}
      >
        {messages.map((msg) => (
          <MessageBubble key={msg._id} msg={msg} />
        ))}
        <div ref={bottomRef}></div>
      </div>

      {/* Action Menu Modal */}
      {showActionMenu && selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setShowActionMenu(false); setSelectedMsg(null); }}>
          <div className="bg-white rounded-lg w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <p className="px-4 pt-4 pb-2 text-center text-gray-700">Message Options</p>
            <div className="flex flex-col border-t">
              {selectedMsg.senderId?.toString() === user._id.toString() && !selectedMsg.deletedForEveryone && (
                <button
                  onClick={() => {
                    setShowActionMenu(false);
                    setEditingMsg(selectedMsg);
                    setEditText(selectedMsg.text);
                  }}
                  className="w-full px-4 py-3 text-left text-blue-500 hover:bg-gray-50 flex items-center gap-3"
                >
                  ✏️ <span>Edit Message</span>
                </button>
              )}
              <button onClick={() => handleDelete("forme")}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                🗑️ <span>Delete for me</span>
              </button>
              {selectedMsg.senderId?.toString() === user._id.toString() && (
                <button onClick={() => handleDelete("foreveryone")}
                  className="w-full px-4 py-3 text-left text-red-500 hover:bg-gray-50 flex items-center gap-3 border-t">
                  🚫 <span>Delete for everyone</span>
                </button>
              )}
              <button onClick={() => { setShowActionMenu(false); setSelectedMsg(null); }}
                className="w-full px-4 py-3 text-left text-gray-400 hover:bg-gray-50 flex items-center gap-3 border-t">
                ✕ <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Message Modal */}
      {editingMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setEditingMsg(null); setEditText(""); }}>
          <div className="bg-white rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="px-4 py-3 border-b">
              <h3 className="font-medium text-center">Edit Message</h3>
            </div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 border-0 focus:outline-none resize-none text-gray-800"
              rows={3}
              autoFocus
            />
            <div className="flex border-t">
              <button onClick={() => { setEditingMsg(null); setEditText(""); }}
                className="flex-1 py-3 text-center text-gray-500 border-r">
                Cancel
              </button>
              <button onClick={handleEditMessage}
                className="flex-1 py-3 text-center text-green-600 font-medium">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessagesArea;