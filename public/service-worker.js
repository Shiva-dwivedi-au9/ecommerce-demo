self.addEventListener('push', function (event) {
    console.log("=======>push happening", event)
    // const data = event.data.json();
    const options = {
        body: "hello",
        icon: '',
        actions: ''
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
