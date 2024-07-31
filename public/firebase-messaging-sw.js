importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
    apiKey: "AIzaSyB6-_MaO3hpFt0tD1C5IqeLnpKWpalDTx4",
    authDomain: "nonprod-64586.firebaseapp.com",
    projectId: "nonprod-64586",
    storageBucket: "nonprod-64586.appspot.com",
    messagingSenderId: "449251706684",
    appId: "1:449251706684:web:231d21f65d2980501b4039",
    measurementId: "G-XSSJE9P2TF"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
