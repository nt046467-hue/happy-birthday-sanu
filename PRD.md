# PRD — "Happy Birthday Karu" → Real React Birthday Experience

**Owner:** Nabin  **Type:** Mobile-first interactive web experience (single recipient, personal gift)
**Status:** Draft v1  **Source of truth for content:** `reference/legacy.html` (the current single-file version)

---

## 1. Goal

Convert the existing 4,000-line `index.html` into a real, maintainable **React + Vite + TypeScript** project that feels like a **premium native app** on a mid-range Android phone: no hang, no jank, no dropped frames, and every moment (gift, cake, candles, blow, cut, celebration) feels **physical and natural**, not like a web page with animations.

**Success = Karu picks up her phone, taps the link, and it feels smooth from the first second to the last. She never thinks "this is a website."**

### Non-goals (v1)
- No backend, no login, no database. 100% static, zero server cost (Vercel/Netlify free tier).
- No Three.js / WebGL 3D cake in v1 (too risky for low-end phones). 2.5D layered SVG + canvas gives the real feel at a fraction of the cost.
- No multi-recipient CMS. Personalization comes from one `config.ts` file.

---

## 2. Audit of the current `index.html` (why it needs a rewrite)

**What is good and must be kept (content + ideas):**
- Story flow: gift box → tease → KARU heart letters → cake → blow candles (mic + tap fallback) → romantic relight ("make a wish") → blow again → cut cake with knife drag → GIF/love screens → "real gift" letter → final screen.
- Procedural WebAudio for the knife slice, haptics via `navigator.vibrate`, `prefers-reduced-motion` support, `100dvh`, mic detection with tap fallback, particle caps + visibility pause.

**What causes lag / unreal feel (must be fixed):**
| Problem in current file | Impact | Fix in React version |
|---|---|---|
| Confetti/emoji/glitter/petals are **hundreds of DOM nodes** (e.g. `burst(150)+burst(120)+burst(100)` = 370 divs at once, then 180+130+100+80 on cut, + 40 emoji divs) | Frame drops, freezing on cheap phones | **One `<canvas>` particle engine**, object-pooled, max ~250 live particles |
| `backdrop-filter: blur(24px)` on cards, 9× `filter: drop-shadow`, animated `filter: brightness()` on the board | GPU-heavy, jank on mid-range Android | Static translucent backgrounds; pre-baked glow sprites; animate **only `transform` and `opacity`** |
| `setInterval` spawners, `setTimeout` chains, JS shake via `setInterval`, `void el.offsetWidth` forced reflows | Timing drift, layout thrash | Single `requestAnimationFrame` loop + Framer Motion / GSAP timelines |
| Global mutable state (`phase`, `candlesOut`, `relitOut`, `flameRelitAt`…) | Fragile, bug-prone | Typed finite state machine (Zustand or XState-lite) |
| Emoji as visuals (Noto Color Emoji from Google Fonts) | Renders differently per device, sometimes tofu boxes | Self-drawn SVG/canvas sprites (hearts, petals, sparkles); emoji only inside text |
| GIFs hot-linked from `media.tenor.com` (3 URLs) | Breaks if Tenor changes/blocks; heavy; no offline | Self-host as short `.webm` + `.mp4` fallback (or Lottie), preloaded |
| Google Fonts hot-linked | Render-blocking, FOUT | Self-host `Great Vibes` + `Nunito` (woff2, subset) |
| Mic requested at cake-stage load | Permission prompt at a weird moment; iOS unreliable | Ask on an explicit, in-story button tap ("Blow the candles"), with graceful fallback |
| One 180 KB file, inline everything | Slow first paint, unmaintainable | Code-split by stage, lazy-load cake/cut after the intro |

---

## 3. Experience principles ("real feel" rules)

