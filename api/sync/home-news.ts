import type { IncomingMessage, ServerResponse } from 'http';

import { syncHomeNews } from '../../src/home-news-sync.js';
import { sendJson } from '../../src/vercel-api.js';

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method && req.method !== 'GET' && req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  if (!isAuthorizedSyncRequest(req)) {
    sendJson(res, 401, { error: 'Missing sync authorization' });
    return;
  }

  try {
    sendJson(res, 200, await syncHomeNews());
  } catch (error) {
    console.error('Home news sync failed', error);
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : 'Failed to sync home news',
    });
  }
}

function isAuthorizedSyncRequest(req: IncomingMessage): boolean {
  if (req.headers['x-vercel-cron'] === '1') {
    return true;
  }

  const syncSecret = process.env['SYNC_SECRET'];

  if (!syncSecret) {
    return isLocalRequest(req);
  }

  return req.headers.authorization === `Bearer ${syncSecret}`;
}

function isLocalRequest(req: IncomingMessage): boolean {
  const host = req.headers.host ?? '';

  return host.startsWith('localhost') || host.startsWith('127.0.0.1');
}
