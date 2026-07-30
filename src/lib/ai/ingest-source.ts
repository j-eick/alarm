/**
 * Reads an external source (for `aiBasis: 'source'`).
 *
 * Accepts either directly pasted text or a URL. For a URL, the content is
 * fetched and roughly reduced to reading text (HTML tags/scripts stripped).
 * Pure best-effort extraction — JS-rendered or paywalled pages may yield little.
 *
 * ⚠️ Legal responsibility lies with the user (see the consent notice in the
 * UI): whether a source may be used for this purpose is for the user to check.
 */

const MAX_CHARS = 4000;
const MIN_USABLE = 40;

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** Rough HTML→text reduction without a DOM (RN has no parser). */
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Returns the usable source text (truncated). Throws with an understandable
 * message when nothing usable could be read.
 */
export async function ingestSource(input: string): Promise<string> {
  const value = input.trim();
  if (!value) throw new Error('Please provide a text or link.');

  // Directly pasted text → just use it.
  if (!looksLikeUrl(value)) {
    return value.slice(0, MAX_CHARS);
  }

  let html: string;
  try {
    const res = await fetch(value, { headers: { Accept: 'text/html,text/plain' } });
    if (!res.ok) throw new Error(`Source unreachable (${res.status}).`);
    html = await res.text();
  } catch (err) {
    if (err instanceof Error && /unreachable/.test(err.message)) throw err;
    throw new Error('Could not load the link. Check the address and your connection.');
  }

  const text = stripHtml(html).slice(0, MAX_CHARS);
  if (text.length < MIN_USABLE) {
    throw new Error('No text could be read from this source (login/JavaScript may be required).');
  }
  return text;
}
