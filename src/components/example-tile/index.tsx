/**
 * Kachel-Auswahl: exportiert die aktive Design-Variante als `ExampleTile`.
 *
 * Neue Variante hinzufügen:
 *  1. Datei in variants/ anlegen (gleiche Props: ExampleTileProps).
 *  2. In VARIANTS registrieren.
 *  3. In constants/design.ts → TILE_VARIANT umschalten.
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
