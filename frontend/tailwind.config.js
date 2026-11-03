// tailwind.config.js — Lavender Dawn Theme for MoneyOS with Arial Typography
export default {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        // ── Gallery Alabaster Theme (Forma Vibe for Money OS) ───────
        gallery: {
          base:    '#EBE9E5',
          surface: '#FFFFFF',
          card:    '#F6F5F2',
          ink:     '#151514',
          muted:   '#6A6862',
          border:  'rgba(21, 21, 20, 0.08)',
          'border-strong': 'rgba(21, 21, 20, 0.16)',
          positive: '#2D7A58',
          negative: '#D94A4A',
          warning:  '#C87D2F',
        },

        // ── Obsidian & Champagne (Money OS Premium Design System) ──────
        obsidian: {
          base:    '#09090B',
          surface: '#131316',
          raised:  '#1B1B20',
          text:    '#F3F0E8',
          muted:   '#8F8B82',
          border:  'rgba(243,240,232,0.08)',
          'border-strong': 'rgba(243,240,232,0.16)',
        },
        champagne: {
          DEFAULT: '#D6B77C',
          muted:   'rgba(214,183,124,0.15)',
          glow:    'rgba(214,183,124,0.25)',
        },
        money: {
          positive: '#5EDAA4',
          negative: '#F2796E',
          warning:  '#F0B45A',
        },

        // ── Core surfaces ───────────────────────────────────
        background:      '#101010',
        sidebar:         '#141414',
        card:            '#181818',
        elevated:        '#222222',
        surface:         '#181818',

        // ── Lavender primary / accent ───────────────────────
        primary:         '#C3ABFA',
        primarySoft:     '#D5C5FF',
        primaryAccent:   '#C3ABFA',   // legacy alias
        accent:          '#C3ABFA',
        accentSoft:      '#D5C5FF',
        accentDeep:      '#8E6BE8',

        // ── Text ───────────────────────────────────────────
        foreground:      '#FAFAFA',
        primaryText:     '#FAFAFA',   // legacy alias
        secondaryText:   '#A3A3A3',
        mutedText:       '#737373',

        // ── Borders ────────────────────────────────────────
        border:          '#292929',
        divider:         '#292929',
        input:           '#202020',
        ring:            '#C3ABFA',

        // ── Financial semantic colors ───────────────────────
        positive:        '#70D6A3',   // income green
        negative:        '#F07891',   // expense pink
        transfer:        '#86B8F5',   // transfer blue
        warning:         '#E9BC68',   // warning amber

        // ── Chart series ───────────────────────────────────
        'chart-1':       '#C3ABFA',
        'chart-2':       '#A98AF4',
        'chart-3':       '#8E6BE8',
        'chart-4':       '#7552C8',
        'chart-5':       '#D5C5FF',
      },
      fontFamily: {
        serif:   ['"Instrument Serif"', 'Georgia', 'serif'],
        geist:   ['Geist', 'var(--font-sans)', 'Arial', 'sans-serif'],
        display: ['var(--font-display)', '"Playfair Display"', 'Georgia', 'serif'],
        sans:    ['var(--font-sans)', 'Arial', 'Helvetica', 'sans-serif'],
        mono:    ['"Geist Mono"', 'Arial', 'monospace'],
      },
      spacing: {
        1:  '0.25rem',  2:  '0.5rem',   3:  '0.75rem',
        4:  '1rem',     5:  '1.25rem',  6:  '1.5rem',
        8:  '2rem',     10: '2.5rem',   12: '3rem',
        16: '4rem',     20: '5rem',     24: '6rem',
        32: '8rem',     40: '10rem',    48: '12rem',
        56: '14rem',    64: '16rem',
      },
      borderWidth: { hairline: '1px' },
      boxShadow: {
        subtle:  '0 4px 12px rgba(0,0,0,0.4)',
        lavender: '0 4px 20px -2px rgba(195,171,250,0.2)',
        'top-highlight': 'inset 0 1px 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
};
