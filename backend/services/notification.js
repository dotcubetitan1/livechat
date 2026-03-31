import admin from "../config/firebase.js";

const sendPushNotification = async (token, title, body, media = {}) => {
    try {
        const { imageCount, videoCount, audioCount, senderId } = media;

        const message = {
            token,
            notification: {
                title,
                body,
            },
            data: {
                type: "chat",
                title: title,
                body: body,
                imageCount: String(imageCount || 0),
                videoCount: String(videoCount || 0),
                audioCount: String(audioCount || 0),
                senderId: String(senderId || ""),
                click_action: "FLUTTER_NOTIFICATION_CLICK",
            },
            android: {
                priority: "high",
                notification: {
                    clickAction: "FLUTTER_NOTIFICATION_CLICK",
                },
            },
            apns: {
                payload: {
                    aps: {
                        "mutable-content": 1,
                    },
                },
            },
            webpush: {
                headers: {
                    Urgency: "high",
                },
                notification: {
                    title,
                    body,
                    icon: "/back.png",
                    badge: "/badge.png",
                    data: {
                        url: `/chat/${senderId}`,
                        senderId: senderId,
                    },
                },
                fcmOptions: {
                    link: `${process.env.FRONTEND_URL}/chat/${senderId}`,
                },
            },
        };

        const response = await admin.messaging().send(message);
        console.log("Notification sent successfully:", response);
        return response;
    } catch (error) {
        console.error("Push notification failed:", error);
        return null;
    }
};

export default sendPushNotification;