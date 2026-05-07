import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAgpVLU79lqxaiTpm3e0zvoChANgR8sQgU",
  authDomain: "promoja-968f2.firebaseapp.com",
  projectId: "promoja-968f2",
  storageBucket: "promoja-968f2.firebasestorage.app",
  messagingSenderId: "759038459966",
  appId: "1:759038459966:web:f66aeda8f74f154335116f",
  measurementId: "G-YK8GVQLM5Z",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };