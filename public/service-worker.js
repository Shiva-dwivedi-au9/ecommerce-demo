self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('push', (event) => {
    if (event.data) {
        const payload = event.data.json();

        const trackUrl = payload.data.track_url;

        const title = payload.notification?.title || 'Default Title';
        const options = {
            body: payload.notification?.body || 'Default Body',
            icon: payload.notification?.icon ? payload?.notification?.icon : payload.notification?.image || null,
            image: payload.notification?.image || '/default-image.png',
            data: {
                url: payload.data?.url || '/',
                notification_id: payload.data?.notification_id,
                actions: payload.notification?.actions ? payload.notification.actions : [],
                trackUrl
            },
            actions: payload.notification?.actions ? payload.notification.actions.map(action => ({
                action: action.action,
                title: action.title,
                icon: action.icon,
            })) : [],
        };
        event.waitUntil(
            self.registration.showNotification(title, options)
        );
        if (trackUrl) {
            const url = trackUrl + '&i=true'
            sendTrackingRequest(url);
        }
    } else {
        console.log('Push event but no data');
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const notificationData = event.notification.data;
    let urlToOpen = notificationData.url;
    let actionItem = { action: 'default' }; // Default action if user clicks on notification body
    let trackUrl = notificationData.trackUrl;

    // Check if an action was clicked and get the action URL if available
    if (event.action && notificationData.actions) {
        actionItem = notificationData.actions.find(action => action.action === event.action) || actionItem;
        if (actionItem.action) {
            urlToOpen = actionItem.action;
        }
    }

    const trackingUrl = trackUrl + '&c=true' + `&a=${actionItem.action}`;

    // Send the tracking request
    if (trackUrl) {
        sendTrackingRequest(trackingUrl);
    }

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((windowClients) => {
            let matchingClient = null;

            for (let client of windowClients) {
                if (client.url === urlToOpen) {
                    matchingClient = client;
                    break;
                }
            }
            if (matchingClient) {
                return matchingClient.focus();
            } else if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        }).catch((error) => {
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

function sendTrackingRequest(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    });
}

self.addEventListener('fetch', (event) => {
    console.log('Fetch event for ', event.request.url);
});