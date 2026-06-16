import type { IncomingMessage, ServerResponse } from 'http';

import { getHeroesFromDatabase } from '../src/content-database';
import { handleJsonRequest } from '../src/vercel-api';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  console.log("api heroes hit", req)
  console.log("api ServerResponse", res)
  return handleJsonRequest(req, res, () => getHeroesFromDatabase());
}
