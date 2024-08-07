function sendTrackingRequest(url) {
    fetch(url, {
        method: 'GET',
        headers: {
            mode: 'no-cors'
        }
    }).then(response => {
    }).catch(error => {
    });
}

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
        if (actionItem.url) {
            urlToOpen = actionItem.url;
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
            } else {
                return clients.openWindow(urlToOpen);
            }
        }).catch((error) => {
            console.error('Error during notification click handling:', error);
            return clients.openWindow(urlToOpen);
        })
    );
});










// // messaging.onBackgroundMessage((payload) => {
// //     console.log('======>Received background message:', payload);

// //     const trackUrl = payload.data.track_url;
// //     if (trackUrl) {
// //         const url = trackUrl + '&i=true'
// //         sendTrackingRequest(url);
// //     }

// //     const notificationTitle = payload.notification.title;
// //     const notificationOptions = {
// //         // body: payload.notification.body,
// //         // icon: payload.notification.icon,
// //         // badge: payload.notification.badge,
// //         // image: payload.notification.image,
// //         data: {
// //             url: payload.data.url,
// //             notification_id: payload.data.notification_id,
// //             actions: payload.notification.actions,
// //             track_url: payload.data.track_url
// //         },
// //         // actions: payload.notification.actions ? payload.notification.actions.map(action => ({
// //         //     action: action.action,
// //         //     title: action.title,
// //         //     icon: action.icon,
// //         // })) : []

// //     };
// //     console.log("========>notification options", notificationOptions)
// //     self.registration.showNotification(notificationTitle, notificationOptions);

// //     // Handle auto-close
// //     if (payload.data.autoClose) {
// //         setTimeout(() => {
// //             self.registration.getNotifications({ tag: payload.data.notification_id }).then(notifications => {
// //                 notifications.forEach(notification => notification.close());
// //             });
// //         }, 8000); // Auto dismiss after 8 seconds
// //     }
// // });

// // // Listen for notification click events
// // self.addEventListener('notificationclick', function (event) {

// //     event.notification.close();

// //     const action = event.action;

// //     const trackUrl = event.notification.data.track_url;

// //     const url = trackUrl + '&c=true' + '&b=default'
// //     // Make the tracking request
// //     if (trackUrl) {
// //         sendTrackingRequest(url);
// //     }

// //     // Handle action clicks
// //     if (action) {
// //         const actionItem = event.notification.actions.find(item => item.action === action);
// //         if (actionItem && actionItem.action) {
// //             const url = trackUrl + '&c=true' + `&b=${actionItem.action}`
// //             // Make the tracking request
// //             if (trackUrl) {
// //                 sendTrackingRequest(url);
// //             }
// //             clients.openWindow(actionItem.action);
// //         }
// //     } else {
// //         // Default click action
// //         clients.openWindow(notificationData.url);
// //     }
// // });

// // // Listen for notification close events
// // self.addEventListener('notificationclose', function (event) {
// //     // Optional: Handle notification close event if needed
// // });


