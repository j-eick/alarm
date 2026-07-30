# Alarm Creation — Integration Checklist

Rework the alarm editor into the 4-step flow: **Source → Draft → Tone → Schedule**.
Prototype: [alarm-creation-flow.html](./alarm-creation-flow.html). Current editor: [`src/app/alarm/[id].tsx`](../src/app/alarm/%5Bid%5D.tsx).

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[?]` blocked on a decision.

> **Don't confuse the two sets of three:**
> - **WAKE_EXAMPLES** ([showcase.ts](../src/constants/showcase.ts)) — The Rock / Elsa Sings / Your Day — home screen, illustrative. **Keeper**, meant to pre-fill the create flow.
> - **CONTENT_TYPES** ([content-types.ts](../src/lib/ai/content-types.ts)) — Motivational Talk / Affirmation / Daily Focus — editor only. **Being removed** (clean cut).

---

## 0 · Decisions — RESOLVED

- [x] **Tone list** — final 7: `Gentle · Cheerful · Energetic · Motivating · Dramatic · Dry · Strict`.
- [x] **Retire mood + content-type** — yes, clean cut: `context.mood` + `contentType` out, new model `topic + tone`.
- [x] **Dictation** — native **keyboard mic** on `TextInput` (no dev build, stays in Expo Go). No in-app recording button. Test on a **real device via Expo Go** (the iOS simulator doesn't show a dictation key).

---

## 1 · Data model — [`src/types.ts`](../src/types.ts) ✅ (commit `fda9e8c`)

- [x] Extend `Alarm`: `source: 'own' | 'ai'`, `text: string`, `topic?: TopicId`, `tone: ToneId`, `voice: VoiceId`.
- [x] Remove `context.mood` / `contentType` (`context.note` dropped entirely — clean cut).
- [x] `createAlarmDraft()` defaults for the new fields — [`src/lib/alarm-factory.ts`](../src/lib/alarm-factory.ts).
- [x] Storage back-compat: `normalizeAlarm()` reads old alarms tolerantly — [`src/lib/storage.ts`](../src/lib/storage.ts).

## 2 · Content constants (new registries) ✅

- [x] `src/constants/tones.ts` — `ToneId`, labels, `promptHint` per tone (the 7 from §0).
- [x] `src/constants/topics.ts` — `TopicId`, labels for the "surprise me" picker.
- [x] `src/constants/voices.ts` — `VoiceId` (3 voices).
- [x] `moods.ts` + `content-types.ts` + picker removed.

## 3 · AI layer — [`src/lib/ai/`](../src/lib/ai/)

- [x] Topic → text generation — new [`prompt.ts`](../src/lib/ai/prompt.ts) replaces `content-types.ts`.
- [x] **Tone** flows into the system prompt (`buildSystemPrompt(tone)`).
- [ ] Voice **preview**: wire up `elevenlabs-tts` (voice→voiceId) so step 3 plays — [`providers/elevenlabs-tts.ts`](../src/lib/ai/providers/elevenlabs-tts.ts). → moved to §6.

## 4 · UI flow (editor sheet)

> **Interim landed** (commit `fda9e8c`): single sheet with source → text/topic → tone → voice, own text via system keyboard dictation. The real **4-step stepper** is still pending.

- [~] **Step 1 · Source** — source picker (as chips in the sheet, not yet its own step).
- [~] **Step 2a · Draft (own)** — `TextInput` with keyboard dictation ✔; without a stepper.
- [ ] **Step 2b · Draft (ai)** — topic chips ✔, but **AI draft + "re-roll"** still missing.
- [~] **Step 3 · Tone & Voice** — tone + voice chips ✔; "Preview" missing.
- [ ] **Step 4 · Schedule** — time + `WeekdayPicker` (already present in the sheet).
- [ ] Real step state + navigation (step 2 branches by source); keep the drag-to-dismiss sheet.

## 5 · Home screen / examples — [`index.tsx`](../src/app/index.tsx)

- [ ] **WAKE_EXAMPLES pre-fill the create flow** instead of the empty `goCreate()` (voice/tone/topic as params).
- [ ] Tiles visibly carry their facets (voice + tone + topic), so the "ingredients" are readable.
- [ ] Keep the empty state as a range showcase; keep the compact "SUGGESTIONS" row when alarms exist.

## 6 · Polish & verification

- [ ] New tone chips / flow steps into the dev gallery — [`src/app/(dev)/gallery.tsx`](../src/app/(dev)/gallery.tsx).
- [ ] Loading + error states for generation and TTS.
- [ ] `npx tsc --noEmit` clean; run through the whole flow on a real device (dictation!) + simulator.

---

**Suggested order:** `1 → 2 → 3 → 5 → 4 → 6`. Model/constants/AI (1–3) and the home-screen wiring (5) can land before the UI rework (4).
