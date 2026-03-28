importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAf8sMsqFSy8vQ-ScIvUiyO2DkOLmZikko",
    projectId: "livechat-ed1ea",
    messagingSenderId: "760427615893",
    appId: "1:760427615893:web:aca876a869f5e6c8e66d9c",
});

const messaging = firebase.messaging();

// messaging.onBackgroundMessage((payload) => {
//     self.registration.showNotification(
//         payload.notification.title,
//         {
//             body: payload.notification.body,
//             image: payload.notification.image,
//             data: payload.data, // ✅ ye sahi hai
//         }
//     );
// });

// self.addEventListener("notificationclick", function (event) {
//   event.notification.close();

//   const data = event.notification.data || {};
//   const videoUrl = data.videoUrl;

//   let url = "/chat";

//   if (videoUrl && videoUrl !== "") {
//     url = videoUrl;
//   }

//   event.waitUntil(clients.openWindow(url));
// });