/**
 * Text provider: mock.
 *
 * Returns the deterministic fallback text (prebuilt from the content-type
 * registry). Serves as the default without an API key and as the error
 * path when Claude is unreachable.
 */

import type { TextProvider, TextRequest } from '@/lib/ai/providers/types';

export const mockTextProvider: TextProvider = {
  id: 'mock',

  async generate(req: TextRequest): Promise<string> {
    // Small artificial latency so the flow feels realistic.
    await new Promise((r) => setTimeout(r, 150));
    return req.fallbackText;
  },
};
