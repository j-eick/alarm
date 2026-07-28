/**
 * Zentrale Design-Schalter (Nomenklatur).
 *
 * Hier legst du fest, welche Design-Variante aktiv ist. So kannst du im Zuruf
 * sagen, wohin „zurückgerudert" werden soll (z.B. „tile/v1" oder „sheet/solid").
 * Siehe README → „Design-Varianten".
 */

/** Kachel-Design im Leerzustand. Varianten liegen in components/example-tile/variants/. */
export type TileVariant = 'v1-gradient-glow';
export const TILE_VARIANT: TileVariant = 'v1-gradient-glow';

/**
 * Stil des hochschiebenden Einstellungs-Screens (Alarm-Editor):
 *  - 'glass' → halbtransparent + Blur, Hintergrund scheint durch
 *  - 'solid' → deckende Fläche (Effekt aus)
 */
export type SheetStyle = 'glass' | 'solid';
export const SHEET_STYLE: SheetStyle = 'glass';
