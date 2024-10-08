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

function sendTrackingRequest(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            mode: 'no-cors'
        }
    }).then(response => {
        console.log('Tracking request sent:', response);
    }).catch(error => {
        console.error('Tracking request failed:', error);
    });
}

messaging.onBackgroundMessage((payload) => {
    console.log('Received background message:', payload);

    const trackUrl = payload.data.track_url;
    if (trackUrl) {
        const url = trackUrl + '&i=true'
        sendTrackingRequest(url);
    }

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: payload.notification.icon,
        badge: payload.notification.badge,
        image: payload.notification.image,
        data: {
            url: payload.data.url,
            notification_id: payload.data.notification_id,
            actions: payload.notification.actions,
            track_url: payload.data.track_url
        },
        actions: payload.notification.actions ? payload.notification.actions.map(action => ({
            action: action.action,
            title: action.title,
            icon: action.icon,
        })) : []
    };
    console.log("========>notification options", payload.notification.actions)
    self.registration.showNotification(notificationTitle, notificationOptions);

    // Handle auto-close
    if (payload.data.autoClose) {
        setTimeout(() => {
            self.registration.getNotifications({ tag: payload.data.notification_id }).then(notifications => {
                notifications.forEach(notification => notification.close());
            });
        }, 8000); // Auto dismiss after 8 seconds
    }
});

// Listen for notification click events
self.addEventListener('notificationclick', function (event) {

    event.notification.close();

    const action = event.action;

    const trackUrl = event.notification.data.track_url;

    const url = trackUrl + '&c=true' + '&b=default'
    // Make the tracking request
    if (trackUrl) {
        sendTrackingRequest(url);
    }

    // Handle action clicks
    if (action) {
        const actionItem = event.notification.actions.find(item => item.action === action);
        if (actionItem && actionItem.action) {
            const url = trackUrl + '&c=true' + `&b=${actionItem.action}`
            // Make the tracking request
            if (trackUrl) {
                sendTrackingRequest(url);
            }
            clients.openWindow(actionItem.action);
        }
    } else {
        // Default click action
        clients.openWindow(notificationData.url);
    }
});

// Listen for notification close events
self.addEventListener('notificationclose', function (event) {
    // Optional: Handle notification close event if needed
});
