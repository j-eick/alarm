/**
 * Central design switches (nomenclature).
 *
 * This is where you set which design variant is active. That way you can
 * say in passing where to "roll back" to (e.g. "tile/v1" or "sheet/solid").
 * See README → "Design Variants".
 */

/** Tile design in the empty state. Variants live in components/example-tile/variants/. */
export type TileVariant = 'v1-gradient-glow';
export const TILE_VARIANT: TileVariant = 'v1-gradient-glow';

/**
 * Style of the sliding-up settings screen (alarm editor):
 *  - 'glass' → semi-transparent + blur, background shows through
 *  - 'solid' → opaque surface (effect off)
 */
export type SheetStyle = 'glass' | 'solid';
export const SHEET_STYLE: SheetStyle = 'glass';
