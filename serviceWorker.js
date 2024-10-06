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

      registration.pushManager.getSubscription().then(async function(subscription) {
        const pushBtn = document.querySelector('#push');
        pushBtn.innerHTML = 'Loading...';

        if (subscription) {
          console.log('Already subscribed:', subscription);
          pushBtn.disabled = false;
          pushBtn.innerHTML = 'Push me!';
          return subscription; // already subscribed
        }

        try {
          const prompt = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: data.publicKey,
          });

          await fetch('/subscribe', {
            method: 'POST',
            body: JSON.stringify(prompt),
          });

          pushBtn.disabled = false;
          pushBtn.innerHTML = 'Push me!';
        } catch (error) {
          alert('You denied the prompt...😢');
        } 
      })
    });
}

self.addEventListener('install', () => {
	self.skipWaiting(); // Activate worker
});

self.addEventListener('push', function(event) {
	console.log('Push message received.');
	const notificationTitle = 'Hello 👋';
  let notificationOptions = {};

	if (event.data) {
		const dataText = event.data.text();
		notificationOptions.body = `Push data: '${dataText}'`;
	}

	event.waitUntil(
		self.registration.showNotification(
			notificationTitle,
			notificationOptions,
		),
	);
});

