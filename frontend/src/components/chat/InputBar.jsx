import { useRef ,useState} from "react";
import axios from "axios";
import { GrGallery } from "react-icons/gr";
import { FaMicrophone } from "react-icons/fa";
import { BsEmojiSmile } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { API_BASE_URL } from "../../api/config";

const InputBar = ({ userId, onMessageSent, images, setImages, text, setText }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

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
      onMessageSent(res.data);
      setText("");
      setImages([]);
      setShowMenu(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Send message error:", error);
    } finally {
      setSending(false);
    }
  };

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
          const res = await axios.post(`${API_BASE_URL}/sendMessage/${userId}`, formData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          onMessageSent(res.data);
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
    setIsRecording(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], "voice.webm", { type: "audio/webm" });
        const formData = new FormData();
        formData.append("images", file);
        const res = await axios.post(`${API_BASE_URL}/sendMessage/${userId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        onMessageSent(res.data);
        audioChunksRef.current = [];
      };
      mediaRecorder.start();
    } catch (err) {
      console.error("Mic permission error:", err);
      alert("Microphone permission allow karo");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <>
      {/* Media Previews */}
      {images.length > 0 && (
        <div className="flex gap-2 px-3 py-2 border-t bg-gray-50 overflow-x-auto">
          {images.map((item, index) => (
            <div key={index} className="relative">
              {item.type.startsWith("image") && (
                <img src={item.url} className="w-20 h-20 object-cover rounded-lg" />
              )}
              {item.type.startsWith("video") && (
                <video src={item.url} className="w-20 h-20 object-cover rounded-lg" />
              )}
              {item.type.startsWith("audio") && (
                <audio controls className="w-32"><source src={item.url} /></audio>
              )}
              <button
                onClick={() => setImages((prev) => prev.filter((_, i) => i !== index))}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="bg-[#F0F0F0] px-3 py-4 md:py-3 flex items-center gap-2 border-t border-gray-200">
        {showEmojiPicker && (
          <div className="absolute bottom-16 z-50 w-full md:w-auto">
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
        
        <button onClick={() => setShowEmojiPicker((p) => !p)}
          className="w-10 h-10 text-gray-500 hover:bg-gray-300 rounded-full flex justify-center items-center">
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

        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !sending) handleSend(); }}
          placeholder="Message..."
          className="flex-1 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm outline-none w-40"
        />

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isRecording ? "bg-red-400 -translate-y-2 scale-110" : "bg-gray-200"}`}>
          <FaMicrophone className="text-gray-600" />
        </button>

        <button
          onClick={handleSend}
          disabled={sending}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-white transition ${sending ? "bg-gray-400" : "bg-[#00BFA5]"}`}>
          <svg width="22" height="18" fill="white" viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default InputBar;