/**
 * Text provider: Anthropic Claude.
 *
 * Deliberately via `fetch` (instead of @anthropic-ai/sdk): the official SDK
 * pulls in Node-oriented dependencies that are unreliable in the
 * React Native/Hermes bundle (Metro). A single non-streaming Messages call
 * is robust via fetch and bundles cleanly. The provider boundary makes a
 * later switch to the SDK or a backend proxy trivial.
 *
 * API reference: POST /v1/messages, model "claude-opus-4-8".
 */

import { aiConfig } from '@/lib/ai/config';
import type { TextProvider, TextRequest } from '@/lib/ai/providers/types';

interface AnthropicResponse {
  content?: { type: string; text?: string }[];
  stop_reason?: string;
}

export const claudeTextProvider: TextProvider = {
  id: 'claude',

  async generate(req: TextRequest): Promise<string> {
    const res = await fetch(aiConfig.anthropic.baseUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': aiConfig.anthropic.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: aiConfig.anthropic.model,
        max_tokens: req.maxTokens,
        system: req.systemPrompt,
        messages: [{ role: 'user', content: req.userPrompt }],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      throw new Error(`Anthropic ${res.status}: ${detail.slice(0, 200)}`);
    }

    const data = (await res.json()) as AnthropicResponse;
    const text = data.content
      ?.filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('')
      .trim();

    if (!text) {
      throw new Error('Anthropic response contained no text.');
    }
    return text;
  },
};
