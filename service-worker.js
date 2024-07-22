// service-worker.js

self.addEventListener('push', function (event) {
    const data = event.data ? event.data.json() : {};

    const options = {
        body: data.body,
        icon: data.icon,
        image: data.image,
        badge: data.badge,
        actions: data.actions,
        vibrate: data.vibrate,
        sound: data.sound,
        data: {
            url: data.data.url,
            actions: data.actions
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Close the notification

    // Log the action and data for debugging
    console.log("Notification click: ", event.action, event.notification.data);

    let urlToOpen = event.notification.data.url; // Default URL
    if (event.action === 'shop_now') {
        console.log("Shop Now action clicked");
        urlToOpen = event.notification.data.url;
    } else if (event.action === 'dismiss') {
        console.log("Dismiss action clicked");
        // Handle dismiss action if needed
        return;
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
