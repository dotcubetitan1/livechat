import { initializeApp } from "firebase/app"
import { getMessaging, getToken } from "firebase/messaging";


const firebaseConfig = {
    apiKey: "AIzaSyAf8sMsqFSy8vQ-ScIvUiyO2DkOLmZikko",
    authDomain: "livechat-ed1ea.firebaseapp.com",
    projectId: "livechat-ed1ea",
    storageBucket: "livechat-ed1ea.firebasestorage.app",
    messagingSenderId: "760427615893",
    appId: "1:760427615893:web:aca876a869f5e6c8e66d9c",
    measurementId: "G-CPQ7Q48RX3",
};
const app = initializeApp(firebaseConfig);
export const messaging = getMessaging(app)

export const getFCMToken = async () => {
    try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
            console.warn("Notification permission denied");
            return null;
        }
        // Ek hi jagah register karo
        const registration = await navigator.serviceWorker.register(
            "/firebase-messaging-sw.js"
        );
        await navigator.serviceWorker.ready;
        const token = await getToken(messaging, {
            vapidKey: "BH5ZiwyfYvtQCsrCcDhiwYtiBY9jsWh6nCwhu7pckrcGv9FjvSbarMD1aOQWyBs8Fdz5jzwTA5ZZWa1wty8Vrrk",
            serviceWorkerRegistration: registration,
        });
        return token || null
    } catch (error) {
        console.error("FCM Token error:", error);
        return null;
    }
} 