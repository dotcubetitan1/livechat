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

    const title = payload.notification?.title || payload.data?.title;
    const body = payload.notification?.body || payload.data?.body;
    const senderId = payload.data?.senderId;
    
    if (!senderId) {
        console.warn("No senderId in notification payload");
        return;
    }

    const notificationOptions = {
        body: body,
        icon: "/back.png",
        badge: "/back.png",
        tag: `chat-${senderId}`,
        data: {
            senderId: senderId,
            url: `/chat/${senderId}` // Relative URL is fine
        }
    };

    self.registration.showNotification(title, notificationOptions);
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked:", event);
    event.notification.close();
    
    const senderId = event.notification.data?.senderId;
    const relativeUrl = event.notification.data?.url || `/chat/${senderId}`;
    
    console.log("Relative URL:", relativeUrl);
    
    event.waitUntil(
        clients.matchAll({ 
            type: "window", 
            includeUncontrolled: true 
        }).then((clientList) => {
            // Check if there's already a window/tab with our app
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && "focus" in client) {
                    // Found existing window, focus it and navigate
                    client.focus();
                    // Navigate to the specific chat
                    return client.navigate(relativeUrl);
                }
            }
            // No existing window, open a new one with the full URL
            const fullUrl = `${self.location.origin}${relativeUrl}`;
            console.log("Opening new window with URL:", fullUrl);
            return clients.openWindow(fullUrl);
        })
    );
});