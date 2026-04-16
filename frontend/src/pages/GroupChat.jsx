
import { useState, useEffect } from "react";
import { useParams, useOutletContext } from "react-router-dom";
import ChatHeader from "../components/group/ChatHeader";
import MessagesArea from "../components/group/MessagesArea";
import InputBar from "../components/group/InputBar"; 
import PreviewModal from "../components/group/PreviewModal";

const GroupChatPage = () => {
  const { groupId } = useParams();
  const { socketRef, socketConnected } = useOutletContext();
  const [preview, setPreview] = useState(null);
  const [messages, setMessages] = useState([]);
  const [images, setImages] = useState([]);
  const [text, setText] = useState(""); 

  const handleMessagesUpdate = (newMessages) => {
    setMessages(newMessages);
  };
  const handleNewMessage = (newMsg) => {
    setMessages((prev) => {
      if (prev.some(m => m._id === newMsg._id)) return prev;
      return [...prev, newMsg];
    });
  };

  return (
    <>
      <ChatHeader groupId={groupId} />
      <MessagesArea
        groupId={groupId}
        socketRef={socketRef}
        socketConnected={socketConnected}
        setPreview={setPreview}
        messages={messages} 
        setMessages={handleMessagesUpdate}
      />
      <InputBar
        groupId={groupId}
        onMessageSent={handleNewMessage}
        images={images} 
        setImages={setImages} 
        text={text} 
        setText={setText} 
      />
      <PreviewModal preview={preview} onClose={() => setPreview(null)} />
    </>
  );
};


export default GroupChatPage;