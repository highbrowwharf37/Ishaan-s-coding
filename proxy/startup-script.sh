#!/bin/bash
# GCP VM startup script — installs Node.js and runs the NBA proxy

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

npm install -g pm2

mkdir -p /opt/nba-proxy
cat > /opt/nba-proxy/server.js << 'PROXYEOF'
const http = require('http');
const https = require('https');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  if (!req.url.startsWith('/sportradar/')) {
    res.writeHead(404);
    return res.end('Not found');
  }

  const target = 'https://api.sportradar.com' + req.url.replace('/sportradar', '');
  console.log('→ ' + target);

  https.get(target, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (upstream) => {
    res.writeHead(upstream.statusCode, { 'Content-Type': 'application/json' });
    upstream.pipe(res);
  }).on('error', (err) => {
    res.writeHead(502);
    res.end(JSON.stringify({ error: err.message }));
  });
});

server.listen(PORT, '0.0.0.0', () => console.log('NBA proxy running on :' + PORT));
PROXYEOF

cd /opt/nba-proxy
pm2 start server.js --name nba-proxy
pm2 startup systemd -u root --hp /root
pm2 save
