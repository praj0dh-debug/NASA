import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { dispatchApiRequest } from './apiRouter';

const PORT = parseInt(process.env.PORT || '3000', 10);
const DIST_DIR = path.resolve(process.cwd(), 'dist');

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (req: http.IncomingMessage, res: http.ServerResponse) => {
  // 1. Dispatch API routes
  const isApiHandled = await dispatchApiRequest(req, res);
  if (isApiHandled) return;

  // 2. Static file serving in production
  if (fs.existsSync(DIST_DIR)) {
    const urlPath = req.url?.split('?')[0] || '/';
    let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    try {
      const content = fs.readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': contentType,
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY'
      });
      res.end(content);
      return;
    } catch {
      // Fall through to 404
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`[Junior Astronaut Production Server] running on http://localhost:${PORT}`);
});

export default server;
