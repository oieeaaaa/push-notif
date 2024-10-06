const http = require('http');
const fs = require('fs');
const webpush = require('web-push');
const sqlite = require('node:sqlite');

const data = require('./data.json');

const hostname = '127.0.0.1';
const port = 3000;

// ====== Initialize database ======
const db = new sqlite.DatabaseSync('./push.db');

const initDb = async () => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      id INTEGER PRIMARY KEY,
      endpoint TEXT NOT NULL,
      auth TEXT NOT NULL,
      p256dh TEXT NOT NULL,
      expirationTime TEXT
    );
  `);
}

initDb();

// ====== Save the vapid keys to a file ======
// const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:joimee.cajandab@gmail.com',
  data.publicKey,
  data.privateKey
);

// ====== Server ======
const server = http.createServer((req, res) => {
    console.log({ db })

    console.log("request received");
    console.log(req.headers.referer);

    // ====== ROUTES ======
    if (req.url === '/subscribe' && req.method === 'POST') {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });
    
      req.on('end', async () => {
        const subscription = JSON.parse(body);
        const stmt = await db.prepare(`
          INSERT INTO push_subscriptions (endpoint, auth, p256dh, expirationTime)
          VALUES (?, ?, ?, ?);
        `);
        await stmt.run(
          subscription.endpoint,
          subscription.keys.auth,
          subscription.keys.p256dh,
          subscription.expirationTime
        );
        res.end();
      });
    }

    if (req.url === '/push' && req.method === 'POST') {
      // get the last subscription - typically will be based on the user agent
      const stmt = db.prepare(`
        SELECT * FROM push_subscriptions ORDER BY id DESC LIMIT 1;
      `);
      const subscription = stmt.get();

      // send it!
      webpush.sendNotification({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          auth: subscription.auth,
          p256dh: subscription.p256dh
        }
      }, 'This message is from the server! 🔥')

      res.end();
    }
    // ====== END OF ROUTES ======

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

