import { initializeApp } from "firebase/app"
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyAf8sMsqFSy8vQ-ScIvUiyO2DkOLmZikko",
    authDomain: "livechat-ed1ea.firebaseapp.com",
    projectId: "livechat-ed1ea",
    storageBucket: "livechat-ed1ea.firebasestorage.app",
    messagingSenderId: "760427615893",
    appId: "1:760427615893:web:aca876a869f5e6c8e66d9c",
    measurementId: "G-CPQ7Q48RX3",
    databaseURL:"https://livechat-ed1ea-default-rtdb.firebaseio.com"
};
const app = initializeApp(firebaseConfig);

export const messaging = getMessaging(app)