---
version: alpha
name: ReviewLens
description: ReviewLens's design language, adapted from a Shopifi-inspired system — two parallel design tracks that share typographic DNA and one pill-only button vocabulary. The cinematic track (heroes, narrative bands) lives on an indigo night canvas with giant thin display type, white copy and electric-aqua highlights. The transactional track (reviews, comparisons, lists) flips to white and a peach-washed cream, with powder-blush and peach-fuzz surface fills. Deep pink is the single hot accent shared by both. The two tracks diverge sharply in canvas polarity — and that choice is the brand.

colors:
  electric-aqua: "#51e5ff"
  indigo: "#440381"
  deep-pink: "#ec368d"
  powder-blush: "#ffa5a5"
  peach-fuzz: "#ffd6c0"
  primary: "#440381"
  accent: "#ec368d"
  ink: "#440381"
  on-primary: "#ffffff"
  on-dark: "#ffffff"
  canvas-night: "#440381"
  canvas-night-elevated: "#4f1289"
  canvas-light: "#ffffff"
  canvas-cream: "#fff5ef"
  surface-elevated-dark: "#2c0254"
  shade-30: "#e3d9ec"
  shade-40: "#bea7d3"
  shade-50: "#855bad"
  shade-60: "#69359a"
  shade-70: "#2c0254"
  hairline-light: "#ece6f2"
  hairline-dark: "#69359a"

typography:
  display-xxl:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 96px
    fontWeight: 330
    lineHeight: 1.0
    letterSpacing: 2.4px
    fontFeature: ss03
  display-xl:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 70px
    fontWeight: 330
    lineHeight: 1.0
    letterSpacing: 0
    fontFeature: ss03
  display-lg:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 55px
    fontWeight: 330
    lineHeight: 1.16
    letterSpacing: 0
    fontFeature: ss03
  display-md:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 48px
    fontWeight: 330
    lineHeight: 1.14
    letterSpacing: 0
    fontFeature: ss03
  heading-xl:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 28px
    fontWeight: 500
    lineHeight: 1.28
    letterSpacing: 0.42px
    fontFeature: ss03
  heading-lg:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: 0.36px
    fontFeature: ss03
  heading-md:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: 0.3px
    fontFeature: ss03
  heading-sm:
    fontFamily: "NeueHaasGrotesk Display, Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: 0.72px
    fontFeature: ss03
  body-lg:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 18px
    fontWeight: 550
    lineHeight: 1.56
    letterSpacing: 0
    fontFeature: ss03
  body-md:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 420
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: ss03
  body-strong:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 16px
    fontWeight: 550
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: ss03
  caption:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.49
    letterSpacing: 0.28px
    fontFeature: ss03
  micro:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: -0.13px
    fontFeature: ss03
  eyebrow-cap:
    fontFamily: "Inter Variable, Inter, Helvetica, Arial, sans-serif"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.72px
    fontFeature: ss03
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
    fontFeature: ss03

rounded:
  xs: 4px
  sm: 5px
  md: 8px
  lg: 12px
  xl: 20px
  pill: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  huge: 64px

