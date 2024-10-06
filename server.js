const http = require('http');
const fs = require('fs');
const webpush = require('web-push');
const data = require('./data.json');

const hostname = '127.0.0.1';
const port = 3000;

// const vapidKeys = webpush.generateVAPIDKeys();

webpush.setVapidDetails(
  'mailto:joimee.cajandab@gmail.com',
  data.publicKey,
  data.privateKey
);

const server = http.createServer((req, res) => {
    console.log("request received");
    console.log(req.headers.referer);

    // post http request with /push url
    if (req.url === '/push' && req.method === 'POST') {
      // typically the data subscription is stored in a database
      webpush.sendNotification(data.pushSubscription, 'This message is from the server! 🔥')

      res.end();
    }

    // if url ends with javascript file, set content type to application/javascript
    if (req.url.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }

    // if url ends with css file, set content type to text/css
    if (req.url.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    }

    // if json
    if (req.url.endsWith('data.json')) {
      res.setHeader('Content-Type', 'application/json');
    }

    fs.readFile('./' + req.url, function (error, data) {
        res.end(data);
    });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
