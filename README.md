# Attune

> Codename: *alarm on drugs* · Expo (SDK 54) · React Native · TypeScript

**An alarm clock that wakes you the way you need right now.** Instead of one
generic ringtone, Attune plays a short, personal wake-up talk that is attuned to
your mood, focus, and goals — sometimes motivating, sometimes gentle, sometimes
short and dry. You pick a topic (or write your own text), a delivery tone, and a
voice; the app turns that into a spoken wake-up. Without any API keys it runs in
**mock mode** (pre-written texts + on-device text-to-speech), so the whole flow
is playable end-to-end out of the box.

---

## Core features (currently implemented)

- **Alarm list** — create, edit, enable/disable alarms; each card shows time,
  label, schedule, and content source at a glance.
- **Guided creation flow** — a stepper that starts with a choice of **Preset**
  or **AI**:
  - **Presets** — ready-made combinations (e.g. *Sanfter Start*, *Power-Motivation*,
    *Tagesfokus*, *Gute Laune*) that pre-fill the draft.
  - **AI, from a topic** — 5 topics (motivation, gratitude, day-focus,
    mindfulness, humor).
  - **AI, from your own text** — either read *verbatim* or *AI-amplified*
    (the model captures the emotion/semantics and reinforces them lightly).
  - **AI, from an external source** — paste a link or text; gated behind a
    one-time consent notice.
- **Tone & voice** — 7 delivery tones (gentle, cheerful, energetic, motivating,
  dramatic, dry, strict) and 3 voices, independent of the content.
- **Three-state weekday picker** — per day: *off*, *once this cycle* (small dot),
  or *every week* (filled). Drives one-shot vs. recurring scheduling.
- **Time picker & local scheduling** — recurring weekly notifications plus
  one-shot dates, with snooze.
- **Wake screen** — plays the generated talk (cloud audio or device TTS) when
  brought to the foreground.
- **Provider-agnostic AI layer** — pluggable text (Claude / mock) and TTS
  (ElevenLabs) providers, external-source ingestion, and a mock fallback that
  needs no keys.
- **Light/dark theming** and switchable design variants for fast visual
  iteration.

## Tooling

Beyond the standard Expo/React Native toolchain, this project uses a few
noteworthy tools:

- **Graphify** — builds a knowledge/code graph of the whole repo into
  `graphify-out/` (`graph.html`, `graph.json`, `GRAPH_REPORT.md`) for navigating
  and reasoning about the codebase. Refresh after changes with `graphify update .`
  (no API cost); the report notes the commit it was built from so you can spot a
  stale graph.
- **Dev component gallery** — a `/gallery` route (dev builds only) that renders
  real UI components in isolation, interactively, in light *and* dark at once.
- **Design-variant switcher** — named UI variants toggled from
  `src/constants/design.ts`, so a component's look can be swapped by short name.
- **React Compiler & typed routes** — enabled via Expo experiments for
  auto-memoization and type-safe navigation.

## Open to-dos

- Complete the 4-step stepper: on the AI path, add **generate draft + "reroll"**
  and **"preview"** (TTS) before saving.
- Wire the home-screen examples/presets to **pre-fill** the creation flow instead
  of opening an empty draft.
- ElevenLabs mapping: `voice → voiceId` and `tone → TTS params`, plus proper
  loading/error states for generation and preview.
- **Record your own voice** (expo-audio) as a third content mode — parked.
- Re-home the **delete-alarm** action (e.g. swipe-to-delete in the list) now that
  it has been removed from the editor sheet.
- Robust background system alarms with long custom audio — limited on iOS/Android
  by design; a later native dev-build effort.
- Decide whether the AI text is generated **once at creation** or **fresh each
  morning**.

## Version status

**Current app version: `v0.0.1` (pre-alpha).** This is the single canonical
version — it lives in `app.json` and is marked with a git tag. The app currently
runs only in the iOS simulator (Expo), has various bugs, and the core alarm loop
is not yet reliably testable, so it is deliberately below `0.1.0`.

Versioning follows **Semantic Versioning** (`MAJOR.MINOR.PATCH`):

- `0.0.x` — pre-alpha prototype iterations (where we are now).
- `0.1.0` — reserved for the first version where the **core loop actually works
  and is testable** (set alarm → it rings → wake-up talk plays).
- `1.0.0` — reserved for the first release considered ready for users.

**Minor** bumps add a capability, **patch** bumps are fixes; milestones are
marked with git tags (e.g. `v0.0.1`).

The table below tracks the maturity of individual areas. Maturity scale:
`planned → experimental → alpha → beta → stable`. The **Version** column is
optional — filled only when an area has reached a noteworthy milestone; it is a
documentation note, not a second release stream.

| Area                   | Status  | Version   |
| ---------------------- | ------- | --------- |
| Alarm-creation flow    | `alpha` | —         |
| General UI             | `alpha` | —         |
| Alarm ringing / wake   | `experimental` | — |
| Record your own voice  | `planned` | —       |

## Status report

- **No persistent backend** — data is kept on a session basis only.
- **No API integrations** are wired up in this state.
- There is **no backend beyond the session** at the moment.
