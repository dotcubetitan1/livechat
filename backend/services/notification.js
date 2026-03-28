import admin from "../config/firebase.js"
const sendPushNotification = async (token, title, body, media = {}) => {
    try {
        const { imageCount, videoCount, audioCount } = media;

        const message = {
            token,
            notification: {
                title,
                body,
            },
            data: {
                type:"chat",
                imageCount:String(imageCount),
                videoCount:String(videoCount),
                audioCount:String(audioCount)
            },
        };
        const response = await admin.messaging().send(message);
        console.log("✅ Notification sent:", response);

    } catch (error) {
        console.error("Push failed:", error);
        return null;
    }
}
export default sendPushNotification;