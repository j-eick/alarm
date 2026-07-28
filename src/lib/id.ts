/** Erzeugt eine kollisionsarme ID für lokale Objekte (kein UUID-Dependency nötig). */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
