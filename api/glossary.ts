import type { IncomingMessage, ServerResponse } from 'node:http';

import { getGlossaryTermsFromDatabase } from '../src/content-database';
import { handleJsonRequest } from '../src/vercel-api';

export default function handler(req: IncomingMessage, res: ServerResponse) {
  return handleJsonRequest(req, res, () => getGlossaryTermsFromDatabase());
}
