importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAgpVLU79lqxaiTpm3e0zvoChANgR8sQgU",
  authDomain: "promoja-968f2.firebaseapp.com",
  projectId: "promoja-968f2",
  storageBucket: "promoja-968f2.firebasestorage.app",
  messagingSenderId: "759038459966",
  appId: "1:759038459966:web:f66aeda8f74f154335116f",
  measurementId: "G-YK8GVQLM5Z",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/favicon.png",
    badge: "/favicon.png",

    icon: "/logo-notificacao.png",
badge: "/logo-notificacao.png",
  });
});