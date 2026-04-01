importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
    apiKey: "AIzaSyAf8sMsqFSy8vQ-ScIvUiyO2DkOLmZikko",
    projectId: "livechat-ed1ea",
    messagingSenderId: "760427615893",
    appId: "1:760427615893:web:aca876a869f5e6c8e66d9c",
});

const messaging = firebase.messaging();

// Notification click handler - PEHLE LAGAO
self.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked in service worker");
    console.log("Event:", event);
    console.log("Notification:", event.notification);
    console.log("Data:", event.notification.data);
    event.notification.close();

    const senderId = event.notification.data?.senderId;
    console.log("Sender ID:", senderId);

    if (senderId) {
        const url = `/chat/${senderId}`;
        console.log("Redirecting to:", url);

        event.waitUntil(
            clients.matchAll({ type: "window", includeUncontrolled: true })
                .then((clientList) => {
                    console.log("Found clients:", clientList.length);

                    // Pehle existing client check karo
                    for (const client of clientList) {
                        console.log("Client URL:", client.url);
                        if (client.url.includes("/chat") || client.url.includes("/dashboard")) {
                            console.log("Focusing existing client");
                            client.focus();
                            return client.navigate(url);
                        }
                    }
                    console.log("Opening new window");
                    return clients.openWindow(url);
                })
        );
    } else {
        console.log("No senderId found in notification");
    }
});

// Background message handler
messaging.onBackgroundMessage((payload) => {

    console.log("Background message received:", payload);

    const title = payload.data?.title;
    const body = payload.data?.body;
    const senderId = payload.data?.senderId;

    self.registration.showNotification(title, {
        body: body,
        icon: "/back.png",
        badge: "/back.png",
        tag: `chat-${senderId}`,
        renotify: false,
        data: {
            senderId: senderId,
            url: `/chat/${senderId}`
        }
    });
});

self.addEventListener('install', (event) => {
    console.log("SW installed");
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log("SW activated");
    event.waitUntil(clients.claim());
});