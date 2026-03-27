import admin from "../config/firebase.js"
const sendPushNotification = async (token, title, body, media = {}) => {
    try {
        const { image, video } = media;

        const message = {
            token,
            notification: {
                title,
                body,
                ...(image && { image }),
            },
            data: {
                type: video ? "video" : "chat",
                videoUrl: video || ""
            },
        };
        const response = await admin.messaging().send(message);
        console.log("✅ Notification sent:", response);

    } catch (error) {
        console.error("❌ Push failed:", error?.errorInfo?.code);
        return null;
    }
}
export default sendPushNotification;