components:
  button-primary-pill:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-primary-pill-pressed:
    backgroundColor: "{colors.shade-70}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-outline-on-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 26px
  button-outline-on-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  button-blush-pill:
    backgroundColor: "{colors.powder-blush}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.pill}"
    padding: 12px 24px
  text-input:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 10px 12px
  card-pricing:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing-featured:
    backgroundColor: "{colors.powder-blush}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-feature-cinematic:
    backgroundColor: "{colors.canvas-night-elevated}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-peach-band:
    backgroundColor: "{colors.peach-fuzz}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-photo-frame:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xl}"
    padding: 0px
  pill-tag-blush:
    backgroundColor: "{colors.powder-blush}"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  pill-tag-shade:
    backgroundColor: "{colors.shade-30}"
    textColor: "{colors.ink}"
    typography: "{typography.eyebrow-cap}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  nav-bar-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  nav-bar-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 16px 24px
  link-on-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.xs}"
    padding: 0px
  footer-dark:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
  footer-light:
    backgroundColor: "{colors.canvas-light}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.xs}"
    padding: 64px 24px
  verdict-chip-buy:
    backgroundColor: "{colors.indigo}"
    textColor: "{colors.on-primary}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  verdict-chip-caveats:
    backgroundColor: "{colors.peach-fuzz}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  verdict-chip-skip:
    backgroundColor: "{colors.powder-blush}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  verdict-chip-thin-data:
    backgroundColor: "{colors.shade-30}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  verdict-chip-buy-on-night:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.electric-aqua}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  verdict-chip-thin-data-on-night:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.shade-40}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: 4px 12px
  section-rule:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.pill}"
    padding: 0px
  data-bar:
    backgroundColor: "{colors.shade-40}"
    rounded: "{rounded.pill}"
    padding: 0px
  data-bar-highlight:
    backgroundColor: "{colors.deep-pink}"
    rounded: "{rounded.pill}"
    padding: 0px
  data-bar-track:
    backgroundColor: "{colors.hairline-light}"
    rounded: "{rounded.pill}"
    padding: 0px
  card-where-to-buy:
    backgroundColor: "{colors.canvas-cream}"
    textColor: "{colors.ink}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-step-night:
    backgroundColor: "{colors.surface-elevated-dark}"
    textColor: "{colors.on-dark}"
    typography: "{typography.caption}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-outline-night:
    backgroundColor: "{colors.canvas-night}"
    textColor: "{colors.on-dark}"
    typography: "{typography.heading-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  divider-night:
    backgroundColor: "{colors.hairline-dark}"
    padding: 0px
  caption-secondary:
    textColor: "{colors.shade-60}"
    typography: "{typography.caption}"
  caption-tertiary:
    textColor: "{colors.shade-50}"
    typography: "{typography.caption}"
  sample-banner:
    backgroundColor: "{colors.shade-70}"
    textColor: "{colors.peach-fuzz}"
    typography: "{typography.micro}"
    padding: 8px 16px
---

## Overview

The system runs two parallel design tracks that share typographic DNA and a single button vocabulary, but diverge in canvas polarity. The cinematic track lives on `{colors.canvas-night}` (`#440381`, indigo) — full-bleed photography, giant `{typography.display-xxl}` headlines in Neue Haas Grotesk Display set at weight 330 (a thin, almost editorial cut), and a single CTA: a white-stroked indigo pill with the form `button-outline-on-dark`. The pages read like the spread of a high-end print magazine: deep indigo, lots of negative space, photography that doesn't compete with text, and one and only one action per band. `{colors.electric-aqua}` is the night track's highlight — active links, key numbers, focus rings — and never leaves it.

The transactional track flips to `{colors.canvas-light}` and `{colors.canvas-cream}` (a peach-washed off-white, barely warmer than pure white). Reviews, comparison tables, and ranked lists sit on this lighter canvas, with the same pill button system but in inverse polarity (a solid indigo pill with white text, or a `{colors.powder-blush}` pill for the featured action). The surface fills — `{colors.powder-blush}` and `{colors.peach-fuzz}` — show up only on the light track, never on the cinematic indigo pages. `{colors.deep-pink}` is the one hot accent both tracks share, always as a mark (rule, dot, bar, large number), never as a fill behind small text.

Typography is split across three families. **Neue Haas Grotesk Display** at thin weights (330–500) handles every display, headline, and editorial moment — the brand's identity is that thin display cut. **Inter Variable** at 420–550 weights handles every UI body, button label, caption, and form field — utility text that doesn't fight the display. **ui-monospace** appears only in code blocks and rare technical eyebrows. Across all three families, the OpenType `ss03` stylistic set is enabled — it's the brand's character-level signature, applied universally.

