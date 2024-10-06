'use strict';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/serviceWorker.js')
    .then(function(registration) {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch(function(error) {
      console.log('Service Worker registration failed:', error);
    });

  navigator.serviceWorker.ready
    .then(async function(registration) {
      console.log('Service Worker ready:', registration);

      const data = await fetch('/data.json').then(res => res.json());

      registration.pushManager.getSubscription().then(function(subscription) {
        if (subscription) {
          console.log('Already subscribed:', subscription);
          return subscription; // already subscribed
        }

        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: data.publicKey,
        });
      })
    });
}

self.addEventListener('install', () => {
	self.skipWaiting(); // Activate worker
});

self.addEventListener('push', function(event) {
	console.log('Push message received.');
	let notificationTitle = 'Hello';

  // default options
	const notificationOptions = {
		body: 'Thanks for sending this push msg.',
		data: {
			url: 'https://web.dev/push-notifications-overview/',
		},
	};

	if (event.data) {
		const dataText = event.data.text();
		notificationTitle = 'Received Payload';
		notificationOptions.body = `Push data: '${dataText}'`;
	}

	event.waitUntil(
		self.registration.showNotification(
			notificationTitle,
			notificationOptions,
		),
	);
});

