import type { IncomingMessage, ServerResponse } from 'node:http';
import { handleHealthCheck } from './api/health.ts';
import { handleParentalConsent } from './api/parentalConsent.ts';
import { handleGetProgress, handlePostProgress } from './api/progress.ts';
import { handleGetBadges, handlePostBadge } from './api/badges.ts';
import { handleGetRoster, handleEnrollCadet } from './api/roster.ts';

function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk: Buffer | string) => {
      body += chunk;
      // Limit to 512KB to protect against DOS
      if (body.length > 512 * 1024) {
        req.destroy();
        reject(new Error('PAYLOAD_TOO_LARGE'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('MALFORMED_JSON'));
      }
    });
    req.on('error', (err: Error) => reject(err));
  });
}

function sendJson(res: ServerResponse, statusCode: number, data: unknown): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.statusCode = statusCode;
  res.end(JSON.stringify(data));
}

export async function dispatchApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const urlObj = new URL(req.url || '/', 'http://localhost');
  const pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
  const method = (req.method || 'GET').toUpperCase();

  // Only handle routes under /api
  if (!pathname.startsWith('/api')) {
    return false;
  }

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.statusCode = 204;
    res.end();
    return true;
  }

  try {
    // 1. Health check
    if (pathname === '/api/health' && method === 'GET') {
      const data = handleHealthCheck();
      sendJson(res, 200, data);
      return true;
    }

    // 2. Parental Consent
    if (pathname === '/api/parental-consent' && method === 'POST') {
      const body = await readJsonBody(req);
      const { status, data } = handleParentalConsent(body);
      sendJson(res, status, data);
      return true;
    }

    // 3. Progress
    if (pathname === '/api/progress') {
      if (method === 'GET') {
        const profileId = urlObj.searchParams.get('profileId');
        const { status, data } = handleGetProgress(profileId);
        sendJson(res, status, data);
        return true;
      }
      if (method === 'POST') {
        const body = await readJsonBody(req);
        const { status, data } = handlePostProgress(body);
        sendJson(res, status, data);
        return true;
      }
    }

    // 4. Badges
    if (pathname === '/api/badges') {
      if (method === 'GET') {
        const profileId = urlObj.searchParams.get('profileId');
        const { status, data } = handleGetBadges(profileId);
        sendJson(res, status, data);
        return true;
      }
      if (method === 'POST') {
        const body = await readJsonBody(req);
        const { status, data } = handlePostBadge(body);
        sendJson(res, status, data);
        return true;
      }
    }

    // 5. Roster
    if (pathname === '/api/roster') {
      if (method === 'GET') {
        const classCode = urlObj.searchParams.get('classCode');
        const { status, data } = handleGetRoster(classCode);
        sendJson(res, status, data);
        return true;
      }
    }

    if (pathname === '/api/roster/join' && method === 'POST') {
      const body = await readJsonBody(req);
      const { status, data } = handleEnrollCadet(body);
      sendJson(res, status, data);
      return true;
    }

    // Unknown API route
    sendJson(res, 404, {
      error: 'ENDPOINT_NOT_FOUND',
      message: `The API endpoint '${method} ${pathname}' does not exist.`
    });
    return true;
  } catch (err) {
    const error = err as Error;
    if (error.message === 'MALFORMED_JSON') {
      sendJson(res, 400, {
        error: 'MALFORMED_JSON',
        message: 'Request body contains malformed JSON syntax.'
      });
      return true;
    }
    if (error.message === 'PAYLOAD_TOO_LARGE') {
      sendJson(res, 413, {
        error: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload exceeded maximum size limit.'
      });
      return true;
    }

    // Never leak stack trace or internal error messages to client
    sendJson(res, 500, {
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.'
    });
    return true;
  }
}
