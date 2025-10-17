const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

const port = process.env.PORT || 5000;
const buildDir = path.join(__dirname, 'build');

function safeJoin(base, target) {
  const targetPath = '.' + path.normalize('/' + target);
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  const rawUrl = decodeURIComponent(req.url.split('?')[0]);

  // If the request explicitly starts with /build/, map it to build/<rest>
  if (rawUrl.startsWith('/build/')) {
    const rel = rawUrl.replace(/^\/build\//, '');
    const filePath = safeJoin(buildDir, rel);
    return serveFile(filePath, res);
  }

  // Try to serve the requested path from build/ (so /assets/... and /luxury.mp4 work)
  const rel = rawUrl.replace(/^\//, '');
  const candidate = rel === '' ? 'index.html' : rel;
  const filePath = safeJoin(buildDir, candidate);

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) return serveFile(filePath, res);
    // SPA fallback to index.html
    const indexPath = path.join(buildDir, 'index.html');
    return serveFile(indexPath, res);
  });
});

function serveFile(filePath, res) {
  // ensure the resolved path is inside buildDir
  if (!filePath.startsWith(buildDir)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = mime[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'public, max-age=0');
    res.end(data);
  });
}

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Preview server running at http://localhost:${port} (serving ${buildDir})`);
});
