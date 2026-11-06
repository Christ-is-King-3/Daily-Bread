// Small dependency-free static server for concurrent browser smoke tests.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
http.createServer((req, res) => {
  let file;
  try {
    const name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    file = path.resolve(root, '.' + name + (name.endsWith('/') ? 'index.html' : ''));
    if (!file.startsWith(root + path.sep)) throw Error('Outside site');
  } catch (_) { res.writeHead(400).end(); return; }
  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length':stat.size});
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  });
}).listen(Number(process.env.PORT || 8000), '127.0.0.1');
