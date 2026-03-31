import admin from "../config/firebase.js"
import User from "../models/User.js"; 

const sendPushNotification = async (token, title, body, media = {}) => {
    try {
        const { imageCount, videoCount, audioCount, senderId } = media;
        if (!token) {
            console.log(" No token provided");
            return null;
        }
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
        console.error("❌ Push failed:", error.message);

        if (error.code === 'messaging/registration-token-not-registered') {
            console.log("Invalid token detected, removing from database...");
            try {
                const result = await User.updateOne(
                    { fcmToken: token },
                    { $unset: { fcmToken: "" } }
                );
                console.log("Token removed from database. Modified:", result.modifiedCount);
            } catch (dbError) {
                console.error("Failed to remove token:", dbError);
            }
        }

        return null;
    }
}
export default sendPushNotification;