import { getMessaging, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

export const setupForegroundNotification = () => {
    onMessage(messaging, (payload) => {

        // if (document.visibilityState === "visible") {
        //     return;
        // }

        // new Notification(payload.data.title, {
        //     body: payload.data.body,
        // });
        console.log("Foreground message:", payload);
    });
};