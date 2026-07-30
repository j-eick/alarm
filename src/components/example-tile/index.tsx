/**
 * Tile selection: exports the active design variant as `ExampleTile`.
 *
 * Adding a new variant:
 *  1. Create a file in variants/ (same props: ExampleTileProps).
 *  2. Register it in VARIANTS.
 *  3. Switch it on in constants/design.ts → TILE_VARIANT.
 */

import type { ComponentType } from 'react';

import { TILE_VARIANT, type TileVariant } from '@/constants/design';
import type { ExampleTileProps } from './types';
import { GradientGlowTile } from './variants/gradient-glow';

const VARIANTS: Record<TileVariant, ComponentType<ExampleTileProps>> = {
  'v1-gradient-glow': GradientGlowTile,
};

export const ExampleTile = VARIANTS[TILE_VARIANT];
export type { ExampleTileProps };
