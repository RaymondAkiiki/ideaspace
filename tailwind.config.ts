import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0a0a0a',
          2: '#3a3a3a',
          3: '#888888',
        },
        surface: {
          DEFAULT: '#ffffff',
          2: '#f7f7f5',
          3: '#f0efe9',
        },
        accent: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
          dark: '#92400e',
        },
        border: '#e5e4df',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      typography: {
        ideaspace: {
          css: {
            '--tw-prose-body': '#3a3a3a',
            '--tw-prose-headings': '#0a0a0a',
            maxWidth: '68ch',
          },
        },
      },
    },
  },
  plugins: [],
}
export default config
