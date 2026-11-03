/**
 * Hero Sculpture Image Assets
 *
 * When you generate the high-res transparent WebP images, place them in /public/hero/:
 * - money-sculpture-dark.webp (desktop, landscape ~2.5:1, ≥2400px wide, transparent background)
 * - money-sculpture-mobile-dark.webp (mobile, portrait ~3:4, ≥1400px wide, transparent background)
 *
 * Image generation prompt:
 * "Abstract sculpture of interwoven ribbons of polished champagne-gold metal and fine floating particles
 * forming a rising flowing curve, like a growth chart turned into liquid metal. Obsidian-black studio,
 * soft rim lighting, subtle indigo reflections, ultra-detailed, centered, wide 5:2 composition,
 * isolated on a transparent background. No text, no coins, no currency symbols, no dollar signs."
 */

export const HERO_IMAGES = {
  // SculptureHero mirror fallback URLs (high-quality transparent WebP)
  src: "https://cdn.21st.dev/assets/mirror/ae/ae8c3de9003460e59182e950ccd345f68f27f9d0e4808b64c92c962a4eca7120.webp",
  darkSrc: "https://cdn.21st.dev/assets/mirror/a1/a1fa387b6e417b26a25f317559c87cce4d241c1052c52a2b3bc2966b2aaf9b65.webp",
  mobileSrc: "https://cdn.21st.dev/assets/mirror/b0/b0c8d8e5d64b8cec906a3b390e3dc7c9a5af08334bf0632873c601782cb4bc46.webp",
  mobileDarkSrc: "https://cdn.21st.dev/assets/mirror/9a/9a82cb59be1bfde59855b79d7a565e487155a89f4d52eac74dcc10e267b2b6d1.webp",

  // To switch to your generated local assets, uncomment below:
  // src: "/hero/money-sculpture-dark.webp",
  // darkSrc: "/hero/money-sculpture-dark.webp",
  // mobileSrc: "/hero/money-sculpture-mobile-dark.webp",
  // mobileDarkSrc: "/hero/money-sculpture-mobile-dark.webp",
}
