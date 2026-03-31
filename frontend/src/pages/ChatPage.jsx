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
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, [navigate]);
  
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
      // New messages → smooth scroll
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
      <div className="px-4 py-3 border-b flex items-center gap-2 bg-white">
        {/* Mobile Back Button */}
        <button
          onClick={() => navigate("/chat")}
          className="md:hidden text-2xl"
        >
          ←
        </button>
        <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
          {selectedUser.fullName?.charAt(0)}
        </div>
        <p className="font-semibold">{selectedUser.fullName}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-gray-50">
        {messages.map((msg) => {
          const isMe = msg.senderId?.toString() === user._id.toString();
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div>
                {msg.text && (
                  <div className="bg-green-200 px-3 py-2 rounded-xl text-sm inline-block">
                    {msg.text}
                  </div>
                )}

                {msg.images?.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="chat"
                    onClick={() => setPreview({ type: "image", url: img })}
                    className="w-40 h-40 object-cover rounded-lg mt-2 cursor-pointer"
                  />
                ))}
                {msg.videos?.map((video, i) => (
                  <video
                    key={i}
                    src={video}
                    onClick={() => setPreview({ type: "video", url: video })}
                    className="w-40 h-40 object-cover rounded-lg mt-2 cursor-pointer"
                  />
                ))}
                {msg.audios?.map((audio, i) => (
                  <audio
                    key={i}
                    controls
                    className="mt-2"
                  >
                    <source src={audio} />
                  </audio>
                ))}
                {msg.location && (
                  <a
                    href={`https://www.google.com/maps?q=${msg.location.lat},${msg.location.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="block mt-2 rounded-lg overflow-hidden w-full max-w-xs"
                  >
                    {/* Map Preview Box */}
                    <div
                      className="relative w-full h-36 rounded-lg overflow-hidden border border-gray-200 shadow-sm"
                      style={{
                        backgroundImage: `url(https://tile.openstreetmap.org/15/${Math.floor((msg.location.lng + 180) / 360 * Math.pow(2, 15))}/${Math.floor((1 - Math.log(Math.tan(msg.location.lat * Math.PI / 180) + 1 / Math.cos(msg.location.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 15))}.png)`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    >
                      {/* Pin Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl drop-shadow-lg">📍</span>
                      </div>
                    </div>
                    <span className="text-blue-600 text-sm mt-1 block text-center">
                      📍 View on Google Maps
                    </span>
                  </a>
                )}
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
      {/* Input */}
      <div className="p-1 border-t flex gap-2 bg-white relative">

        <div >
          <button onClick={() => setShowMenu((prev) => !prev)} className="text-xl px-2 py-1 rounded-full transition font-bold text-gray-800 mt-2 ">
            <GrGallery />
          </button>
        </div>
        {/* Dropdown Menu */}
        {
          showMenu && (
            <div className="absolute bottom-15 left-3 bg-white border border-gray-200 rounded-xl shadow-lg w-44 z-50 overflow-hidden">
              {/* Image */}
              <button
                onClick={() => {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.click();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              >
                🖼️ Image
              </button>
              <button
                onClick={() => {
                  fileInputRef.current.accept = "video/*";
                  fileInputRef.current.click();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
              >
                🎥 Video

              </button>

              {/* Audio */}
              <button
                onClick={() => {
                  fileInputRef.current.accept = "audio/*";
                  fileInputRef.current.click();
                  setShowMenu(false);
                }}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t"
              >
                🎵 Audio
              </button>
              {/* Location */}
              <button
                onClick={() => {
                  handleSendLocation();
                  setShowMenu(false);
                }}
                disabled={locationLoading}
                className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-t disabled:opacity-50"
              >
                {locationLoading ? "⏳" : "📍"} Location
              </button>
            </div>
          )
        }
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !sending) {
              handleSend();
            }
          }}
          placeholder="Send Message..."
          className="flex-1 md:w-20 w-10 border rounded-full px-4 py-2 outline-none"
        />
        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          className={`bg-gray-300 px-3 py-2 rounded-full transition-all duration-200
          ${isRecording ? "-translate-y-5 scale-110 bg-red-400" : ""}`}
        >
          <FaMicrophone />
        </button>
        <button
          onClick={handleSend}
          disabled={sending}
          className={`px-4 py-2 rounded-full text-white ${sending ? "bg-gray-400" : "bg-green-500"
            }`}
        >
          {sending ? "Sending..." : "Send"}
        </button>

      </div>
    </>
  );
};

export default ChatPage;