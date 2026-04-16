import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import SignUpPage from "./pages/SignUp";
import LoginPage from "./pages/Login";
import ChatPage from "./pages/Chat";
import GroupChatPage from "./pages/GroupChat";
import MainLayout from "./MainLayout";
import ProfilePage from "./pages/Profile";
import Media from "./pages/Media";
import { onMessage } from "firebase/messaging";
import { getFCMToken, messaging } from "./config/firebase";
import { useEffect } from "react";

const FCMHandler = () => {
  useEffect(() => {
    getFCMToken();
    const unsubscribe = onMessage(messaging, (payload) => {
      const title = payload.data?.title;
      const body = payload.data?.body;
      const senderId = payload.data?.senderId;

      const currentPath = window.location.pathname;
      const isAlreadyInChat = currentPath === `/chat/${senderId}`;
      if (isAlreadyInChat) return;

      if (Notification.permission === "granted") {
        const notification = new Notification(title, {
          body: body,
          icon: "/for.webp",
          tag: `chat-${senderId}`,
          data: { senderId },
        });

        notification.onclick = (event) => {
          event.preventDefault();
          notification.close();
          window.location.href = `/chat/${senderId}`;
        };
      }
    });

    return () => unsubscribe();
  }, []);

  return null; // UI nahi render karta
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/signup" replace />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true, 
        path: "chat",
        element: (
          <div className="hidden md:flex items-center justify-center h-screen font-semibold text-gray-400">
            Select user to start chat
          </div>
        ),
      },
      {
        path: "chat/:userId",
        element: <ChatPage />,
      },
      {
        path: "group/:groupId",
        element: <GroupChatPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "media/:userId",
        element: <Media />,
      },
    ],
  },
  {
    path:"*",
    element:<p className="flex justify-center items-center h-screen bg-black text-white font-bold text-[24px]">Page Not Found</p>
  }
]);

function App() {
  return (
    <>
      <FCMHandler />
      <RouterProvider router={router} />
    </>
  );
}

export default App;