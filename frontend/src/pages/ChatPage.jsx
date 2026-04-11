import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { GrGallery } from "react-icons/gr";
import { FaMicrophone } from "react-icons/fa";
import { IoArrowBackCircleOutline } from "react-icons/io5";
import EmojiPicker from "emoji-picker-react"
import { BsEmojiSmile } from "react-icons/bs";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const ChatPage = () => {
  const { userId } = useParams();
  const { socketRef, socketConnected } = useOutletContext();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [onlineUser, setOnlineUser] = useState([])

  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showActionMenu, setShowActionMenu] = useState(false);

  // edit states
  const [editingMsg, setEditingMsg] = useState(null);
  const [editText, setEditText] = useState("");

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const longPressTimer = useRef(null);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (userId) {
      fetchUserById(userId);
      fetchMessages(userId);
      fetchOnlineUsers(userId);
    }
  }, [userId]);

  useEffect(() => {
    console.log("Socket connected status:", socketConnected);
    if (!socketConnected || !socketRef?.current) {
      console.log("Waiting for socket connection...");
      return;
    }
    const handleConnect = () => {
      console.log("Socket reconnected");
      fetchMessages(userId);
      fetchOnlineUsers();
    }
    const handleNewMessage = (msg) => {
      console.log("Message received via socket:", msg)
      const senderIdOfIncomingMsg = msg.senderId?.toString();
      const receiverIdOfIncomingMsg = msg.receiverId?.toString();
      const currentChatWith = userId?.toString();

      if (senderIdOfIncomingMsg === currentChatWith || receiverIdOfIncomingMsg === currentChatWith) {
        setMessages((prev) => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    }
    const handleMessageDeleted = ({ messageId, deletedForEveryone }) => {
      console.log("Message delete via socket")
      if (deletedForEveryone) {
        setMessages((prev) => prev.map((m) => m._id === messageId ? { ...m, deletedForEveryone: true, text: "", images: [], videos: [] } : m))
      } else {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      }
    }
    const handleMessageUpdated = ({ messageId, text, isEdited }) => {
      console.log("Message updated via socket");
      setMessages((prev) => prev.map((m) =>
        m._id === messageId
          ? { ...m, text: text, isEdited: true }
          : m
      ));
    };
    socketRef.current.on("connect", handleConnect);
    socketRef.current.on("newMessage", handleNewMessage);
    socketRef.current.on("messageDeleted", handleMessageDeleted);
    socketRef.current.on("messageUpdated", handleMessageUpdated);

    return () => {
      socketRef.current.off("connect", handleConnect);
      socketRef.current.off("newMessage", handleNewMessage);
      socketRef.current.off("messageDeleted", handleMessageDeleted);
      socketRef.current.off("messageUpdated", handleMessageUpdated);
    };

  }, [userId, socketConnected, socketRef]);

  const isFirstLoad = useRef(true);
  useEffect(() => {
    isFirstLoad.current = true;
  }, [userId]);

  useEffect(() => {
    if (!bottomRef.current || messages.length === 0) return;

    if (isFirstLoad.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchOnlineUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getOnlineUsers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOnlineUser(res.data.onlineUsers);
      // console.log(res.data.onlineUsers)
    } catch (error) {
      console.error("Error fetching online user :", error);
    }
  };
  const fetchUserById = async (id) => {
    try {
      setLoading(true)
      const res = await axios.get(`${API_BASE_URL}/get-user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // console.log(res.data.data)
      setSelectedUser(res.data.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false)
    }
  };
  const fetchMessages = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getMessagesByUserId/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  const handleDelete = async (deleteType) => {
    setShowActionMenu(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/delete-message/${selectedMsg._id}`,
        { deleteType },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log(res)
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message);
      console.log(error)
    } finally {
      setShowActionMenu(false);
      setSelectedMsg(null);
    }
  }
  const handleEditMessage = async () => {
    if (!editText.trim()) return;
    setMessages((prev) => prev.map((m) =>
      m._id === editingMsg._id ? { ...m, text: editText, isEdited: true } : m
    ))
    setEditingMsg(null);
    setEditText("")
    try {
      await axios.post(`${API_BASE_URL}/update-message/${editingMsg._id}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${token}` } }
      )
    } catch (error) {
      const msg = error.response?.data?.message || error.message;
      alert(msg);
      fetchMessages(userId);
    }
  }
  const handleSend = async () => {
    if (sending) return;
    if (!text.trim() && images.length === 0) return;
    setSending(true);
    try {
      const formData = new FormData();
      formData.append("text", text);
      images.forEach((item) => {
        formData.append("images", item.file);
      });
      const res = await axios.post(`${API_BASE_URL}/sendMessage/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages((prev) => [...prev, res.data]);
      // console.log(res.data)
      setText("");
      setImages([]);
      setShowMenu(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false)
    }
  }
  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation supported nahi hai is browser mein");
      return;
    }
    setLocationLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const formData = new FormData();
          formData.append("lat", lat);
          formData.append("lng", lng);

          await axios.post(`${API_BASE_URL}/sendMessage/${userId}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error("Location send error:", error);
          alert("Location send nahi hui, dobara try karo");
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Location access allow karo browser mein");
        setLocationLoading(false);
      }
    );
  };
  const startRecording = async () => {
    setIsRecording(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        const file = new File([audioBlob], "voice.webm", {
          type: "audio/webm",
        });
        const formData = new FormData();
        formData.append("images", file);
        await axios.post(`${API_BASE_URL}/sendMessage/${userId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        })
        audioChunksRef.current = []
      }
      mediaRecorder.start();
    } catch (err) {
      console.error("Mic permission error:", err);
      alert("Microphone permission allow karo");
    }

  };
  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  }
  const handlePressStart = (msg) => {
    longPressTimer.current = setTimeout(() => {
      setSelectedMsg(msg);
      setShowActionMenu(true);
    }, 500);
  };
  const handlePressEnd = () => {
    clearTimeout(longPressTimer.current);
  };
  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji)
    // console.log(emojiData)
  }
  const handleReaction = async (emoji, msgId) => {
    console.log(msgId, emoji)
    setReactionMsgId(null)
    try {
      await axios.post(
        `${API_BASE_URL}/message-reaction/${msgId}`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages((prev) =>
        prev.map((m) => m._id === msgId ? {
          ...m,
          reactions: [...m.reactions.filter((r) => r.userId !== user._id)]
        } : m)
      )
    } catch (error) {

    }
  }
  if (loading) {
    return <div className="flex justify-center items-center h-full">
      <div className="w-15 h-15 border-4 border-[#075E54] rounded-full border-t-transparent animate-spin mx-auto "></div>
    </div>
  }
  if (!selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Select a user to start chat
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="px-4 py-3 bg-[#075E54] flex items-center gap-3">
        <button onClick={() => navigate("/chat")} className="md:hidden text-white text-2xl mr-1 p-2 -m-2">
          <IoArrowBackCircleOutline />
        </button>
        <Link
          to={`/media/${userId}`}
          className="w-9 h-9 rounded-full bg-[#ffffff] text-[#272626] flex items-center justify-center font-medium text-lg overflow-hidden cursor-pointer " >
          {selectedUser?.profilePic
            ? <img src={selectedUser.profilePic} className="w-full h-full object-cover" />
            : selectedUser.fullName?.charAt(0)}
        </Link>
        <div>
          <p className="text-white font-medium text-sm">{selectedUser.fullName}</p>
          <p className={`text-xs ${onlineUser.includes(userId) ? "text-green-300" : "text-white/50"}`}>
            {onlineUser.includes(userId) ? "🟢 Online" : "⚫ Offline"}
          </p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-[#ECE5DD]"
        onClick={() => { setShowActionMenu(false); setSelectedMsg(null) }}
      >
        {messages.map((msg) => {
          const isMe = msg.senderId?.toString() === user._id.toString();
          return (
            <div
              key={msg._id}
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
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* Action Menu - Delete + Edit Together */}
      {showActionMenu && selectedMsg && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
          onClick={() => { setShowActionMenu(false); setSelectedMsg(null); }}>

          <div className="bg-white rounded-lg w-full max-w-xs" onClick={e => e.stopPropagation()}>
            <p className="px-4 pt-4 pb-2 text-center text-gray-700">Message Options</p>

            <div className="flex flex-col border-t">

              {/* Edit Option - Sirf sender ke liye */}
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

              {/* Delete for me */}
              <button
                onClick={() => handleDelete("forme")}
                className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-3"
              >
                🗑️ <span>Delete for me</span>
              </button>

              {/* Delete for everyone - Sirf sender ke liye */}
              {selectedMsg.senderId?.toString() === user._id.toString() && (
                <button
                  onClick={() => handleDelete("foreveryone")}
                  className="w-full px-4 py-3 text-left text-red-500 hover:bg-gray-50 flex items-center gap-3 border-t"
                >
                  🚫 <span>Delete for everyone</span>
                </button>
              )}

              {/* Cancel */}
              <button
                onClick={() => { setShowActionMenu(false); setSelectedMsg(null); }}
                className="w-full px-4 py-3 text-left text-gray-400 hover:bg-gray-50 flex items-center gap-3 border-t"
              >
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
              <button
                onClick={() => { setEditingMsg(null); setEditText(""); }}
                className="flex-1 py-3 text-center text-gray-500 border-r"
              >
                Cancel
              </button>
              <button
                onClick={handleEditMessage}
                className="flex-1 py-3 text-center text-green-600 font-medium"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setPreview(null)}
        >
          {preview.type === "image" ? (
            <img
              src={preview.url}
              className="max-h-[90%] max-w-[90%] rounded-lg"
            />
          ) : (
            <video
              src={preview.url}
              controls
              autoPlay
              className="max-h-[90%] max-w-[90%] rounded-lg"
            />
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files);

          const newFiles = files.map((file) => ({
            file,
            url: URL.createObjectURL(file),
            type: file.type
          }));

          setImages((prev) => [...prev, ...newFiles]);
        }}
        className="hidden"
      />
      {images.length > 0 && (
        <div className="flex gap-2 px-3 py-2 border-t bg-gray-50 overflow-x-auto">
          {images.map((item, index) => (
            <div key={index} className="relative">

              {/* Image preview */}
              {item.type.startsWith("image") && (
                <img
                  src={item.url}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}

              {/* Video preview */}
              {item.type.startsWith("video") && (
                <video
                  src={item.url}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              )}

              {/* Audio preview */}
              {item.type.startsWith("audio") && (
                <audio controls className="w-32">
                  <source src={item.url} />
                </audio>
              )}

              {/* Cross button */}
              <button
                onClick={() =>
                  setImages((prev) => prev.filter((_, i) => i !== index))
                }
                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
              >
                ✕
              </button>

            </div>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div className="bg-[#F0F0F0] px-3 py-4 md:py-3 flex items-center gap-2 border-t border-gray-200">
        {showEmojiPicker && (
          <div className="absolute bottom-16 z-50 w-full md:w-auto ">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              height={350}
              width="100%"
              searchDisabled={false}
              skinTonesDisabled
              previewConfig={{ showPreview: false }}
            />
          </div>
        )}
        <button
          onClick={() => setShowEmojiPicker((p) => !p)}
          className="w-10 h-10 text-gray-500 hover:bg-gray-300 rounded-full flex justify-center items-center"
        >
          <BsEmojiSmile className="text-xl" />
        </button>
        <button onClick={() => setShowMenu(p => !p)}
          className="w-10 h-10 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-200">
          <GrGallery className="text-xl" />
        </button>

        {showMenu && (
          <div className="absolute bottom-16 left-3 md:left-72 bg-white border border-gray-200 rounded-2xl shadow-xl w-44 z-50 overflow-hidden">
            <button onClick={() => { fileInputRef.current.accept = "image/*"; fileInputRef.current.click(); setShowMenu(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700">
              🖼️ Image
            </button>
            <button onClick={() => { fileInputRef.current.accept = "video/*"; fileInputRef.current.click(); setShowMenu(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t">
              🎥 Video
            </button>
            <button onClick={() => { fileInputRef.current.accept = "audio/*"; fileInputRef.current.click(); setShowMenu(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t">
              🎵 Audio
            </button>
            <button onClick={() => { handleSendLocation(); setShowMenu(false); }} disabled={locationLoading}
              className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t disabled:opacity-50">
              {locationLoading ? "⏳" : "📍"} Location
            </button>
          </div>
        )}

        <input value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !sending) handleSend(); }}
          placeholder="Message..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none w-40" />

        <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
      ${isRecording ? "bg-red-400 -translate-y-2 scale-110" : "bg-gray-200"}`}>
          <FaMicrophone className="text-gray-600" />
        </button>

        <button onClick={handleSend} disabled={sending}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition
      ${sending ? "bg-gray-400" : "bg-[#00BFA5]"}`}>
          <svg width="22" height="18" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </>
  );
};

export default ChatPage;