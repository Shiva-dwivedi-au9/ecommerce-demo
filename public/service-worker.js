self.addEventListener('push', function (event) {
    console.log("=======>push happening", event)
    // const data = event.data.json();
    const options = {
        body: "hello",
        icon: '',
        actions: [
            {
                action: 'view',
                title: 'View',
                icon: 'path/to/icon.png'
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
                icon: 'path/to/icon.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification("hi", options)
    );
});
