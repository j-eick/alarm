/**
 * Externe Quelle einlesen (für `aiBasis: 'source'`).
 *
 * Nimmt entweder direkt eingefügten Text oder eine URL. Bei einer URL wird der
 * Inhalt geladen und grob zu Lesetext reduziert (HTML-Tags/Skripte raus). Reine
 * Best-Effort-Extraktion — JS-gerenderte oder Paywall-Seiten liefern ggf. wenig.
 *
 * ⚠️ Rechtliches liegt beim Nutzer (siehe Consent-Hinweis in der UI): ob eine
 * Quelle für diesen Zweck verwendet werden darf, prüft der Nutzer selbst.
 */

const MAX_CHARS = 4000;
const MIN_USABLE = 40;

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/** Grobe HTML→Text-Reduktion ohne DOM (RN hat keinen Parser). */
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
 * Liefert den nutzbaren Quelltext (gekürzt). Wirft mit verständlicher Meldung,
 * wenn nichts Brauchbares gelesen werden konnte.
 */
export async function ingestSource(input: string): Promise<string> {
  const value = input.trim();
  if (!value) throw new Error('Bitte einen Text oder Link angeben.');

  // Direkt eingefügter Text → einfach nutzen.
  if (!looksLikeUrl(value)) {
    return value.slice(0, MAX_CHARS);
  }

  let html: string;
  try {
    const res = await fetch(value, { headers: { Accept: 'text/html,text/plain' } });
    if (!res.ok) throw new Error(`Quelle nicht erreichbar (${res.status}).`);
    html = await res.text();
  } catch (err) {
    if (err instanceof Error && /erreichbar/.test(err.message)) throw err;
    throw new Error('Der Link konnte nicht geladen werden. Prüfe die Adresse und deine Verbindung.');
  }

  const text = stripHtml(html).slice(0, MAX_CHARS);
  if (text.length < MIN_USABLE) {
    throw new Error('Aus dieser Quelle ließ sich kein Text lesen (evtl. Login/JavaScript nötig).');
  }
  return text;
}