1. **Everything has weight and response.** Every tap gets feedback within **≤ 50 ms** (scale, ripple, haptic, sound). Nothing is ever "dead" after a tap.
2. **Light is the hero.** The cake scene is lit *only* by candle flames. Flame flicker drives a soft warm glow on the cake, plate and table. When candles go out, the light genuinely fades, when they relight, it warms back.
3. **Physics-ish, not keyframe-ish.** Use spring easing (overshoot + settle), not linear/ease. Cut slice slides out with inertia. Smoke drifts and curls. Petals sway on sine curves.
4. **Sound is 50% of the feeling.** Match strike, candle crackle, soft "whoosh" on blow, knife scrape, pop, cheer, music bed. All unlocked by the first tap.
5. **Haptics on Android** (`navigator.vibrate`) for: gift tap, candle out, cut complete, confetti pop. Feature-detected; silently skipped on iOS.
6. **Pacing.** No screen auto-advances too fast; no waiting longer than ~1.5 s without something moving. Emotional beats get room (the "make a wish" moment is ~3 s of stillness + soft music).
7. **Never break the spell.** No visible loaders after the intro, no layout shift, no permission-error boxes, no scrollbars, no text selection, no pull-to-refresh, no double-tap zoom.
8. **Fail soft.** Mic denied → hold-to-blow button. Audio blocked → visuals still work. Low FPS → automatically reduce particles/effects.

---

## 4. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Build | **Vite + React 18 + TypeScript** | Fast, tiny output, static deploy |
| Styling | **Tailwind CSS** + a few CSS variables | Fast iteration, small CSS |
| Animation (UI) | **Framer Motion** (`motion`) | Springs, `AnimatePresence` stage transitions, gesture support |
| Particles/effects | **Custom canvas engine** (pooled, rAF) | Zero DOM cost; total control |
| Cake/flames/smoke | **Layered SVG + canvas overlay** | Crisp at any DPR, cheap |
| State | **Zustand** (stage machine + settings) | Tiny, no boilerplate |
| Audio | **WebAudio** (synth for SFX) + small `.mp3/.ogg` for music (or synthesized melody) | Low latency, works offline |
| PWA | **vite-plugin-pwa** | Offline, add-to-home-screen, instant repeat loads |
| Hosting | **Vercel or Netlify** (static) | Free, matches current setup |

No runtime API calls. No trackers.

---

## 5. Project structure

```
/reference/legacy.html            # old file, content reference only
/public/
  fonts/ (GreatVibes.woff2, Nunito-*.woff2)
  media/ (couple-1.webm/.mp4, couple-2.webm/.mp4, poster images .webp)
  audio/ (music.ogg/.mp3, cheer.mp3, optional voice-wish.mp3)
  og-image.jpg, icons/
/src/
  main.tsx, App.tsx
  config/content.ts              # ALL text, names, media paths, timings
  state/useStage.ts              # typed stage machine (Zustand)
  engine/
    particles.ts                 # pooled canvas particle system (confetti, sparks, petals, hearts, smoke)
    loop.ts                      # single rAF loop, visibility pause, adaptive quality
    perf.ts                      # device tier detection + FPS monitor
    audio.ts                     # AudioContext unlock, sfx synth, music, ducking
    haptics.ts                   # vibrate wrapper
    mic.ts                       # getUserMedia + blow detection
  stages/
    Gate.tsx                     # "Tap to begin" (unlocks audio, sets tier)
    GiftBox.tsx
    Tease.tsx
    NameReveal.tsx               # K-A-R-U hearts
    Cake/ (CakeScene.tsx, CakeSvg.tsx, Candle.tsx, Flame.tsx, Smoke.tsx, BlowController.tsx)
    Cut/ (CutScene.tsx, Knife.tsx, SliceLogic.ts)
    Memories.tsx                 # GIF/video screens (stage5/6)
    Unwrap.tsx                   # "opening your gift" sequence
    Letter.tsx                   # real gift message
    Finale.tsx
  components/ (GlassCard, PrimaryButton, StarField, RoomLight, Vignette)
  styles/index.css
```
