# Afilmory: One Roll - Outline v3 (the full film)

> Built timings live in `shots.json` / the studio; this outline keeps the story. v3 adds a "November alone: 201 frames" beat and a WebGPU/iOS 1.5 note at the colour stop.

2:08 · 16:9 · zh + en (two cuts) · 4K60 MP4 + cover frame · social (X, Bilibili, YouTube) · for photographers who have never heard of Afilmory

## Logline

A small pencil-sketched camera named AF loads a fresh roll on 2025-06-05 and
walks the film strip frame by frame, exposing one frame per commit, until the
roll is developed: a gallery on the web, a service anyone can sign up for, and
an app in your pocket.

## Story

**Form: journey along a film strip.** The roll *is* the timeline, running left
to right. Afilmory's name is AF + Aperture + Film + Memory, so a roll that
advances one frame per commit is the product's own metaphor. Film never
rewinds; neither does the camera: one continuous take, AF only moves right,
the camera follows a moving average of AF's x, no cuts.

**Protagonist: AF**, the camera from the Afilmory logo (see `cast-sheet.html`).
Captions are AF, first person, short sentences to a newcomer. The feature card
(top right) is Afilmory speaking.

**Arc**

| | What happens | Rests on |
|---|---|---|
| Setup | AF is sketched, loads the roll, shoots 14 frames on day one, learns to look closely (WebGL viewer, EXIF, Live Photos), goes public in four days. | `f841d2ad` init · `2eb3020d` v0.1.0 |
| Development | Abilities arrive frame by frame: storage (S3, GitHub, local, Eagle), map, HDR, search. Two stumbles (reverts). | #40 #29 #52 #115 #122 · `001506ee` `d98049de` |
| Turning point | Two rebuilds. Oct–Nov 2025: from a static site you rebuild for every photo, to a server with a live dashboard, to galleries for everyone at afilmory.art, with self-hosting kept (201 commits in Nov). A quiet winter. Then Aug 2026: the busiest day of its life (34 commits) growing an iPhone app, then tearing it down and rebuilding it natively in Swift. | `bb308820` · Nov 2025 · 2026-08-01 · `8f6468c7` #258 |
| Resolution | Colour arrives with HDR (WebGPU + gain maps). Pull back: 837 frames on one contact sheet; the canister opens, the roll is developed. AF hands the viewer the camera. | `215576e7` · `4e16a747` iOS 1.5 · 837 commits |

**The ending pays off the first 20 seconds:** the canister AF loads at 0:06
rides on its back the whole film; at 1:58 it opens and the developed roll
unrolls into the contact sheet.

## What the viewer remembers

1. **Your photos, shown properly**: WebGL viewer, EXIF, Live Photos, HDR. *Most time*: set up at 0:12, peaks at 1:48 in colour.
2. **Bring photos from where they live**: S3, GitHub, Eagle, local folders.
3. **See where you shot them**: the map.
4. **Edit live, zero setup at afilmory.art, or self-host with Docker**: the Oct–Nov 2025 rebuild.
5. **In your pocket**: the native iOS app (TestFlight).

## Recurring devices

| Device | Job | Here |
|---|---|---|
| Time axis | where "now" is | the film strip, sprocket holes along both edges; exposed up to AF, clear leader ahead |
| Commit token | one per commit, real daily counts | one small exposed frame per commit, stacked in its day's slot; a busy day is a dense run, a quiet week is blank leader |
| Date | when | printed in the film's edge numbering, the way real film prints frame numbers (`25-06-05 ▸ 14`) |
| Margin notes | the proof | hash / PR number pencilled on the paper beneath the strip with an arrow, left behind as the camera moves |
| Feature card (top right) | the product speaking | big: feature · small: what it does for you · tiny: date and running commit count |
| Keepsake | set up early, paid off | the film canister on AF's back |

## Acts and looks

