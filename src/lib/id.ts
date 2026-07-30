/** Generates a low-collision ID for local objects (no UUID dependency needed). */
export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
