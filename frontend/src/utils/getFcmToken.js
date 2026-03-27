import { getToken } from "firebase/messaging"
import { messaging } from "./firebase"

const getFCMToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.log("notification permission denied")
            return null;
        }
        const token = await getToken(messaging, {
            vapidKey:"BH5ZiwyfYvtQCsrCcDhiwYtiBY9jsWh6nCwhu7pckrcGv9FjvSbarMD1aOQWyBs8Fdz5jzwTA5ZZWa1wty8Vrrk"
        });
        console.log("FCM TOKEN:", token);
        return token;
    } catch (error) {
        console.error("Token error:", error);
        return null;
    }
}
export default getFCMToken;