| Act | Time | Look | Seam (commit) | Story reason |
|---|---|---|---|---|
| I · Draft | 0:00–0:24 | pencil on warm paper | start: `f841d2ad` 2025-06-05 | the first commits are a sketch |
| II · Public | 0:24–0:58 | black & white ink | `2eb3020d` v0.1.0, 2025-06-09: AF walks through a darkroom fixer tray | fixer makes a print permanent; open source is too |
| III · Rebuild | 0:58–1:22 | cyanotype blueprint | `bb308820` server onboarding, 2025-10-26: blueprint paper slides under the strip | it stops being a static site and grows a server: structure, plans |
| IV · Pocket | 1:22–1:48 | Liquid Glass over colour blur | `e6302a45` first mobile app, 2026-07-29: the strip passes under a pane of glass | the iOS app is built on Apple's glass material |
| V · Developed | 1:48–2:08 | full colour, HDR glow | `215576e7` WebGPU HDR, 2026-09-08: colour floods out of one bright frame | HDR is the last thing it learned: now it shows colour as you shot it |

## Beats

Captions: EN / ZH. Card: title · subtitle · date line.

| # | Time | Picture | Card | Caption EN / ZH | Rests on |
|---|---|---|---|---|---|
| 1 | 0:00–0:06 | A pencil draws a strip of film across blank paper; the canister rolls in; AF is sketched around its lens, blinks awake | Afilmory · AF · Aperture · Film · Memory | "Hi, I'm AF. I'm a roll of film: one frame per commit." / 你好，我是 AF。我是一卷胶片：每次提交，曝光一格。 | connective |
| 2 | 0:06–0:12 | AF loads the canister on its back, presses the shutter: 14 frames click onto the strip | A gallery for photographers · your photos, the way you shot them · Jun 5, 2025 · 14 commits | "Day one: fourteen frames. The first one just says init." / 第一天，十四格。第一格只写着 init。 | `f841d2ad` |
| 3 | 0:12–0:18 | AF steps up to a frame; the focus brackets lock green; the frame zooms in tile by tile and stays sharp | WebGL viewer · zoom into huge photos, tile by tile · Jun 6, 2025 | "First I learned to look closely. Really closely." / 我先学会了看清楚，非常清楚。 | `25521e2a` tiled rendering, `8f2abb33` LOD |
| 4 | 0:18–0:24 | The frame flips to show its EXIF (ƒ, shutter, ISO, lens), then wiggles like a Live Photo | EXIF & Live Photos · every setting, and the moment around it · Jun 13, 2025 | "Every setting you used, and the moment around it." / 你用过的每个参数，还有按下快门前后那一瞬。 | `268af5d1` |
| 5 | 0:24–0:28 | Seam: a darkroom tray of fixer across the path; AF hops through and comes out black & white | v0.1.0 · open source · Jun 9, 2025 · 46 commits | "Four days in, I went public. Fixer makes a print permanent." / 第四天我开源了。定影之后，照片就不会褪了。 | `2eb3020d` |
| 6 | 0:28–0:34 | Photos drop onto the strip from a bucket (S3), a repo (GitHub), a folder (local), later an Eagle library | Bring photos from where they live · S3 · GitHub · Eagle · local folders | "Keep your photos where they are. I'll come to them." / 照片放在哪都行，我自己去取。 | init, #40, #122 |
| 7 | 0:34–0:40 | Frames with GPS tags drop pins onto a small hand-drawn map beneath the strip | Explore map · see where every photo was taken · Jul 7, 2025 | "If a photo knows where it was taken, it gets a pin." / 照片记得在哪拍的，我就在地图上插一根针。 | `7310555c` #29 |
| 8 | 0:40–0:45 | One frame glows brighter than the paper around it; an HDR badge stamps on | HDR · brighter than white, on screens that can show it · Jul 9, 2025 | "Brighter than white? On an HDR screen, yes." / 比白还亮？在 HDR 屏幕上，可以。 | `6ec545a6` #52 |
| 9 | 0:45–0:50 | Stumble: AF sorts frames into piles by camera; the piles topple (revert). It tries to sprint, the strip jams, AF trips, lands further right, dusts off | (card holds) | "Not every idea makes it. I trip, get up, and keep going." / 不是每个点子都能留下。摔一跤，爬起来，接着走。 | `001506ee` Aug 4, `d98049de` Sep 21 |
| 10 | 0:50–0:53 | A search box types "tokyo"; matching frames on the strip light up | Search · find any photo by place, camera or tag · Oct 16, 2025 | "Then search, so you can find the one you mean." / 然后是搜索，一下找到你要的那张。 | `6c940658` #115 |
| 11 | 0:53–0:58 | The friction: AF shoots one new frame, and a little printing press stamped `build:manifest` has to reprint the whole strip behind it before a "deploy" stamp lands | (card holds) | "Back then I was a static site. One new photo meant rebuilding and redeploying everything." / 那时我还是个静态站点。每加一张照片，都要整站重新构建、重新部署。 | `pnpm build:manifest` (README, `builder.config.ts`) |
| 12 | 0:58–1:05 | Seam: blueprint paper slides under the strip; AF drafts itself a darkroom (a server) with a desk (the dashboard). A photo is dropped in, its title edited, and it appears on the strip at once, no press | Server + dashboard · upload, sync and edit live, no rebuild · Oct 26, 2025 | "So I built myself a darkroom: a server and a dashboard. Edit a photo, and it's live." / 于是我给自己盖了间暗房：服务端加管理后台。改一张照片，马上就生效。 | `bb308820` onboarding, `223e90d4` dashboard, `7dd6c1c8` #135 sync, `ba68be80` #136 |
| 13 | 1:05–1:11 | The darkroom grows a row of doors, each with a nameplate (a subdomain); strangers walk in with their own rolls; one door gets its own street sign (custom domain) | afilmory.art · sign up, and your gallery is live · Nov 2025 · 201 commits this month | "Then I opened the doors. Anyone can sign up for a gallery at afilmory.art." / 然后我把门打开了。现在任何人都能在 afilmory.art 开一个相册。 | `bc4cd362` tenants, `26657788` landing, `a1710924` custom domains |
| 14 | 1:11–1:14 | Beside the row of doors, the old path stays: the same darkroom, packed in a box AF can carry home | Or self-host · the same code, in Docker | "Rather run it yourself? Same code, one Docker image." / 想自己部署？同一套代码，一个 Docker 镜像。 | `017cd763` Dockerfile, README "Option 2" |
| 15 | 1:14–1:22 | Winter: the strip runs mostly blank leader; a few lonely frames; snow of film grain; AF walks slow and sleepy, canister frosted | (date line ticks Jan → May 2026) | "Then a quiet winter. Forty-five frames in five months. I kept walking." / 然后是安静的冬天，五个月四十五格。我没有停下。 | Jan–May 2026 counts |
| 16 | 1:22–1:26 | Seam: a pane of glass slides over the strip; colour blurs behind it; AF becomes Liquid Glass and wakes up | iOS app · your gallery, on your iPhone · Jul 29, 2026 | "Summer. I wanted to fit in your pocket." / 夏天，我想住进你的口袋。 | `e6302a45` |
| 17 | 1:26–1:34 | The busiest day: 34 frames stream past; AF sprints, flash firing again and again | (card) Aug 1, 2026 · 34 commits in one day | "Thirty-four frames in one day. My busiest ever." / 一天三十四格，最忙的一天。 | 2026-08-01 |
| 18 | 1:34–1:42 | Turning point peak: AF is wearing a cardboard phone costume (the first React Native app); it tears it off and steps out native glass | Native Swift · rebuilt from scratch for iPhone · Aug 10, 2026 · #258 | "Twelve days in, I tore it down and rebuilt it natively in Swift." / 十二天后，我把它拆了，用 Swift 原生重写。 | `8f6468c7` #258 |
| 19 | 1:42–1:48 | Upload from a phone (a progress pill), a widget with a photo of the day, a notification bubble | Upload, widgets, notifications · public beta on TestFlight · Sep 2026 | "Upload from your phone. A photo of the day on your home screen." / 在手机上上传，桌面上每天一张照片。 | `7cc409e4`, `8b53ad34` #275, `cd984710` |
| 20 | 1:48–1:54 | Seam: one frame glows with HDR, and colour floods out along the strip; AF turns Afilmory blue | HDR in colour · WebGPU + JPEG gain maps · Sep 8, 2026 | "And now colour, as bright as you shot it." / 现在是彩色的，和你拍下时一样亮。 | `215576e7` |
| 21 | 1:54–2:00 | Pull back: the whole roll as a contact sheet, 837 frames in their real daily counts (June 2025, Nov 2025 and Aug 2026 are the dense bands); the canister pops open | (card: 837 commits · Jun 5, 2025 → Sep 26, 2026) | "Eight hundred thirty-seven frames. One roll. Developed." / 八百三十七格，一卷，冲洗好了。 | `timeline.json` |
| 22 | 2:00–2:08 | AF signs the sheet; closing card: Afilmory, tagline, AF peeking over the name and blinking (aperture), a hand-drawn box types `afilmory.art` beside the GitHub mark and `github.com/Afilmory/afilmory` | Afilmory · your photos, developed | Signature: "Shot by AF, / for your photos." / 由 AF 拍摄，/ 为你的照片。 | closing frame = cover |

