import admin from "../config/firebase.js"
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
                title: title, //service worker fallback ke liye
                body: body,   //service worker fallback ke liye
                imageCount: String(imageCount || 0),
                videoCount: String(videoCount || 0),
                audioCount: String(audioCount || 0),
                senderId: String(senderId || "")
            },
            webpush: {
                headers: {
                    Urgency: "high",
                },
                notification: {
                    title,
                    body
                },
            },
        };

        const response = await admin.messaging().send(message);
        console.log("Notification sent:", response);

    } catch (error) {
        console.error("Push failed:", error);
        return null;
    }
}
export default sendPushNotification;