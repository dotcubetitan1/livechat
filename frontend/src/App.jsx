import { Routes, Route, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import MainLayout from "./MainLayout";
import ProfilePage from "./pages/ProfilePage";
import { setupForegroundNotification } from "./utils/notification";
import { useEffect } from "react";

function App() {
  useEffect(() => {
    Notification.requestPermission();
    setupForegroundNotification();
  }, []);
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