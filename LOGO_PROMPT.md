# Play11 — Logo prompts for Gemini (Nano Banana / Imagen)

You already have a built-in vector logo in the site (`public/play11-logo.svg` and
the `<Logo />` component). Use the prompts below in **Gemini** if you want a
custom, AI-generated logo to replace it.

> Tip: generate on a plain background, ask for **transparent PNG + SVG**, and
> request a few variations. Then drop the file into `public/` and point the
> navbar/footer at it.

---

## ⭐ Main prompt (premium emblem — recommended)

```
Design a premium, modern logo for "Play11", an Indian online football (soccer)
jersey brand. Style: luxury sports brand, sleek and minimal, high-end.

Concept: a sleek shield/badge emblem containing a bold stylized number "11"
formed by two clean vertical jersey stripes, with a small geometric football
integrated beside it and subtle motion/speed lines. Pair the emblem with the
wordmark "PLAY11" in a strong condensed athletic sans-serif (Anton / Bebas Neue
style), with "11" highlighted.

Colors: deep matte black background (#0A0A0B) with a metallic gold gradient
(#E0C486 → #C8A24A → #9C7A2E). Optional tagline "WEAR THE LEGEND" in small
spaced-out light grey letters under the wordmark.

Requirements: flat vector look, crisp edges, perfectly balanced, scalable,
works as a small app icon and a large header. Provide a transparent background
version. No photo, no realistic textures, no gradients banding, no clutter.
```

---

## Variation A — Icon / app mark only

```
A minimal vector app icon for "Play11" football jersey brand: a rounded shield
badge on deep black, containing a bold metallic-gold "11" made of two jersey
stripes and a tiny football. Flat, premium, symmetrical, centered, transparent
background, no text. Gold gradient #E0C486 to #9C7A2E.
```

## Variation B — Monogram

```
Elegant monogram logo combining the letter "P" and "11" into a single clever
mark for a premium football jersey brand called Play11. Metallic gold on black,
geometric, minimal, vector, luxury sportswear aesthetic, transparent background.
```

## Variation C — Dynamic / energetic

```
A bold dynamic logo for "Play11" sports jersey brand: condensed italic wordmark
"PLAY11" with a swoosh/motion streak through it and a football replacing the dot
detail, gold-on-black, aggressive and energetic but premium, vector, flat,
transparent background.
```

---

## How to use the result in the site
1. Save the exported PNG/SVG into the `public/` folder, e.g. `public/logo.png`.
2. In `src/components/Navbar.jsx` and `src/components/Footer.jsx`, replace the
   `<Logo />` / text wordmark with:
   `<img src="/logo.png" alt="Play11" style={{ height: 36 }} />`
3. For the browser tab icon, replace `public/favicon.svg` with your new mark.

Brand palette to keep things consistent:
- Black: `#0A0A0B`  ·  Card: `#15161A`
- Gold: `#C8A24A`  ·  Light gold: `#E0C486`
- Text: `#F4F4F6`  ·  Muted: `#9A9DA8`
- Display font: **Anton** / **Bebas Neue**  ·  Body font: **Inter**
```
