# Alarm on Drugs

KI-gestützte, personalisierbare Wecker-App (Expo / React Native, TypeScript).
Der Wecker erfasst Stimmung/Kontext und generiert daraus einen persönlichen
Weck-Talk (Claude) + optional einen per Cloud-TTS erzeugten Weckton. Ohne
API-Keys läuft alles im Mock-Modus (vordefinierte Texte + Geräte-TTS).

## Start

```bash
npm install
npx expo start
```

App in **Expo Go** (echtes Handy) öffnen. Optional Keys setzen: `.env.example`
nach `.env` kopieren und ausfüllen.

## Architektur (Kurzüberblick)

Klare Schichtentrennung — UI kennt keine API-/Storage-Details:

- `src/app/` — Screens (expo-router): Liste, Editor `alarm/[id]`, Weck-Screen `ring`.
- `src/components/` — präsentationale UI (AlarmCard, Picker, Button, Chip).
- `src/hooks/use-alarms.ts` — Domänen-Store: einzige UI-Schnittstelle zu Alarmen.
- `src/lib/` — Services:
  - `storage.ts` (AsyncStorage), `scheduler.ts` + `notifications.ts` (expo-notifications),
    `audio.ts` (expo-audio + expo-speech), `time.ts`/`id.ts` (reine Utils).
  - `ai/` — **provider-agnostische KI-Schicht**: Interfaces (`providers/types.ts`),
    Anbieter (Claude, Mock, ElevenLabs-TTS), Content-Type-**Registry**
    (`content-types.ts`), Orchestrator (`index.ts`), Konfiguration (`config.ts`).
- `src/types.ts` — zentrale Datenmodelle.

### Erweitern

- **Neuer Weck-Inhaltstyp:** Eintrag in `src/lib/ai/content-types.ts` + `ContentTypeId`
  in `src/types.ts`. UI-Picker aktualisiert sich automatisch.
- **Neuer KI-Anbieter:** neue Datei unter `src/lib/ai/providers/`, die `TextProvider`
  bzw. `TtsProvider` implementiert; im Orchestrator einhängen.

## Design-Varianten (Nomenklatur)

Manche UI-Elemente haben **mehrere Designs**, die sich schnell umschalten lassen.
Zentrale Schalter: [src/constants/design.ts](src/constants/design.ts). Im Gespräch
kann man ein Design per Kurzname ansteuern (z.B. „zurück auf `tile/v1`" oder
„nimm `sheet/solid`").

- **`tile/*` — Kacheln im Leerzustand** (Beispiel-Wecktöne)
  - `v1-gradient-glow` *(aktiv)* — dezenter Farbverlauf + weiche Kreis-Artefakte, Vektor-Icon.
  - Varianten liegen in [src/components/example-tile/variants/](src/components/example-tile/variants/);
    aktive Variante via `TILE_VARIANT`. Neue Variante = Datei anlegen (gleiche Props
    `ExampleTileProps`) + in [example-tile/index.tsx](src/components/example-tile/index.tsx)
    registrieren + `TILE_VARIANT` umschalten.
- **`sheet/*` — hochschiebender Einstellungs-Screen** (Alarm-Editor, [sheet-surface.tsx](src/components/sheet-surface.tsx))
  - `glass` *(aktiv)* — halbtransparent + Blur, Hintergrund scheint durch.
  - `solid` — deckende Fläche (Effekt aus). Umschalten via `SHEET_STYLE`.

> Neue umschaltbare Designs nach demselben Muster ergänzen: benannte Variante +
> zentraler Schalter in `constants/design.ts` + hier dokumentieren.

## Bekannte Einschränkung

Zuverlässige Hintergrund-Alarme mit langem Custom-Audio sind auf iOS/Android
systembedingt limitiert. Prototyp: Wecken via lokale Notification; der Talk
wird beim Antippen/Vordergrund abgespielt. Robuste System-Wecker = späterer
nativer Ausbau (Dev Build).
