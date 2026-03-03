importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.10.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDPmV-xoCWfKpXHzruNQd4QJ758ASEq6vU",
    authDomain: "bit-connect-prd.firebaseapp.com",
    projectId: "bit-connect-prd",
    storageBucket: "bit-connect-prd.firebaseapp.com",
    messagingSenderId: "945109672678",
    appId: "1:945109672678:web:47f5e661ccbb3a42921127"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/favicon.ico'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