## Mapping (git → screen)

| Git | On screen |
|---|---|
| a commit | one exposed frame, in its day's slot, real count |
| a day with commits | a slot with its date in the edge numbering |
| days without commits | blank leader, compressed but visible (the winter is long on purpose) |
| a release or pivot | a seam where the film stock changes |
| a revert | a jam and a trip; AF lands further right |

## Sound

Synthesized. One soft shutter click per frame (the busiest day becomes a
rattle); a warm pad per act, darker in blueprint, sparse in winter; a chord on
each seam; a bright rising figure at the colour flood; a final click on the
closing card.

## Claims to double-check

- "zoom into huge photos, tile by tile": the WebGL viewer does tiled rendering + LOD (`25521e2a`, `8f2abb33`); no megapixel number is claimed.
- The EXIF values shown on the frame (ƒ/1.8, 1/250, ISO 100) are **illustrative**.
- "search box types tokyo": illustrative query; search (#115) is real.
- The Oct–Nov 2025 sequence: static site (`build:manifest` + deploy) → server + dashboard (Oct 26) → multi-tenant (Nov 6) → landing (Nov 11), billing (Nov 16), custom domains (Nov 20). Self-hosting was never dropped (Dockerfile Nov 9, README Option 2). The afilmory.art card says "Nov 2025", not a launch day.
- The cardboard costume for React Native is a metaphor: the Expo app landed Jul 29 (`e6302a45`), native Swift work started Aug 1, the full rewrite merged Aug 10 (#258).
- iOS "public beta on TestFlight" (README banner Aug 6, 2026, `cd984710`).
- 837 = commits on `main` (first-parent history). All branches: 1,042. The film uses 837.
- v0.0.2 (2026-04-26) is left out: it's a package version tag, not a product release.

## Left out, and why

Share-anywhere beat (OG link previews `caf47a4a`, RSS, comments `ced9e747`: cut to make room for the static → server → SaaS steps; can come back at +6 s), telemetry revert (Aug 18, 2026, internal), OAuth gateway, i18n, SSR/OG internals,
Astro landing site, the photo promo pipeline, the variant cluster report, the
share embed (June 2026). Each is real, but none is a thing a newcomer would picture.
