# Money OS — Sculpture Hero Assets Guide

The `SculptureHero` component reconstructs a 3D liquid particle field by sampling ~100k points directly from image pixels. Because it samples actual pixel color and alpha channels, image quality and transparent backgrounds are critical.

## Current Status
Currently, the hero uses the high-resolution fallback CDN assets configured in `lib/hero-images.ts`. 

## Image Files Needed
To switch to custom Money OS branding, create and place these files in `/public/hero/`:

1. **`money-sculpture-dark.webp`** *(Required)*
   - **Target**: Desktop viewports (landscape ~2.5:1 ratio)
   - **Resolution**: ≥ 2400px wide
   - **Format**: WebP with a **strictly transparent background** (alpha channel)

2. **`money-sculpture-mobile-dark.webp`** *(Optional but recommended)*
   - **Target**: Phone and portrait viewports (~3:4 ratio)
   - **Resolution**: ≥ 1400px wide
   - **Format**: WebP with a **strictly transparent background**

---

## Midjourney / DALL-E / Flux Image Generation Prompt

Use this exact prompt to generate the asset:

> **"Abstract sculpture of interwoven ribbons of polished champagne-gold metal and fine floating particles forming a rising flowing curve, like a growth chart turned into liquid metal. Obsidian-black studio, soft rim lighting, subtle indigo reflections, ultra-detailed, centered, wide 5:2 composition, isolated on a transparent background. No text, no coins, no currency symbols, no dollar signs."**

---

## Activating Your Custom Images
Once the WebP files are placed in `/public/hero/`, open `lib/hero-images.ts` (or `frontend/src/lib/hero-images.ts`) and uncomment the local paths:

```ts
export const HERO_IMAGES = {
  src: "/hero/money-sculpture-dark.webp",
  darkSrc: "/hero/money-sculpture-dark.webp",
  mobileSrc: "/hero/money-sculpture-mobile-dark.webp",
  mobileDarkSrc: "/hero/money-sculpture-mobile-dark.webp",
};
```
