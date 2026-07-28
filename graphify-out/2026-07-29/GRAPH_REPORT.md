# Graph Report - alarmOnDrugs  (2026-07-28)

## Corpus Check
- 54 files · ~59,261 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 346 nodes · 612 edges · 47 communities (17 shown, 30 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83556627`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [id].tsx
- src/types.ts
- expo
- Provider-agnostic AI Layer (src/lib/ai)
- ring.tsx
- index.ts
- package.json
- use-alarms.ts
- include
- expo-web-browser
- dependencies
- reset-project.js
- Android Adaptive Icon Foreground (light-blue chevron)
- Explore Tab Icon
- Expo 'Powered by' Badge (Black Pill)
- React Logo (@2x)
- Switchable Design Variants (constants/design.ts)
- css.d.ts
- expo
- expo-audio
- expo-blur
- expo-file-system
- expo-font
- expo-linear-gradient
- expo-linking
- expo-notifications
- expo-router
- expo-speech
- expo-splash-screen
- expo-status-bar
- expo-symbols
- expo-system-ui
- @expo/vector-icons
- react
- react-dom
- react-native
- @react-native-async-storage/async-storage
- @react-native-community/datetimepicker
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- react-native-web
- react-native-worklets
- Logo Glow (Blue Radial Glow)
- Splash Icon

## God Nodes (most connected - your core abstractions)
1. `useTheme()` - 23 edges
2. `Spacing` - 14 edges
3. `expo` - 13 edges
4. `useAlarms()` - 13 edges
5. `ThemedText()` - 12 edges
6. `Alarm` - 10 edges
7. `AlarmEditorScreen()` - 9 edges
8. `RingScreen()` - 8 edges
9. `generateWakeContent()` - 8 edges
10. `scripts` - 7 edges

## Surprising Connections (you probably didn't know these)
- `Alarm on Drugs App` --references--> `Expo SDK 54`  [INFERRED]
  README.md → AGENTS.md
- `CLAUDE.md includes AGENTS.md` --references--> `Expo SDK 54`  [EXTRACTED]
  CLAUDE.md → AGENTS.md
- `Expo Chevron/Caret Symbol (white)` --semantically_similar_to--> `App Icon (blueprint chevron)`  [INFERRED] [semantically similar]
  assets/expo.icon/Assets/expo-symbol 2.svg → assets/images/icon.png
- `Web Favicon (chevron)` --semantically_similar_to--> `App Icon (blueprint chevron)`  [INFERRED] [semantically similar]
  assets/images/favicon.png → assets/images/icon.png
- `Explore Tab Icon (@2x)` --semantically_similar_to--> `Explore Tab Icon`  [INFERRED] [semantically similar]
  assets/images/tabIcons/explore@2x.png → assets/images/tabIcons/explore.png

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Provider-agnostic AI pipeline** — readme_ai_layer, readme_ai_orchestrator, readme_text_provider_interface, readme_content_type_registry, readme_claude_provider [EXTRACTED 0.85]
- **Layered architecture separation** — readme_src_app, readme_src_components, readme_use_alarms_store, readme_src_lib_services [EXTRACTED 0.85]
- **Switchable design variant system** — readme_design_variants, readme_tile_variants, readme_sheet_variants [EXTRACTED 0.80]
- **Android Adaptive Icon Layer Set** — assets_images_android_icon_background_blue_layer, assets_images_android_icon_foreground_chevron_layer, assets_images_android_icon_monochrome_chevron_layer [INFERRED 0.95]
- **Chevron/Caret Branding Marks** — assets_images_icon_appicon, assets_images_favicon_web_favicon, assets_images_android_icon_foreground_chevron_layer, assets_expo_icon_assets_expo_symbol_2_svg_chevron_symbol [INFERRED 0.85]
- **React Logo Density Variants (1x/2x/3x)** — assets_images_react_logo_reactlogo, assets_images_react_logo_2x_reactlogo, assets_images_react_logo_3x_reactlogo [INFERRED 0.95]
- **Expo Branding Assets (Badges + Logo)** — assets_images_expo_badge_white_expobadgewhite, assets_images_expo_badge_expobadge, assets_images_expo_logo_expologo [INFERRED 0.85]
- **App Tab Bar Icon Set (Home + Explore)** — assets_images_tabicons_home_hometabicon, assets_images_tabicons_explore_exploretabicon [INFERRED 0.85]

## Communities (47 total, 30 thin omitted)

### Community 0 - "[id].tsx"
Cohesion: 0.08
Nodes (41): AnimatedPressable, SPRING, styles, styles, AppHeader(), styles, Chip(), ChipProps (+33 more)

### Community 1 - "src/types.ts"
Cohesion: 0.12
Nodes (26): AlarmCard(), styles, weekdaysSummary(), ContentTypePicker(), ContentTypePickerProps, styles, MoodPicker(), MoodPickerProps (+18 more)

### Community 2 - "expo"
Cohesion: 0.08
Nodes (23): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, reactCompiler, typedRoutes (+15 more)

### Community 3 - "Provider-agnostic AI Layer (src/lib/ai)"
Cohesion: 0.11
Nodes (21): Expo Go 54, Expo SDK 54, Expo SDK 54 Versioned Docs, CLAUDE.md includes AGENTS.md, Provider-agnostic AI Layer (src/lib/ai), AI Orchestrator (ai/index.ts), Alarm on Drugs App, Background Alarm Limitation (iOS/Android) (+13 more)

### Community 4 - "ring.tsx"
Cohesion: 0.13
Nodes (22): plugins, expo-audio, expo-font, expo-router, expo-web-browser, @react-native-community/datetimepicker, RootLayout(), RingScreen() (+14 more)

### Community 5 - "index.ts"
Cohesion: 0.22
Nodes (11): aiConfig, hasTextKey(), hasTtsKey(), generateWakeContent(), AnthropicResponse, claudeTextProvider, elevenLabsTtsProvider, mockTextProvider (+3 more)

### Community 6 - "package.json"
Cohesion: 0.12
Nodes (16): devDependencies, @types/react, typescript, main, name, private, scripts, android (+8 more)

### Community 7 - "use-alarms.ts"
Cohesion: 0.13
Nodes (24): AlarmEditorScreen(), AlarmListScreen(), AlarmCardProps, AlarmState, byTime(), deleteAlarm(), getById(), init() (+16 more)

### Community 8 - "include"
Cohesion: 0.15
Nodes (12): ./assets/*, expo-env.d.ts, expo/tsconfig.base, .expo/types/**/*.ts, **/*.ts, **/*.tsx, compilerOptions, paths (+4 more)

### Community 10 - "dependencies"
Cohesion: 0.22
Nodes (9): date-fns, expo-constants, expo-device, expo-image, dependencies, date-fns, expo-constants, expo-device (+1 more)

### Community 11 - "reset-project.js"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 12 - "Android Adaptive Icon Foreground (light-blue chevron)"
Cohesion: 0.29
Nodes (7): Expo Chevron/Caret Symbol (white), Icon Construction Grid Guide, Android Adaptive Icon Background (blue), Android Adaptive Icon Foreground (light-blue chevron), Android Adaptive Icon Monochrome (gray chevron), Web Favicon (chevron), App Icon (blueprint chevron)

### Community 13 - "Explore Tab Icon"
Cohesion: 0.29
Nodes (7): Explore Tab Icon (@2x), Explore Tab Icon (@3x), Explore Tab Icon, Home Tab Icon (@2x), Home Tab Icon (@3x), Home Tab Icon, Expo Starter Web Tutorial Screenshot

### Community 14 - "Expo 'Powered by' Badge (Black Pill)"
Cohesion: 1.00
Nodes (3): Expo 'Powered by' Badge (Black Pill), Expo 'Powered by' Badge (White/Transparent), Expo Logo (White)

### Community 15 - "React Logo (@2x)"
Cohesion: 1.00
Nodes (3): React Logo (@2x), React Logo (@3x), React Logo (1x)

### Community 16 - "Switchable Design Variants (constants/design.ts)"
Cohesion: 1.00
Nodes (3): Switchable Design Variants (constants/design.ts), Sheet Variants (sheet-surface.tsx), Tile Variants (example-tile)

## Ambiguous Edges - Review These
- `Explore Tab Icon` → `Expo Starter Web Tutorial Screenshot`  [AMBIGUOUS]
  assets/images/tutorial-web.png · relation: references

## Knowledge Gaps
- **126 isolated node(s):** `name`, `slug`, `version`, `orientation`, `icon` (+121 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Explore Tab Icon` and `Expo Starter Web Tutorial Screenshot`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `plugins` connect `ring.tsx` to `expo`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `expo` connect `expo` to `ring.tsx`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `expo-router` connect `ring.tsx` to `[id].tsx`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Are the 5 inferred relationships involving `useAlarms()` (e.g. with `deleteAlarm()` and `getById()`) actually correct?**
  _`useAlarms()` has 5 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `slug`, `version` to the rest of the system?**
  _126 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `[id].tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07853107344632769 - nodes in this community are weakly interconnected._