import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import MainLayout from "./MainLayout";
import ProfilePage from "./pages/ProfilePage";
import { onMessage } from "firebase/messaging";
import { getFCMToken, messaging } from "./notification/firebase";
import { useEffect } from "react";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Request permission and get token
    const initFCM = async () => {
      const token = await getFCMToken();
      console.log("FCM Token:", token);
    };
    initFCM();

    // Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload);

      const title = payload.notification?.title || payload.data?.title;
      const body = payload.notification?.body || payload.data?.body;
      const senderId = payload.data?.senderId;
      
      if (!senderId) {
        console.warn("No senderId in notification payload");
        return;
      }

      // Check if we're already on that chat page
      const currentPath = location.pathname;
      const targetPath = `/chat/${senderId}`;
      
      // Show notification only if we're not already in that chat
      if (currentPath !== targetPath) {
        if (Notification.permission === "granted") {
          const notification = new Notification(title, {
            body: body,
            icon: "/for.webp",
            tag: `chat-${senderId}`,
            data: {
              senderId: senderId,
              url: targetPath
            }
          });

          // Handle click on foreground notification
          notification.onclick = (event) => {
            event.preventDefault();
            notification.close();
            // Navigate to the chat
            navigate(targetPath);
          };
        }
      } else {
        console.log("Already on the chat page, not showing notification");
      }
    });

    return () => unsubscribe();
  }, [navigate, location]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* LAYOUT ROUTES */}
      <Route path="/" element={<MainLayout />}>
        <Route path="chat" element={<div className="md:flex hidden items-center justify-center h-screen font-semibold">Select user to start chat</div>} />
        <Route path="chat/:userId" element={<ChatPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;