**Key Characteristics:**
- Two-canvas system: `{colors.canvas-night}` (indigo) for cinematic bands, `{colors.canvas-light}` / `{colors.canvas-cream}` for transactional surfaces — never blended. A page may open with one cinematic band (nav + hero); everything below it is transactional.
- Pill-shape (`{rounded.pill}`) is the only button shape across both tracks; rounded rectangles do not exist for buttons.
- Thin-weight (330) display typography is the signature; `{typography.display-xxl}` at 96px / weight 330 is the brand's loudest visual.
- Powder blush and peach fuzz (`{colors.powder-blush}`, `{colors.peach-fuzz}`) are reserved for the light track as surface fills; electric aqua (`{colors.electric-aqua}`) is reserved for the night track.
- Deep pink (`{colors.deep-pink}`) is the only accent that crosses tracks — as a mark, never as a text background.
- The five-stop brand gradient appears once per page at most, as a thin strip — never behind text.
- Photography is full-bleed, edge-to-edge, never inset in cards on the cinematic track; merchants and storefront imagery do the heavy visual lifting that gradients and illustrations would do elsewhere.
- The OpenType `ss03` stylistic set is enabled across every text role — a character-level unifier that tracks across both tracks.
- Tight letter-spacing on display sizes (2.4px positive tracking on 96px display) gives the thin weight extra optical air.

## Colors

> **Source pages:** home (`/`), `/start`, `/website/builder`, `/pricing`.

### Brand Palette
The five source colours. Every other colour token is one of these, white, or a tint/shade derived from indigo.

| Token | Hex | HSL | Role |
|---|---|---|---|
| `{colors.electric-aqua}` | `#51e5ff` | 189 100% 66% | Night-track highlight |
| `{colors.indigo}` | `#440381` | 271 95% 26% | Night canvas, ink, primary |
| `{colors.deep-pink}` | `#ec368d` | 331 83% 57% | The one hot accent (both tracks) |
| `{colors.powder-blush}` | `#ffa5a5` | 0 100% 82% | Light-track featured fill |
| `{colors.peach-fuzz}` | `#ffd6c0` | 21 100% 88% | Light-track band fill |

