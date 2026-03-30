importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAf8sMsqFSy8vQ-ScIvUiyO2DkOLmZikko",
    projectId: "livechat-ed1ea",
    messagingSenderId: "760427615893",
    appId: "1:760427615893:web:aca876a869f5e6c8e66d9c",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(" Background message:", payload);

  self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
  });
});
