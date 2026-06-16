import type { IncomingMessage, ServerResponse } from 'http';

const jsonHeaders = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 's-maxage=300, stale-while-revalidate=3600',
};

export async function handleJsonRequest(
  req: IncomingMessage,
  res: ServerResponse,
  getBody: () => unknown | Promise<unknown>,
): Promise<void> {
  if (req.method && req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  try {
    sendJson(res, 200, await getBody());
  } catch (error) {
    console.error('Vercel API request failed', error);
    sendJson(res, 500, { error: getErrorMessage(error) });
  }
}

export function sendJson(res: ServerResponse, statusCode: number, body: unknown): void {
  res.writeHead(statusCode, jsonHeaders);
  res.end(JSON.stringify(body));
}

export function getQueryStringValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to load content data';
}
