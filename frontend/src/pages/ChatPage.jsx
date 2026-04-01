import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";
import { GrGallery } from "react-icons/gr";
import { FaMicrophone } from "react-icons/fa";

const ChatPage = () => {
  const { userId } = useParams();
  const { socketRef } = useOutletContext();
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false)

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
      fetchMessages(userId);
    }
  }, [userId]);

  useEffect(() => {
    console.log("socket inside effect:", socketRef?.current)
    if (!socketRef?.current) return;
    socketRef.current.on("newMessage", (msg) => {
      if (msg.senderId?.toString() === userId || msg.receiverId?.toString() === userId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socketRef.current.off("newMessage");
    };

  }, [userId, socketRef, socketRef?.current]);

  const isFirstLoad = useRef(true);

  useEffect(() => {
    if (!bottomRef.current) return;

    if (isFirstLoad.current) {
      // First load → direct jump
      bottomRef.current.scrollIntoView({ behavior: "auto" });
      isFirstLoad.current = false;
    } else {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const fetchUserDetails = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/getAllContacts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const contact = res.data.find((c) => c._id === id);
      setSelectedUser(contact);
    } catch (error) {
      console.error("Error fetching user details:", error);
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
      await axios.post(`${API_BASE_URL}/sendMessage/${userId}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
        <button onClick={() => navigate("/chat")} className="md:hidden text-white text-xl mr-1">←</button>
        <div className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center font-medium text-sm flex-shrink-0">
          {selectedUser.fullName?.charAt(0)}
        </div>
        <div>
          <p className="text-white font-medium text-sm">{selectedUser.fullName}</p>
          <p className="text-white/70 text-xs">Online</p>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 bg-[#ECE5DD]">
        {messages.map((msg) => {
          const isMe = msg.senderId?.toString() === user._id.toString();
          return (
            <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm
          ${isMe ? "bg-[#DCF8C6] rounded-br-none" : "bg-white rounded-bl-none"}`}>
                {msg.text && <p className="text-gray-800">{msg.text}</p>}
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
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

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
      <div className="bg-[#F0F0F0] px-2 py-2 flex items-center gap-2 border-t border-gray-200">
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
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none" />

        <button onMouseDown={startRecording} onMouseUp={stopRecording} onMouseLeave={stopRecording}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
      ${isRecording ? "bg-red-400 -translate-y-2 scale-110" : "bg-gray-200"}`}>
          <FaMicrophone className="text-gray-600" />
        </button>

        <button onClick={handleSend} disabled={sending}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition
      ${sending ? "bg-gray-400" : "bg-[#00BFA5]"}`}>
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </>
  );
};

export default ChatPage;