### Brand & Accent
- **Deep Pink** (`{colors.deep-pink}` — `#ec368d`): The accent. Section rules, active-tab underlines, data-bar highlights (the product you're looking at, against its peers), numbers set at display size. It is 3.8:1 on white and 3.5:1 on indigo — enough for large text and UI marks, not for body copy.
- **Powder Blush** (`{colors.powder-blush}` — `#ffa5a5`): The featured-action accent. Used as a pill button background on light surfaces and as the fill of a featured card.
- **Peach Fuzz** (`{colors.peach-fuzz}` — `#ffd6c0`): Softer than blush; used as a wide section band fill on the light track to signal a different kind of content without leaving the warm family.
- **Electric Aqua** (`{colors.electric-aqua}` — `#51e5ff`): The night track's highlight — hovered/active links, key figures, focus rings on indigo. 1.5:1 on white, so it never appears on the light track.
- **Link tones on night**: `{colors.peach-fuzz}` for quiet footer / tertiary links, `{colors.powder-blush}` for muted secondary links, `{colors.electric-aqua}` for hover and active — a warm-to-bright hierarchy below the primary white type.

### Surface
- **Canvas Night** (`{colors.canvas-night}` — `#440381`): Indigo hero, cinematic bands, footer.
- **Canvas Night Elevated** (`{colors.canvas-night-elevated}` — `#4f1289`): Cards on cinematic surfaces, video frames — indigo lifted 6% toward white.
- **Surface Elevated Dark** (`{colors.surface-elevated-dark}` — `#2c0254`): Indigo pushed toward black; used on a small subset of night cards to add depth without leaving the indigo.
- **Canvas Light** (`{colors.canvas-light}` — `#ffffff`): Reviews, comparison tables, ranked lists.
- **Canvas Cream** (`{colors.canvas-cream}` — `#fff5ef`): Peach fuzz at 25% over white — barely different from `#ffffff` but adds warmth to long reading pages.
- **Hairline Light** (`{colors.hairline-light}` — `#ece6f2`): 1px borders on light cards, table dividers — indigo at 10%.
- **Hairline Dark** (`{colors.hairline-dark}` — `#69359a`): 1px borders on the rare night cards that have visible chrome.

### Shade Ladder
Indigo-tinted neutrals, so nothing on the page reads as cold grey.
- **Shade-30** (`{colors.shade-30}` — `#e3d9ec`): Tag / chip background on light, footer hairline on night.
- **Shade-40** (`{colors.shade-40}` — `#bea7d3`): Secondary text on night (6.1:1). Decorative only on light (2.2:1).
- **Shade-50** (`{colors.shade-50}` — `#855bad`): Secondary text on light (5.1:1).
- **Shade-60** (`{colors.shade-60}` — `#69359a`): Strong secondary text on light (8.2:1), deep accent on night.
- **Shade-70** (`{colors.shade-70}` — `#2c0254`): Pressed-state of the primary pill button; deep night surface accent.

### Text
- **Ink** (`{colors.ink}` — `#440381`): All text on light canvas — indigo, not black (13.3:1 on white).
- **On Primary** (`{colors.on-primary}` — `#ffffff`): All text on night canvas + filled indigo-pill labels.

### Contrast Pairs
Checked against WCAG 2.2. "Large" means ≥24px, or ≥18.66px bold.

| Foreground | Background | Ratio | Allowed for |
|---|---|---|---|
| indigo | white | 13.3:1 | Everything |
| indigo | canvas-cream | 12.4:1 | Everything |
| white | indigo | 13.3:1 | Everything |
| indigo | peach-fuzz / electric-aqua / powder-blush | 9.9 / 8.9 / 7.1:1 | Everything |
| peach-fuzz / electric-aqua / powder-blush | indigo | 9.9 / 8.9 / 7.1:1 | Everything |
| shade-50 | white | 5.1:1 | Body and secondary text |
| deep-pink | white | 3.8:1 | Large text, icons, bars, rules |
| white | deep-pink | 3.8:1 | Large text only |
| deep-pink | indigo | 3.5:1 | Large text, icons, bars, rules |
| electric-aqua | white | 1.5:1 | Never |

### Brand Gradient
All five stops in palette order: `linear-gradient(90deg, #51e5ff, #440381, #ec368d, #ffa5a5, #ffd6c0)`. Used as a 4px signature strip — under the cinematic hero, or across the top of the footer. Contrast swings from 1.5:1 to 13.3:1 across its stops, so nothing is ever set on top of it.

## Typography

### Font Family

The display tier is **Neue Haas Grotesk Display** at thin weights (330–500). When unavailable, fall back to **Helvetica** at light weight, then Arial. The thin-weight cut is the brand — no substitution should default to weight 400+.

The UI tier is **Inter Variable** at 420–550 — a variable font with sub-weight precision that lets the system span body (420), strong (550), and caption (500) without jumping to heavier tiers. Inter is open-source via Google Fonts.

The code tier is **ui-monospace**, the system mono — preferred over a webfont mono to avoid unnecessary downloads.

The OpenType `ss03` stylistic set is enabled across every role. It alters specific glyph forms (lowercase `a`, `g`, single-story numerals) for a slightly more geometric character. Apply via `font-feature-settings: "ss03"` on the body element or root.

### Hierarchy

| Token | Size | Weight | Line Height | Letter Spacing | Use |
|---|---|---|---|---|---|
| `{typography.display-xxl}` | 96px | 330 | 1.0 | 2.4px | Cinematic hero headline |
| `{typography.display-xl}` | 70px | 330 | 1.0 | 0 | Section opener on cinematic pages |
| `{typography.display-lg}` | 55px | 330 | 1.16 | 0 | Pricing-page page title |
| `{typography.display-md}` | 48px | 330 | 1.14 | 0 | Sub-section headline on light track |
| `{typography.heading-xl}` | 28px | 500 | 1.28 | 0.42px | Card title / pricing tier name |
| `{typography.heading-lg}` | 24px | 400 | 1.14 | 0.36px | Compact card title |
| `{typography.heading-md}` | 20px | 500 | 1.4 | 0.3px | Section sub-heading |
| `{typography.heading-sm}` | 18px | 500 | 1.25 | 0.72px | Eyebrow / mini-section label |
| `{typography.body-lg}` | 18px | 550 | 1.56 | 0 | Marketing body lead, large body |
| `{typography.body-md}` | 16px | 420 | 1.5 | 0 | Default UI body, pill-button labels |
| `{typography.body-strong}` | 16px | 550 | 1.5 | 0 | Emphasized body run |
| `{typography.caption}` | 14px | 500 | 1.49 | 0.28px | Helper copy, footnotes |
| `{typography.micro}` | 13px | 500 | 1.5 | -0.13px | Pricing fine print |
| `{typography.eyebrow-cap}` | 12px | 400 | 1.2 | 0.72px | All-caps eyebrow above large headlines |
| `{typography.code}` | 16px | 400 | 1.5 | 0 | Code blocks |

### Principles
- **Display thinness is the brand.** Always render display sizes at weight 330 — never 400+. The thinness is a deliberate editorial choice that makes the giant size feel quiet.
- **Display in NHGD, body in Inter.** Don't push body roles up to NHGD; don't push display roles down to Inter.
- **Tracking lifts on display.** The 96px hero gets +2.4px positive tracking — the thin glyphs need air. At 70px and below, tracking returns to 0.

### Note on Font Substitutes
Open substitutes for Neue Haas Grotesk Display: **Helvetica Now Display** (proprietary) or **Inter Display** at light weights (open-source) are the closest matches. Avoid Helvetica Neue at default weight — it's too heavy for the brand's thin tier. **Inter Variable** is open-source via Google Fonts and is the canonical body face — no substitute needed. Hindi reviews are shown in their original script, so every stack falls back to **Noto Sans Devanagari** before the system fonts.

## Layout

### Spacing System
- **Base unit**: 8px (with denser sub-units 1, 2, 3, 4 for fine work).
- **Tokens**: `{spacing.xxs}` 2px · `{spacing.xs}` 4px · `{spacing.sm}` 8px · `{spacing.md}` 12px · `{spacing.lg}` 16px · `{spacing.xl}` 24px · `{spacing.xxl}` 32px · `{spacing.huge}` 64px.
- **Section padding**: `{spacing.huge}` 64–128px on cinematic marketing pages (extreme negative space is the point); collapses to ~48px on transactional pages where density takes priority.
- **Card internal padding**: `{spacing.xxl}` 32px on pricing cards; `{spacing.xl}` 24px on compact tag rows.

### Grid & Container
- Cinematic hero pages use a wide max-width container (~1440–1600px) with edge-bleeding photography that escapes the container.
- Pricing collapses through 4-up → 2-up → 1-up tiers based on viewport.
- Body content centers in a ~720–840px reading column on long-form pages.

### Whitespace Philosophy
The cinematic track treats whitespace as the brand's most valuable asset — sections often have 128–192px of vertical air between content blocks, with photography filling the rest. The transactional track tightens to ~48–64px between bands because users are scanning, comparing, and acting. The contrast between the two whitespace philosophies is part of the brand voice.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat, no shadow | Default surface |
| 1 | `0 1px 2px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.06)` | Subtle inset highlight on night cards (a top-edge sheen) |
| 2 | `0 0 0 1px rgba(255,255,255,0.10), 0 1px 3px rgba(20,0,40,0.35), 0 5px 10px rgba(20,0,40,0.25)` | Night elevated cards with hairline + drop shadow stack |
| 3 | `0 8px 8px rgba(68,3,129,0.08), 0 4px 4px rgba(68,3,129,0.08), 0 2px 2px rgba(68,3,129,0.08), 0 0 0 1px rgba(68,3,129,0.10)` | Stacked-shadow card on light surfaces; layered tiny indigo-tinted shadows produce a soft halo |
| 4 | `0 25px 50px -12px rgba(68,3,129,0.25)` | Modal / floating panel on light |

### Decorative Depth
On the cinematic track, depth comes from photography — full-bleed imagery layered behind cards, with subtle inset top-edge highlights creating the illusion of light hitting a glass surface. On the light track, the layered tiny-shadow stack (Level 3) produces a soft, paper-like halo around cards — depth without harshness. Shadows are tinted indigo, never neutral black, so they sit inside the palette.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.xs}` | 4px | Inputs, hairline tags |
| `{rounded.sm}` | 5px | Image containers (small) |
| `{rounded.md}` | 8px | Form inputs, video frames, smaller cards |
| `{rounded.lg}` | 12px | Pricing cards, feature cards |
| `{rounded.xl}` | 20px (top-only on some asymmetric cards) | Hero photo frames, cinematic card chrome |
| `{rounded.pill}` | 9999px | All buttons, pill tags, blush chips |

### Photography Geometry
Photography is full-bleed with no border. On cinematic pages it escapes the container entirely; on transactional pages it sits inside `{rounded.lg}` containers with no shadow. Avatar treatments in customer-logo strips are simple greyscale wordmarks at uniform height (~24–32px), aligned in a single horizontal strip.

## Components

### Buttons

**`button-primary-pill`** — the dominant CTA across the system.
- Background `{colors.primary}` (indigo), text `{colors.on-primary}`, type `{typography.body-md}`, padding `{spacing.md} {spacing.xl}` (12px 24px), rounded `{rounded.pill}` 9999px.
- Pressed state `button-primary-pill-pressed`: background deepens to `{colors.shade-70}`.

**`button-outline-on-dark`** — the cinematic hero CTA.
- Background `{colors.canvas-night}` (transparent on the canvas), 2px solid `{colors.on-primary}` border, text `{colors.on-primary}`, same pill geometry.

**`button-outline-on-light`** — the light-track equivalent.
- Background `{colors.canvas-light}`, 1px solid `{colors.ink}` border, text `{colors.ink}`, same pill geometry.

**`button-blush-pill`** — the featured CTA on the light track.
- Background `{colors.powder-blush}`, text `{colors.ink}` (7.1:1), same pill geometry. Used for the one featured action on a band.

### Cards & Containers

**`card-pricing`** — the standard tier card on the pricing page.
- Background `{colors.canvas-light}`, padding `{spacing.xxl}`, rounded `{rounded.lg}` 12px, 1px `{colors.hairline-light}` border. Title in `{typography.heading-xl}`, price in `{typography.display-md}`, body in `{typography.body-md}`, CTA pinned to the bottom as `button-primary-pill`.

**`card-pricing-featured`** — the highlighted card in a set.
- Background `{colors.powder-blush}`, otherwise identical to `card-pricing`. The blush fill (rather than a brand-color border) is the brand's distinctive featured-card choice.

**`card-feature-cinematic`** — feature card on the cinematic track.
- Background `{colors.canvas-night-elevated}`, text `{colors.on-primary}`, rounded `{rounded.lg}`, often with a top-edge inset highlight (Level 1 elevation). Holds full-bleed photography or a single large statement.

**`card-peach-band`** — wide horizontal band card used to highlight a category of content on the light track.
- Background `{colors.peach-fuzz}`, text `{colors.ink}` (9.9:1), rounded `{rounded.lg}` 12px, padding `{spacing.xxl}`.

**`card-photo-frame`** — full-bleed photography container on cinematic pages.
- Background `{colors.canvas-night}`, padding 0, rounded `{rounded.xl}` 20px (often top-only). The photo IS the content; no inner padding, no overlay text inside the card.

### Inputs & Forms

**`text-input`** — standard text input on light surfaces.
- Background `{colors.canvas-light}`, text `{colors.ink}`, type `{typography.body-md}`, padding `{spacing.sm}+ {spacing.md}` (10px 12px), rounded `{rounded.md}` 8px, 1px `{colors.hairline-light}` border.

### Navigation

**`nav-bar-light`** — top nav on light pages.
- Background `{colors.canvas-light}`, text `{colors.ink}`, padding `{spacing.lg} {spacing.xl}`. Logo wordmark on the left, nav items center, two pill buttons on the right (`button-outline-on-light` for "Log in", `button-primary-pill` for "Start free trial").

**`nav-bar-dark`** — top nav on cinematic pages.
- Background `{colors.canvas-night}`, text `{colors.on-primary}`, otherwise identical structure. Two pill buttons on the right (`button-outline-on-dark` for both, with the rightmost subtly more prominent via type weight).

### Pills, Tags, and Chips

**`pill-tag-blush`** — small tag on light surfaces, signaling a category.
- Background `{colors.powder-blush}`, text `{colors.ink}`, type `{typography.eyebrow-cap}`, padding `{spacing.xs} {spacing.md}`, rounded `{rounded.pill}`.

**`pill-tag-shade`** — neutral tag on light surfaces.
- Background `{colors.shade-30}`, text `{colors.ink}`, otherwise same shape as `pill-tag-blush`.

### Signature Components

**Cinematic Photography Layer** — full-bleed merchant photos on the hero. No overlay scrim, no text-on-image; instead, the type sits in clean negative space above or below the photo. The brand treats photography as an editorial spread, not as decoration.

**Stacked Tiny Shadows (Level 3 Elevation)** — pricing cards on the light track use 4 stacked tiny drop shadows (each 1–8px Y offset, 8% indigo) to produce a soft, layered paper halo. This is the brand's distinctive depth on light.

**`link-on-dark`** — inline link on cinematic pages.
- Color `{colors.on-primary}`, no underline by default (links rely on context); for tertiary footer links, color shifts to `{colors.peach-fuzz}` with a persistent underline, and to `{colors.electric-aqua}` on hover.

**`footer-dark`** — full-page-width footer on the cinematic track.
- Background `{colors.canvas-night}`, text `{colors.on-primary}`, type `{typography.caption}`, padding `{spacing.huge} {spacing.xl}`. Contains 4–5 columns of muted-tone link groups, social icons, and a small legal row.

**`footer-light`** — equivalent on the transactional track.
- Background `{colors.canvas-light}`, text `{colors.ink}`, otherwise same structure.

### Review Components

The components that carry ReviewLens's data. They follow the same rules as everything above: pills for anything chip-shaped, deep pink only as a mark.

**Verdict chips** — `verdict-chip-buy`, `verdict-chip-caveats`, `verdict-chip-skip`, `verdict-chip-thin-data`.
- On light: Buy is a filled indigo pill with white text; Buy with caveats sits on `{colors.peach-fuzz}`, Skip on `{colors.powder-blush}`, Not enough data on `{colors.shade-30}` — all with indigo text (≥7:1).
- On night (`verdict-chip-buy-on-night` and siblings): a 1px outline pill on the indigo canvas, with the label in `{colors.electric-aqua}` (Buy), `{colors.peach-fuzz}` (caveats), `{colors.powder-blush}` (Skip) or `{colors.shade-40}` (Not enough data).
- Every chip carries a glyph (✓ ! ✕ ?) and a text label. Colour is never the only signal.

**`section-rule`** — a 40×4px `{colors.accent}` pill above every H2. The one place deep pink appears on every page.

**Data bars** — `data-bar-track` (`{colors.hairline-light}`) holding a `data-bar` fill in indigo (or `{colors.shade-40}` for peer products). The bar for the product being viewed, or a score that crosses the notable-con line, switches to `data-bar-highlight` in `{colors.deep-pink}`. The number is always printed next to the bar; the bar is decoration.

**Sentiment bar** — one stacked bar per source: positive in indigo, neutral in `{colors.shade-30}`, negative in `{colors.deep-pink}`, with a text legend giving each percentage.

**`card-where-to-buy`** — `{colors.canvas-cream}` card in the review sidebar: price per store with the platform's own rating attributed to it, and the lowest price marked with a `pill-tag-blush`.

**`card-step-night`** and **`card-outline-night`** — on the cinematic track, numbered explainer cards sit on `{colors.surface-elevated-dark}`; link cards are outlined with a `{colors.hairline-dark}` border (`divider-night`) and brighten to `{colors.electric-aqua}` on hover.

**`caption-secondary`** and **`caption-tertiary`** — `{colors.shade-60}` at caption size for secondary copy (leads, labels, metadata), `{colors.shade-50}` for tertiary detail (counts in brackets, "deal-breaker" labels).

**`sample-banner`** — a thin `{colors.shade-70}` strip with `{colors.peach-fuzz}` micro text across the top of every page while the site runs on fictional sample data.

## Do's and Don'ts

### Do
- Reserve `{colors.powder-blush}` and `{colors.peach-fuzz}` for the light track only — they don't appear as fills on cinematic indigo pages.
- Reserve `{colors.electric-aqua}` for the night track only — it is unreadable on white.
- Use `{colors.deep-pink}` as a mark: rules, underlines, dots, data bars, display-size numbers.
- Always use `{rounded.pill}` for buttons; never `{rounded.md}` or `{rounded.lg}`.
- Render display tiers at weight 330; bumping to 400 or 500 breaks the brand's thin-display signature.
- Use full-bleed photography on cinematic pages — let it escape the container.
- Apply `font-feature-settings: "ss03"` globally; the stylistic set is the brand's typographic signature.
- Pair indigo canvas with white type and white-stroked outline pills; pair light canvas with indigo type and filled-indigo pills.

### Don't
- Don't introduce a third canvas color — stick to indigo night or white/cream. Neutral greys, beiges, and blues are not in the system; neutrals come from the indigo-tinted shade ladder.
- Don't add drop shadows on cinematic night cards beyond the subtle inset top-highlight; the cinematic track wants flat indigo.
- Don't shrink display tiers below `{typography.display-md}` (48px) on hero surfaces; below that they read as section heads, not display.
- Don't set body-size text in `{colors.deep-pink}`, or body-size text on a deep-pink fill — both are 3.8:1 or lower.
- Don't put text on the brand gradient.
- Don't replace the pill shape with a rounded-rectangle button anywhere.

## Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|---|---|---|
| Wide | ≥ 1440px | Full cinematic hero with edge-bleeding photography; pricing 4-up |
| Desktop | 1024–1440px | Default content max-width; pricing 4-up tightens |
| Tablet | 768–1023px | Pricing 2-up; cinematic hero photography crops |
| Mobile | < 768px | Pricing 1-up; hamburger nav; display-xxl drops to ~56–64px |

### Touch Targets
- Pill buttons hit ≥ 44×44px on mobile via 12px vertical padding × 16px line-height. WCAG AAA compliant.
- Form fields stay at the 44px minimum height across all breakpoints.

### Collapsing Strategy
- Display sizes scale down through the breakpoint stair: 96 → 70 → 55 → 48 → 36px on mobile.
- Cinematic photography crops aggressively at smaller widths, prioritizing focal subject over edge-bleed.
- Pricing tiers stair-step 4-up → 2-up → 1-up; the featured blush card stays visually distinguished at every step.
- Top nav collapses to hamburger below 768px; menu inherits canvas polarity.

### Image Behavior
Photography uses responsive `srcset` with art-direction crops at major breakpoints. Mobile crops favor close subjects; wide crops favor environmental / storefront context.

## Iteration Guide

1. Focus on ONE component at a time.
2. Reference component names and tokens directly (`{colors.powder-blush}`, `{button-primary-pill}-pressed`, `{rounded.pill}`).
3. Run `npx @google/design.md lint DESIGN.md` after edits.
4. Add new variants as separate entries.
5. Default body to `{typography.body-md}`; reserve `{typography.body-lg}` for marketing leads.
6. Keep the two canvas tracks separated. A page is transactional, optionally opened by a single cinematic band (nav + hero) that ends at the brand gradient strip. Never alternate indigo and light bands further down a page — a page that is indigo from top to bottom reads as a wall of colour.
7. The pill shape is non-negotiable; new button variants vary in fill / border / canvas, never in shape.
