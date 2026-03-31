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
    console.log("Background message received:", payload);

    // Backend se notification object aa raha hai
    const title = payload.notification?.title || payload.data?.title;
    const body = payload.notification?.body || payload.data?.body;

    self.registration.showNotification(title, {
        body: body,
        icon: "/back.png",
        badge: "/back.png",
        tag: "chat-notification",
        data: {
            senderId: payload.data?.senderId,
            url: `/chat/${payload.data?.senderId}`
        }
    });
});
// Notification click handler
console.log("77777")
self.addEventListener("notificationclick", (event) => {
    console.log("88888")
    event.notification.close();
    const senderId = event.notification.data?.senderId;
    console.log("Notification clicked, senderId:", senderId)
    if (senderId) {
        const url = `${self.location.origin}/chat/${senderId}`;
        clients.matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                // Tab already open hai toh focus karo aur navigate karo
                for (const client of clientList) {
                    if ("focus" in client) {
                        client.focus();
                        return client.navigate(url);
                    }
                }
                //  Koi tab nahi toh naya kholo
                return clients.openWindow(url);
            })
    }
})
